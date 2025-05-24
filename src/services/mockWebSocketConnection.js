// WebSocket simulation for real-time notifications
// This simulates the WebSocket connection mentioned in the API documentation

class MockWebSocketConnection {
    constructor(url, onNotificationReceived) {
        this.url = url;
        this.onNotificationReceived = onNotificationReceived;
        this.connected = false;
        this.simulationInterval = null;
        this.subscriptions = new Map();

        // Simulate connection delay
        setTimeout(() => {
            this.connected = true;
            console.log('Connected to notification WebSocket (simulated)');
            this.startSimulation();
        }, 1000);
    }

    // Simulate subscribing to user-specific notification queue
    subscribe(destination, callback) {
        if (destination === '/user/queue/notifications') {
            this.subscriptions.set(destination, callback);
            console.log('Subscribed to user notifications (simulated)');
        }
    }

    // Start simulating random notifications
    startSimulation() {
        // Simulate notifications every 2-5 minutes in demo mode
        const intervalTime = Math.floor(Math.random() * 180000) + 120000; // 2-5 minutes

        this.simulationInterval = setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance to send a notification
                this.simulateIncomingNotification();
            }
        }, intervalTime);
    }

    // Simulate an incoming notification
    simulateIncomingNotification() {
        const notificationTypes = [
            {
                type: 'EVENT_REMINDER',
                title: 'Event Reminder: Workshop Tomorrow',
                content: 'Don\'t forget about the Data Science Workshop tomorrow at 2:00 PM.',
                referenceId: Math.floor(Math.random() * 10) + 1,
                referenceType: 'EVENT'
            },
            {
                type: 'EVENT_REGISTRATION',
                title: 'Registration Confirmed',
                content: 'Your registration for the Campus Career Fair has been confirmed.',
                referenceId: Math.floor(Math.random() * 10) + 1,
                referenceType: 'EVENT'
            },
            {
                type: 'VENUE_CHANGE',
                title: 'Venue Changed',
                content: 'The venue for "Tech Meetup" has been changed to Conference Room B.',
                referenceId: Math.floor(Math.random() * 10) + 1,
                referenceType: 'EVENT'
            },
            {
                type: 'SYSTEM_ANNOUNCEMENT',
                title: 'System Maintenance',
                content: 'Scheduled maintenance will occur tonight from 11 PM to 1 AM.',
                referenceId: null,
                referenceType: null
            },
            {
                type: 'EVENT_UPDATE',
                title: 'Event Details Updated',
                content: 'The schedule for "Programming Bootcamp" has been updated.',
                referenceId: Math.floor(Math.random() * 10) + 1,
                referenceType: 'EVENT'
            }
        ];

        const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

        const notification = {
            id: Math.floor(Math.random() * 1000000).toString(),
            userId: 1, // Mock user ID
            title: randomNotification.title,
            content: randomNotification.content,
            notificationType: randomNotification.type,
            channel: 'IN_APP',
            status: 'DELIVERED',
            referenceId: randomNotification.referenceId,
            referenceType: randomNotification.referenceType,
            sentAt: new Date().toISOString(),
            deliveredAt: new Date().toISOString(),
            readAt: null,
            createdAt: new Date().toISOString()
        };

        // Simulate message from server
        const message = {
            body: JSON.stringify(notification)
        };

        // Call the subscribed callback
        const callback = this.subscriptions.get('/user/queue/notifications');
        if (callback) {
            callback(message);
        }
    }

    // Send a test notification (for manual testing)
    sendTestNotification(notificationData) {
        const notification = {
            id: Math.floor(Math.random() * 1000000).toString(),
            userId: 1,
            title: notificationData.title || 'Test Notification',
            content: notificationData.content || 'This is a test notification',
            notificationType: notificationData.type || 'SYSTEM_ANNOUNCEMENT',
            channel: 'IN_APP',
            status: 'DELIVERED',
            referenceId: notificationData.referenceId || null,
            referenceType: notificationData.referenceType || null,
            sentAt: new Date().toISOString(),
            deliveredAt: new Date().toISOString(),
            readAt: null,
            createdAt: new Date().toISOString()
        };

        const message = {
            body: JSON.stringify(notification)
        };

        const callback = this.subscriptions.get('/user/queue/notifications');
        if (callback) {
            callback(message);
        }
    }

    // Disconnect the WebSocket
    disconnect() {
        this.connected = false;
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        this.subscriptions.clear();
        console.log('Disconnected from notification WebSocket (simulated)');
    }
}

// Mock SockJS and STOMP for compatibility with the real implementation
class MockSockJS {
    constructor(url) {
        this.url = url;
        this.readyState = MockSockJS.CONNECTING;

        // Simulate connection
        setTimeout(() => {
            this.readyState = MockSockJS.OPEN;
            if (this.onopen) this.onopen();
        }, 100);
    }

    static get CONNECTING() { return 0; }
    static get OPEN() { return 1; }
    static get CLOSING() { return 2; }
    static get CLOSED() { return 3; }

    close() {
        this.readyState = MockSockJS.CLOSED;
        if (this.onclose) this.onclose();
    }
}

class MockStompClient {
    constructor(webSocket) {
        this.webSocket = webSocket;
        this.subscriptions = new Map();
        this.connected = false;
    }

    connect(headers, connectCallback, errorCallback) {
        this.webSocket.onopen = () => {
            this.connected = true;
            connectCallback('Connected to mock STOMP');
        };

        this.webSocket.onerror = (error) => {
            if (errorCallback) errorCallback(error);
        };
    }

    subscribe(destination, callback) {
        this.subscriptions.set(destination, callback);

        // For the notification queue, create a mock connection
        if (destination === '/user/queue/notifications') {
            this.mockConnection = new MockWebSocketConnection(
                this.webSocket.url,
                callback
            );
        }

        return {
            unsubscribe: () => {
                this.subscriptions.delete(destination);
                if (this.mockConnection) {
                    this.mockConnection.disconnect();
                }
            }
        };
    }

    disconnect(disconnectCallback) {
        this.connected = false;
        if (this.mockConnection) {
            this.mockConnection.disconnect();
        }
        this.webSocket.close();
        if (disconnectCallback) disconnectCallback();
    }

    // Method to send test notifications (for development/testing)
    sendTestNotification(notificationData) {
        if (this.mockConnection) {
            this.mockConnection.sendTestNotification(notificationData);
        }
    }
}

// Mock STOMP object
const MockStomp = {
    over: (webSocket) => {
        return new MockStompClient(webSocket);
    }
};

// Export for use in notification service
export { MockSockJS as SockJS, MockStomp as Stomp };

// Global objects for compatibility (if needed)
if (typeof window !== 'undefined') {
    window.SockJS = MockSockJS;
    window.Stomp = MockStomp;
}