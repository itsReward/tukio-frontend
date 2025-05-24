import api from './api';

const NOTIFICATION_ENDPOINTS = {
    NOTIFICATIONS: 'tukio-notification-service/api/notifications',
    PREFERENCES: 'tukio-notification-service/api/notification-preferences',
    TEMPLATES: 'tukio-notification-service/api/notification-templates',
};

/**
 * Complete Notification Service for handling notification-related API calls
 * Fixed version with proper error handling and fallbacks
 */
class NotificationService {
    constructor() {
        this.wsConnection = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.heartbeatInterval = null;
        this.isConnecting = false;
    }

    // ========== Core Notification Management ==========

    async createNotification(notificationData) {
        return await api.post(NOTIFICATION_ENDPOINTS.NOTIFICATIONS, notificationData);
    }

    async getUserNotifications(userId, options = {}) {
        const {
            status,
            channel,
            page = 0,
            size = 10,
            sort = 'createdAt,desc'
        } = options;

        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort
        });

        if (status) params.append('status', status);
        if (channel) params.append('channel', channel);

        return await api.get(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/user/${userId}?${params}`);
    }

    async getMyNotifications(options = {}) {
        const {
            status,
            channel,
            page = 0,
            size = 10,
            sort = 'createdAt,desc'
        } = options;

        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort
        });

        if (status) params.append('status', status);
        if (channel) params.append('channel', channel);

        return await api.get(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/me?${params}`);
    }

    async getNotificationById(id) {
        return await api.get(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/${id}`);
    }

    async markAsRead(notificationId, userId) {
        return await api.put(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read?userId=${userId}`);
    }

    async getUnreadCount(userId) {
        return await api.get(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/user/${userId}/unread-count`);
    }

    async deleteNotification(notificationId, userId) {
        return await api.delete(`${NOTIFICATION_ENDPOINTS.NOTIFICATIONS}/${notificationId}?userId=${userId}`);
    }

    // ========== Notification Preferences ==========

    async getUserPreferences(userId) {
        return await api.get(`${NOTIFICATION_ENDPOINTS.PREFERENCES}/user/${userId}`);
    }

    async getSpecificPreference(userId, notificationType) {
        return await api.get(`${NOTIFICATION_ENDPOINTS.PREFERENCES}/user/${userId}/type/${notificationType}`);
    }

    async updatePreference(userId, notificationType, preferences) {
        return await api.put(
            `${NOTIFICATION_ENDPOINTS.PREFERENCES}/user/${userId}/type/${notificationType}`,
            preferences
        );
    }

    async initializeDefaultPreferences(userId) {
        return await api.post(`${NOTIFICATION_ENDPOINTS.PREFERENCES}/user/${userId}/initialize`);
    }

    // ========== Notification Templates (Admin) ==========

    async getAllTemplates() {
        return await api.get(NOTIFICATION_ENDPOINTS.TEMPLATES);
    }

    async getTemplatesByChannel(channel) {
        return await api.get(`${NOTIFICATION_ENDPOINTS.TEMPLATES}/channel/${channel}`);
    }

    async getTemplateById(id) {
        return await api.get(`${NOTIFICATION_ENDPOINTS.TEMPLATES}/${id}`);
    }

    async createTemplate(templateData) {
        return await api.post(NOTIFICATION_ENDPOINTS.TEMPLATES, templateData);
    }

    async updateTemplate(id, templateData) {
        return await api.put(`${NOTIFICATION_ENDPOINTS.TEMPLATES}/${id}`, templateData);
    }

    async deleteTemplate(id) {
        return await api.delete(`${NOTIFICATION_ENDPOINTS.TEMPLATES}/${id}`);
    }

    // ========== Event-specific Helper Methods ==========

    async sendEventRegistrationConfirmation(eventData) {
        const notificationData = {
            userId: eventData.userId,
            templateKey: 'EVENT_REGISTRATION_CONFIRMATION_EMAIL',
            templateData: {
                userName: eventData.userName,
                eventName: eventData.eventName,
                eventDate: eventData.eventDate,
                eventTime: eventData.eventTime,
                eventLocation: eventData.eventLocation
            },
            channels: ['EMAIL', 'IN_APP'],
            notificationType: 'EVENT_REGISTRATION',
            referenceId: eventData.eventId,
            referenceType: 'EVENT'
        };

        return await this.createNotification(notificationData);
    }

    async sendEventReminder(eventData) {
        const notificationData = {
            userId: eventData.userId,
            templateKey: 'EVENT_REMINDER_EMAIL',
            templateData: {
                userName: eventData.userName,
                eventName: eventData.eventName,
                eventDate: eventData.eventDate,
                eventTime: eventData.eventTime,
                eventLocation: eventData.eventLocation
            },
            channels: ['EMAIL', 'PUSH', 'IN_APP'],
            notificationType: 'EVENT_REMINDER',
            referenceId: eventData.eventId,
            referenceType: 'EVENT'
        };

        return await this.createNotification(notificationData);
    }

    async sendEventCancellation(eventData) {
        const notificationData = {
            userId: eventData.userId,
            templateKey: 'EVENT_CANCELLATION_EMAIL',
            templateData: {
                userName: eventData.userName,
                eventName: eventData.eventName,
                eventDate: eventData.eventDate,
                eventTime: eventData.eventTime,
                reason: eventData.reason || 'Unforeseen circumstances'
            },
            channels: ['EMAIL', 'PUSH', 'IN_APP'],
            notificationType: 'EVENT_CANCELLATION',
            referenceId: eventData.eventId,
            referenceType: 'EVENT'
        };

        return await this.createNotification(notificationData);
    }

    async sendEventUpdate(eventData) {
        const notificationData = {
            userId: eventData.userId,
            templateKey: 'EVENT_UPDATE_EMAIL',
            templateData: {
                userName: eventData.userName,
                eventName: eventData.eventName,
                changes: eventData.changes,
                eventDate: eventData.eventDate,
                eventTime: eventData.eventTime,
                eventLocation: eventData.eventLocation
            },
            channels: ['EMAIL', 'IN_APP'],
            notificationType: 'EVENT_UPDATE',
            referenceId: eventData.eventId,
            referenceType: 'EVENT'
        };

        return await this.createNotification(notificationData);
    }

    async sendVenueChange(eventData) {
        const notificationData = {
            userId: eventData.userId,
            templateKey: 'VENUE_CHANGE_EMAIL',
            templateData: {
                userName: eventData.userName,
                eventName: eventData.eventName,
                oldLocation: eventData.oldLocation,
                newLocation: eventData.newLocation,
                eventDate: eventData.eventDate,
                eventTime: eventData.eventTime
            },
            channels: ['EMAIL', 'PUSH', 'IN_APP'],
            notificationType: 'VENUE_CHANGE',
            referenceId: eventData.eventId,
            referenceType: 'EVENT'
        };

        return await this.createNotification(notificationData);
    }

    // ========== WebSocket Connection Management with Proper Error Handling ==========

    /**
     * Initialize WebSocket connection with fallback handling
     */
    initializeWebSocket(onNotificationReceived, onConnectionStateChange = null) {
        try {
            const isMockMode = localStorage.getItem('useMockApi') === 'true';

            if (isMockMode) {
                return this.initializeMockWebSocket(onNotificationReceived, onConnectionStateChange);
            } else {
                return this.initializeRealWebSocket(onNotificationReceived, onConnectionStateChange);
            }
        } catch (error) {
            console.error('Failed to initialize WebSocket connection:', error);
            if (onConnectionStateChange) {
                onConnectionStateChange('error', error);
            }
            return this.createFallbackConnection();
        }
    }

    /**
     * Create fallback connection object when WebSocket fails
     */
    createFallbackConnection() {
        return {
            client: null,
            disconnect: () => {},
            reconnect: () => {},
            getConnectionState: () => 'disconnected',
            sendTestNotification: () => {
                console.warn('WebSocket not available - test notification ignored');
            }
        };
    }

    /**
     * Initialize real WebSocket with proper dependency checking
     */
    initializeRealWebSocket(onNotificationReceived, onConnectionStateChange) {
        try {
            // Try to import real WebSocket libraries
            const SockJS = this.tryImport('sockjs-client');
            const StompJs = this.tryImport('@stomp/stompjs');

            if (!SockJS || !StompJs) {
                console.warn('Real WebSocket libraries not available, falling back to mock');
                return this.initializeMockWebSocket(onNotificationReceived, onConnectionStateChange);
            }

            const wsUrl = import.meta.env.VITE_NOTIFICATION_WS_URL || 'http://localhost:8086/ws';
            let stompClient = null;
            let subscription = null;

            // Create STOMP client
            stompClient = new StompJs.Client({
                webSocketFactory: () => new SockJS(wsUrl),
                debug: (str) => {
                    if (import.meta.env.DEV) {
                        console.log('STOMP Debug:', str);
                    }
                },
                reconnectDelay: this.reconnectDelay,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: (frame) => {
                    console.log('Connected to notification WebSocket:', frame);
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000;

                    if (onConnectionStateChange) {
                        onConnectionStateChange('connected', frame);
                    }

                    const token = localStorage.getItem('token');
                    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                    subscription = stompClient.subscribe(
                        '/user/queue/notifications',
                        (message) => {
                            try {
                                const notification = JSON.parse(message.body);
                                console.log('Received notification:', notification);
                                onNotificationReceived(notification);
                            } catch (error) {
                                console.error('Error parsing notification message:', error);
                            }
                        },
                        headers
                    );

                    this.startHeartbeat(stompClient);
                },
                onDisconnect: (frame) => {
                    console.log('Disconnected from notification WebSocket:', frame);
                    this.stopHeartbeat();

                    if (onConnectionStateChange) {
                        onConnectionStateChange('disconnected', frame);
                    }
                },
                onStompError: (frame) => {
                    console.error('STOMP error:', frame);

                    if (onConnectionStateChange) {
                        onConnectionStateChange('error', frame);
                    }

                    this.handleReconnection(stompClient, onConnectionStateChange);
                },
                onWebSocketError: (error) => {
                    console.error('WebSocket error:', error);

                    if (onConnectionStateChange) {
                        onConnectionStateChange('error', error);
                    }
                }
            });

            stompClient.activate();

            return {
                client: stompClient,
                disconnect: () => {
                    this.stopHeartbeat();
                    if (subscription) {
                        subscription.unsubscribe();
                        subscription = null;
                    }
                    if (stompClient && stompClient.connected) {
                        stompClient.deactivate();
                    }
                    console.log('WebSocket connection closed');
                },
                reconnect: () => {
                    this.reconnectAttempts = 0;
                    if (stompClient) {
                        stompClient.activate();
                    }
                },
                getConnectionState: () => {
                    if (!stompClient) return 'disconnected';
                    return stompClient.connected ? 'connected' : 'disconnected';
                },
                sendMessage: (destination, body, headers = {}) => {
                    if (stompClient && stompClient.connected) {
                        stompClient.publish({
                            destination,
                            body: JSON.stringify(body),
                            headers
                        });
                    } else {
                        console.warn('Cannot send message: WebSocket not connected');
                    }
                }
            };
        } catch (error) {
            console.error('Error initializing real WebSocket:', error);
            return this.initializeMockWebSocket(onNotificationReceived, onConnectionStateChange);
        }
    }

    /**
     * Initialize mock WebSocket for development
     */
    initializeMockWebSocket(onNotificationReceived, onConnectionStateChange) {
        try {
            // Import mock WebSocket
            const mockWS = this.tryImportMock();

            if (!mockWS) {
                console.warn('Mock WebSocket not available, creating minimal fallback');
                return this.createMinimalMockConnection(onNotificationReceived, onConnectionStateChange);
            }

            const socket = new mockWS.SockJS('ws://localhost:8086/ws');
            const stompClient = mockWS.Stomp.over(socket);

            setTimeout(() => {
                if (onConnectionStateChange) {
                    onConnectionStateChange('connecting');
                }
            }, 100);

            stompClient.connect({}, function (frame) {
                console.log('Connected to notification WebSocket (mock):', frame);

                if (onConnectionStateChange) {
                    onConnectionStateChange('connected', frame);
                }

                stompClient.subscribe('/user/queue/notifications', function (message) {
                    const notification = JSON.parse(message.body);
                    onNotificationReceived(notification);
                });
            });

            return {
                client: stompClient,
                disconnect: () => {
                    stompClient.disconnect();
                    if (onConnectionStateChange) {
                        onConnectionStateChange('disconnected');
                    }
                },
                reconnect: () => {
                    setTimeout(() => {
                        if (onConnectionStateChange) {
                            onConnectionStateChange('connected');
                        }
                    }, 1000);
                },
                getConnectionState: () => 'connected',
                sendTestNotification: (data) => {
                    if (stompClient.sendTestNotification) {
                        stompClient.sendTestNotification(data);
                    }
                }
            };
        } catch (error) {
            console.error('Error initializing mock WebSocket:', error);
            return this.createMinimalMockConnection(onNotificationReceived, onConnectionStateChange);
        }
    }

    /**
     * Create minimal mock connection when imports fail
     */
    createMinimalMockConnection(onNotificationReceived, onConnectionStateChange) {
        // Simulate connection after delay
        setTimeout(() => {
            if (onConnectionStateChange) {
                onConnectionStateChange('connected');
            }

            // Send a welcome notification
            setTimeout(() => {
                onNotificationReceived({
                    id: 'welcome-' + Date.now(),
                    userId: 1,
                    title: 'Welcome to Tukio!',
                    content: 'Notifications are working in fallback mode.',
                    notificationType: 'SYSTEM_ANNOUNCEMENT',
                    channel: 'IN_APP',
                    status: 'DELIVERED',
                    referenceId: null,
                    referenceType: null,
                    sentAt: new Date().toISOString(),
                    deliveredAt: new Date().toISOString(),
                    readAt: null,
                    createdAt: new Date().toISOString()
                });
            }, 2000);
        }, 1000);

        return {
            client: null,
            disconnect: () => {
                if (onConnectionStateChange) {
                    onConnectionStateChange('disconnected');
                }
            },
            reconnect: () => {
                setTimeout(() => {
                    if (onConnectionStateChange) {
                        onConnectionStateChange('connected');
                    }
                }, 1000);
            },
            getConnectionState: () => 'connected',
            sendTestNotification: (data) => {
                // Simulate test notification
                setTimeout(() => {
                    onNotificationReceived({
                        id: 'test-' + Date.now(),
                        userId: 1,
                        title: data.title || 'Test Notification',
                        content: data.content || 'This is a test notification',
                        notificationType: data.type || 'SYSTEM_ANNOUNCEMENT',
                        channel: 'IN_APP',
                        status: 'DELIVERED',
                        referenceId: data.referenceId || null,
                        referenceType: data.referenceType || null,
                        sentAt: new Date().toISOString(),
                        deliveredAt: new Date().toISOString(),
                        readAt: null,
                        createdAt: new Date().toISOString()
                    });
                }, 500);
            }
        };
    }

    /**
     * Try to import a module with error handling
     */
    tryImport(moduleName) {
        try {
            return require(moduleName);
        } catch (error) {
            console.warn(`Module ${moduleName} not available:`, error.message);
            return null;
        }
    }

    /**
     * Try to import mock WebSocket with error handling
     */
    tryImportMock() {
        try {
            return require('./webSocketSimulation');
        } catch (error) {
            console.warn('Mock WebSocket simulation not available:', error.message);
            return null;
        }
    }

    /**
     * Handle WebSocket reconnection with exponential backoff
     */
    handleReconnection(stompClient, onConnectionStateChange) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached. Giving up.');
            if (onConnectionStateChange) {
                onConnectionStateChange('failed');
            }
            return;
        }

        this.reconnectAttempts++;

        if (onConnectionStateChange) {
            onConnectionStateChange('reconnecting', {
                attempt: this.reconnectAttempts,
                maxAttempts: this.maxReconnectAttempts
            });
        }

        setTimeout(() => {
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            try {
                stompClient.activate();
            } catch (error) {
                console.error('Reconnection failed:', error);
                this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
                this.handleReconnection(stompClient, onConnectionStateChange);
            }
        }, this.reconnectDelay);
    }

    /**
     * Start heartbeat to keep connection alive
     */
    startHeartbeat(stompClient) {
        this.stopHeartbeat();

        this.heartbeatInterval = setInterval(() => {
            if (stompClient && stompClient.connected) {
                try {
                    stompClient.publish({
                        destination: '/app/ping',
                        body: JSON.stringify({ timestamp: Date.now() })
                    });
                } catch (error) {
                    console.warn('Heartbeat failed:', error);
                }
            }
        }, 30000);
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Check if WebSocket is connected
     */
    isWebSocketConnected() {
        return this.wsConnection && this.wsConnection.getConnectionState() === 'connected';
    }

    /**
     * Get WebSocket connection state
     */
    getWebSocketState() {
        if (!this.wsConnection) return 'disconnected';
        return this.wsConnection.getConnectionState();
    }
}

export default new NotificationService();