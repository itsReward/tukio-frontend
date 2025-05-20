import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

/**
 * Custom hook to use the notification context
 * @returns {Object} Notification context
 */
export const useNotifications = () => {
    const context = useContext(NotificationContext);

    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }

    return context;
};

export default useNotifications;

