import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  const { user, token } = useTokenContext();
  const { notifyAuctionWon } = useNotificationHelpers();

  // Initialize socket connection
  useEffect(() => {
    console.log('Initializing global socket connection');
    
    // Create socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Global socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Global socket connection error:', error);
    });

    // Set the socket in state
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting global socket');
      newSocket.disconnect();
    };
  }, []);

  // Set up event listeners for auction events
  useEffect(() => {
    if (!socket) {
      console.log('No socket available yet, skipping event setup');
      return;
    }

    console.log('Setting up auction event listeners. User:', user ? `${user.id} (${user.username})` : 'Not logged in');

    // Listen for auction expired events
    socket.on('auction_expired', (data: any) => {
      console.log('AUCTION EXPIRED EVENT RECEIVED! Full data:', JSON.stringify(data));
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
      
      if (user && data.winner && isWinner) {
        console.log('CURRENT USER IS THE WINNER! Showing notification...');
        
        // Fetch auction details using slug instead of ID
        const auctionSlug = data.auction_slug;
        console.log(`Fetching auction details by slug: ${auctionSlug}`);
        
        fetch(`http://localhost:5000/catalog/${auctionSlug}`)
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
      } else if (data.winner) {
        // Not the winner, but show notification for testing
        console.log('USER IS NOT THE WINNER. Winner ID:', data.winner);
        
        // For testing only - show a notification to everyone so we can verify the system works
        if (import.meta.env.DEV) {
          console.log('TEST MODE: Showing test notification to non-winner for debugging');
          notifyAuctionWon({
            id: data.auction_id,
            name: "TEST NOTIFICATION - You would not normally see this",
            price: 0
          }, 0);
        }
      }
    });

    // Also listen for direct auction won events
    socket.on('auction_won', (data: any) => {
      console.log('AUCTION WON EVENT RECEIVED!', data);
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
          fetch(`http://localhost:5000/catalog/${data.auction_slug}`)
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