import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTokenContext } from './TokenContext';

// Define notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Define notification object structure
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title: string;
  actionText?: string;
  actionData?: any;
  actionCallback?: () => void;
  autoClose?: boolean;
  duration?: number;
}

// Define context interface
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider props
interface NotificationProviderProps {
  children: ReactNode;
}

// Create the provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  // Add notification to the list
  const addNotification = (notification: Omit<Notification, 'id'>): string => {
    const id = Math.random().toString(36).substring(2, 15);
    const newNotification = { 
      ...notification, 
      id,
      autoClose: notification.autoClose ?? false,
      duration: notification.duration ?? 5000
    };
    
    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove notification after duration if autoClose is true
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  // Remove notification from the list
  const removeNotification = (id: string) => {
    // Execute callback if exists before removing
    const notification = notifications.find(n => n.id === id);
    if (notification && notification.actionCallback) {
      notification.actionCallback();
    }
    
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Create the context value
  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Helper functions for common notification types
export const useNotificationHelpers = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { user } = useTokenContext();

  const notifyAuctionWon = (auctionData: any, finalPrice: number) => {
    console.log('Creating auction won notification with data:', auctionData, 'and price:', finalPrice);
    
    console.log('Current user for notification:', user);
    
    // Normalize auction data to ensure consistent structure
    const normalizedAuction = {
      ...auctionData,
      item: auctionData.item || { name: auctionData.name || "Unknown Item" },
      name: auctionData.name || auctionData.item?.name || "Unknown Item",
      price: finalPrice || auctionData.price || 0,
      auction_type: auctionData.auction_type || auctionData.auctionType || "Unknown",
      slug: auctionData.slug || auctionData.raw?.slug || auctionData.id
    };
    
    console.log('Normalized auction data for notification:', normalizedAuction);
    
    return addNotification({
      type: 'success',
      title: 'Auction Won!',
      message: `Congratulations! You've won the auction for ${normalizedAuction.name}!`,
      actionText: 'View Details',
      actionData: { auction: normalizedAuction, isWinner: true, finalPrice, user },
      actionCallback: () => {
        // Explicitly include the user and ensure finalPrice is a number
        const numericFinalPrice = Number(finalPrice);
        console.log('Navigating to auction-ended with price:', numericFinalPrice);
        navigate('/auction-ended', { 
          state: { 
            auction: normalizedAuction, 
            isWinner: true,
            finalPrice: numericFinalPrice,
            user: user
          }
        });
      },
      autoClose: false
    });
  };

  return {
    notifyAuctionWon
  };
};

export default NotificationContext; 