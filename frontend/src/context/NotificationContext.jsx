import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children, user }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            // In a real app, we'd use the auth token. Here we pass userId as query param.
            // We need to ensure the backend endpoint exists and accepts this.
            // Assuming the backend is running on the configured port.
            // We use the relative path assuming proxy or base URL is set.
            // If not, we might need the full URL.
            // Based on api.js, it seems we use a configured instance. 
            // But here I'll use a direct call or import the api instance if possible.
            // Let's assume we can use the same base URL logic.

            // Actually, let's use the API_URL from config or relative path if proxy is set.
            // For now, I'll use relative path '/api/notifications'

            const response = await axios.get(`http://localhost:5156/api/notifications?userId=${user.id}`);
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5156/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            await axios.put(`http://localhost:5156/api/notifications/read-all?userId=${user.id}`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    // Poll for notifications every 60 seconds
    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user, fetchNotifications]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, refresh: fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
