import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTokenContext } from './TokenContext';
import { useNotificationHelpers } from './NotificationContext';

// Define the context interface
interface SocketContextType {
  socket: Socket | null;
}

// Create the context
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Provider props
interface SocketProviderProps {
  children: ReactNode;
}

// Create the provider component
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useTokenContext();
  const { notifyAuctionWon } = useNotificationHelpers();
  
  // Track processed notification events to prevent duplicates
  const processedNotifications = useRef<Set<string>>(new Set());
  
  // Helper function to check if we've already processed this notification
  const hasProcessedNotification = (auctionId: string, eventType: string): boolean => {
    const eventKey = `${auctionId}_${eventType}`;
    if (processedNotifications.current.has(eventKey)) {
      console.log(`Skipping duplicate notification: ${eventKey}`);
      return true;
    }
    
    // Add to processed notifications
    processedNotifications.current.add(eventKey);
    
    // Limit set size to prevent memory issues
    if (processedNotifications.current.size > 100) {
      processedNotifications.current = new Set();
    }
    
    return false;
  };

  // Initialize socket connection
  useEffect(() => {
    console.log('Initializing global socket connection');
    
    // Create socket connection with better configuration
    const newSocket = io('http://localhost:5001', {
      transports: ['websocket', 'polling'],  // Try websocket first, fall back to polling if needed
      reconnectionAttempts: 10,             // Try to reconnect 10 times
      reconnectionDelay: 1000,              // Start with a 1-second delay
      reconnectionDelayMax: 5000,           // Maximum 5-second delay
      timeout: 20000,                       // 20-second timeout
      autoConnect: true,                    // Connect automatically
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected successfully:', newSocket.id);
      
      // Send a test message to verify two-way communication
      newSocket.emit('test_connection', { client: 'frontend', timestamp: Date.now() }, (response: any) => {
        console.log('Server acknowledged test connection:', response);
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        console.log('Attempting to reconnect...');
        newSocket.connect();
      }
    });
    
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
    });
    
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Socket reconnection attempt #${attemptNumber}`);
    });
    
    newSocket.on('reconnect_error', (error) => {
      console.error('❌ Socket reconnection error:', error);
    });
    
    newSocket.on('reconnect_failed', () => {
      console.error('❌ Socket failed to reconnect after all attempts');
      
      // After all automatic reconnect attempts have failed, 
      // try one more time after a delay
      setTimeout(() => {
        console.log('🔄 Manual reconnection attempt...');
        newSocket.connect();
      }, 10000);
    });
    
    newSocket.io.on('error', (error) => {
      console.error('❌ Socket.IO error:', error);
    });

    // Set the socket in state
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting global socket');
      newSocket.disconnect();
    };
  }, []);

  // Add a heartbeat effect to detect connection issues
  useEffect(() => {
    if (!socket) return;
    
    // Set up a heartbeat interval to verify the connection is still alive
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        console.log('💓 Socket heartbeat: connected');
      } else {
        console.warn('💔 Socket heartbeat: disconnected, attempting to reconnect');
        socket.connect();
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [socket]);

  // Set up event listeners for auction events
  useEffect(() => {
    if (!socket) {
      console.log('No socket available yet, skipping event setup');
      return;
    }

    console.log('Setting up auction event listeners. User:', user ? `${user.id} (${user.username})` : 'Not logged in');

    // Listen for auction expired events
    socket.on('auction_expired', (data: any) => {
      console.log('🏁 AUCTION EXPIRED EVENT RECEIVED! Full data:', JSON.stringify(data));
      console.log('Current user information:', user ? `ID: ${user.id}, Username: ${user.username}` : 'Not logged in');
      console.log('Winner information from event:', data.winner);
      
      // Always show notification for debugging
      console.log('WINNER COMPARISON:', {
        'user_id': user?.id,
        'data_winner': data.winner,
        'match': user?.id === data.winner,
        'string_match': String(user?.id) === String(data.winner)
      });

      // Try both direct comparison and string comparison since IDs might be different types
      const isWinner = user?.id === data.winner || String(user?.id) === String(data.winner);
      
      // During development, show notifications to all users for testing
      const shouldShowNotification = isWinner || import.meta.env.DEV;
      
      if (shouldShowNotification) {
        if (isWinner) {
          console.log('🎉 CURRENT USER IS THE WINNER! Showing notification...');
        } else {
          console.log('🧪 TEST MODE: Showing notification to non-winner for debugging');
        }
        
        // Check if we've already processed a notification for this auction
        if (data.auction_id && hasProcessedNotification(data.auction_id, 'expired')) {
          return;
        } else if (!data.auction_id) {
          console.warn('⚠️ Missing auction_id in expired event, cannot deduplicate');
        }
        
        // Fetch auction details using slug instead of ID
        const auctionSlug = data.auction_slug;
        console.log(`Fetching auction details by slug: ${auctionSlug}`);
        
        fetch(`${import.meta.env.VITE_API_URL}/catalog/${auctionSlug}`)
          .then(res => {
            console.log('Auction details response status:', res.status);
            if (!res.ok) {
              throw new Error(`Auction fetch failed with status: ${res.status}`);
            }
            return res.json();
          })
          .then(auctionData => {
            console.log('Auction details received:', JSON.stringify(auctionData));
            if (auctionData.auction) {
              const finalPrice = auctionData.auction?.event?.price || 0;
              console.log(`Showing notification for auction "${auctionData.auction.item?.name || 'Unknown'}" with price ${finalPrice}`);
              
              // Format the auction data to have a consistent structure before passing to notification
              const formattedAuction = {
                ...auctionData.auction,
                name: auctionData.auction.item?.name,
                price: finalPrice
              };
              
              console.log('Final price for notification:', finalPrice, 'Type:', typeof finalPrice);
              // Make sure finalPrice is a number
              const numericFinalPrice = Number(finalPrice);
              notifyAuctionWon(formattedAuction, numericFinalPrice);
            } else {
              // If we have auction slug but no details, still show notification with basic info
              console.log('No auction details available, showing basic notification');
              notifyAuctionWon({
                id: data.auction_id,
                slug: auctionSlug,
                name: "Auction Item",
                price: 0
              }, 0);
            }
          })
          .catch(err => {
            console.error('Error fetching auction details for notification:', err);
            // Show a basic notification even if we couldn't get the details
            console.log('Error occurred, showing fallback notification');
            notifyAuctionWon({
              id: data.auction_id,
              slug: auctionSlug,
              name: "Auction Item",
              price: 0
            }, 0);
          });
      }
    });

    // Also listen for direct auction won events
    socket.on('auction_won', (data: any) => {
      console.log('🏆 AUCTION WON EVENT RECEIVED!', data);
      console.log('DIRECT WIN COMPARISON:', {
        'user_id': user?.id,
        'data_winner_id': data.winner_id,
        'match': user?.id === data.winner_id,
        'string_match': String(user?.id) === String(data.winner_id)
      });
      
      // Try both direct comparison and string comparison since IDs might be different types
      const isWinner = user && data.winner_id && 
        (user.id === data.winner_id || String(user.id) === String(data.winner_id));
        
      if (isWinner) {
        console.log('DIRECT WIN EVENT - This user is the winner!');
        
        // Check if we've already processed a notification for this auction
        if (hasProcessedNotification(data.auction_id, 'won')) {
          return;
        }
        
        // If the event includes the full auction data, use it directly
        if (data.auction) {
          console.log('Using auction data from the event');
          const finalPrice = data.final_price || data.auction.event?.price || 0;
          
          // Ensure the auction has a consistent format before passing to notification
          const formattedAuction = {
            ...data.auction,
            name: data.auction.item?.name || data.auction.name || "Auction Item",
            price: finalPrice,
            slug: data.auction.slug || data.auction_slug,
            auction_type: data.auction.auction_type || data.auction.auctionType || "Unknown"
          };
          
          console.log('Final price for notification:', finalPrice, 'Type:', typeof finalPrice);
          // Make sure finalPrice is a number
          const numericFinalPrice = Number(finalPrice);
          notifyAuctionWon(formattedAuction, numericFinalPrice);
        }
        // Otherwise fetch the auction data using slug
        else if (data.auction_slug) {
          console.log(`Fetching auction details by slug: ${data.auction_slug}`);
          fetch(`${import.meta.env.VITE_API_URL}/catalog/${data.auction_slug}`)
            .then(res => {
              if (!res.ok) {
                throw new Error(`Failed to fetch auction details with status: ${res.status}`);
              }
              return res.json();
            })
            .then(auctionData => {
              console.log('Fetched auction data:', auctionData);
              if (auctionData.auction) {
                const finalPrice = data.final_price || auctionData.auction.event?.price || 0;
                
                // Ensure the auction has a consistent format before passing to notification
                const formattedAuction = {
                  ...auctionData.auction,
                  name: auctionData.auction.item?.name || auctionData.auction.name || "Auction Item",
                  price: finalPrice,
                  auction_type: auctionData.auction.auction_type || "Unknown"
                };
                
                console.log('Final price for notification:', finalPrice, 'Type:', typeof finalPrice);
                // Make sure finalPrice is a number
                const numericFinalPrice = Number(finalPrice);
                notifyAuctionWon(formattedAuction, numericFinalPrice);
              } else {
                // Fallback notification with basic info
                notifyAuctionWon({
                  id: data.auction_id,
                  slug: data.auction_slug,
                  name: "Auction Item",
                  price: data.final_price || 0
                }, data.final_price || 0);
              }
            })
            .catch(err => {
              console.error('Error fetching auction details for win notification:', err);
              notifyAuctionWon({
                id: data.auction_id,
                slug: data.auction_slug,
                name: "Auction Item",
                price: data.final_price || 0
              }, data.final_price || 0);
            });
        }
        // Last resort if no slug is available
        else {
          console.log('No auction slug available, showing basic notification');
          notifyAuctionWon({
            id: data.auction_id,
            name: "Auction Item",
            price: data.final_price || 0
          }, data.final_price || 0);
        }
      }
    });

    return () => {
      console.log('Cleaning up auction event listeners');
      socket.off('auction_expired');
      socket.off('auction_won');
    };
  }, [socket, user, notifyAuctionWon]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext; 