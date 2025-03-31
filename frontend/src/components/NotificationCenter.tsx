import React from 'react';
import { useNotification, Notification } from './NotificationContext';

const NotificationItem: React.FC<{
  notification: Notification;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  const { id, type, title, message, actionText } = notification;

  // Get background and text colors based on notification type
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-green text-green-dark border-l-4 shadow-[0_0_15px_rgba(34,111,84,0.3)]';
      case 'error':
        return 'bg-white border-red text-accent-red border-l-4 shadow-[0_0_15px_rgba(167,31,19,0.3)]';
      case 'warning':
        return 'bg-white border-yellow-600 text-yellow-600 border-l-4 shadow-[0_0_15px_rgba(253,204,73,0.3)]';
      case 'info':
      default:
        return 'bg-white border-blue-500 text-blue-500 border-l-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
    }
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
    }
  };

  return (
    <div 
      className={`${getStyles()} p-4 mb-3 rounded-md transform transition-all duration-300 animate-fadeIn`}
      style={{animation: 'slideIn 0.3s ease-out forwards'}}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="ml-3 w-full">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-black-700">{title}</h3>
            <button
              onClick={() => onClose(id)}
              className="ml-2 text-gray-600 hover:text-gray-800 focus:outline-none transition-opacity"
              aria-label="Close notification"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-1 text-xs text-gray-700">{message}</div>
          {actionText && (
            <div className="mt-3">
              <button
                onClick={() => onClose(id)}
                className={`px-3 py-1 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  type === 'success' ? 'bg-green text-white hover:bg-opacity-90' :
                  type === 'error' ? 'bg-red text-white hover:bg-opacity-90' :
                  type === 'warning' ? 'bg-yellow-600 text-white hover:bg-opacity-90' :
                  'bg-blue-500 text-white hover:bg-opacity-90'
                }`}
              >
                {actionText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md transition-all duration-300 pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

// Add global styles at the root level
const style = document.createElement('style');
style.innerHTML = `
  @keyframes slideIn {
    0% {
      opacity: 0;
      transform: translateX(30px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeOut {
    0% {
      opacity: 1;
      transform: translateX(0);
    }
    100% {
      opacity: 0;
      transform: translateX(30px);
    }
  }
`;
document.head.appendChild(style);

export default NotificationCenter; 