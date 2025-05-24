// webSocketSimulation.js
// Comprehensive WebSocket simulation for development and testing

/**
 * Mock WebSocket Connection Class
 * Simulates real WebSocket behavior with proper event handling
 */
class MockWebSocketConnection {
    constructor(url, protocols = []) {
        this.url = url;
        this.protocols = protocols;
        this.readyState = MockWebSocketConnection.CONNECTING;
        this.bufferedAmount = 0;
        this.extensions = '';
        this.protocol = '';
        this.binaryType = 'blob';

        // Event handlers
        this.onopen = null;
        this.onclose = null;
        this.onmessage = null;
        this.onerror = null;

        // Internal state
        this.subscriptions = new Map();
        this.simulationInterval = null;
        this.isSimulationActive = false;
        this.messageQueue = [];

        // Simulate connection delay
        setTimeout(() => {
            this.readyState = MockWebSocketConnection.OPEN;
            console.log('Mock WebSocket connected to:', url);

            if (this.onopen) {
                this.onopen(new MockEvent('open'));
            }

            this.startNotificationSimulation();
        }, Math.random() * 1000 + 500); // 0.5-1.5 second delay
    }

    // WebSocket constants
    static get CONNECTING() { return 0; }
    static get OPEN() { return 1; }
    static get CLOSING() { return 2; }
    static get CLOSED() { return 3; }

    /**
     * Send a message through the WebSocket
     * @param {string} data Message data
     */
    send(data) {
        if (this.readyState !== MockWebSocketConnection.OPEN) {
            throw new Error('WebSocket is not open');
        }

        try {
            const message = JSON.parse(data);
            this.handleOutgoingMessage(message);
        } catch (error) {
            console.warn('Invalid JSON message:', data);
        }
    }

    /**
     * Close the WebSocket connection
     * @param {number} code Close code
     * @param {string} reason Close reason
     */
    close(code = 1000, reason = '') {
        if (this.readyState === MockWebSocketConnection.CLOSED ||
            this.readyState === MockWebSocketConnection.CLOSING) {
            return;
        }

        this.readyState = MockWebSocketConnection.CLOSING;
        this.stopNotificationSimulation();

        setTimeout(() => {
            this.readyState = MockWebSocketConnection.CLOSED;

            if (this.onclose) {
                this.onclose(new MockCloseEvent('close', { code, reason, wasClean: true }));
            }

            console.log('Mock WebSocket disconnected');
        }, 100);
    }

    /**
     * Add event listener
     * @param {string} type Event type
     * @param {Function} listener Event listener
     */
    addEventListener(type, listener) {
        switch (type) {
            case 'open':
                this.onopen = listener;
                break;
            case 'close':
                this.onclose = listener;
                break;
            case 'message':
                this.onmessage = listener;
                break;
            case 'error':
                this.onerror = listener;
                break;
        }
    }

    /**
     * Remove event listener
     * @param {string} type Event type
     * @param {Function} listener Event listener
     */
    removeEventListener(type, listener) {
        switch (type) {
            case 'open':
                if (this.onopen === listener) this.onopen = null;
                break;
            case 'close':
                if (this.onclose === listener) this.onclose = null;
                break;
            case 'message':
                if (this.onmessage === listener) this.onmessage = null;
                break;
            case 'error':
                if (this.onerror === listener) this.onerror = null;
                break;
        }
    }

    /**
     * Handle outgoing messages (from client to server)
     * @param {Object} message Parsed message object
     */
    handleOutgoingMessage(message) {
        console.log('Mock WebSocket outgoing:', message);

        // Simulate server responses to different message types
        if (message.command === 'CONNECT') {
            this.sendConnectedFrame();
        } else if (message.command === 'SUBSCRIBE') {
            this.handleSubscription(message);
        } else if (message.command === 'SEND') {
            this.handleSendMessage(message);
        }
    }

    /**
     * Send CONNECTED frame to client
     */
    sendConnectedFrame() {
        const connectedFrame = {
            command: 'CONNECTED',
            headers: {
                'version': '1.2',
                'heart-beat': '10000,10000',
                'server': 'Mock-STOMP/1.0'
            },
            body: ''
        };

        this.sendToClient(this.frameToString(connectedFrame));
    }

    /**
     * Handle subscription requests
     * @param {Object} message Subscription message
     */
    handleSubscription(message) {
        const destination = message.headers?.destination;
        if (destination) {
            this.subscriptions.set(destination, message.headers);
            console.log('Mock WebSocket subscribed to:', destination);

            // If subscribing to notifications, start sending them
            if (destination === '/user/queue/notifications') {
                this.isSimulationActive = true;
            }
        }
    }

    /**
     * Handle send message requests
     * @param {Object} message Send message
     */
    handleSendMessage(message) {
        const destination = message.headers?.destination;
        console.log('Mock WebSocket message sent to:', destination, message.body);

        // Simulate server processing and potential responses
        if (destination === '/app/ping') {
            // Respond to ping with pong
            this.sendPongResponse();
        }
    }

    /**
     * Send pong response to ping
     */
    sendPongResponse() {
        const pongFrame = {
            command: 'MESSAGE',
            headers: {
                'destination': '/user/queue/pong',
                'message-id': 'pong-' + Date.now(),
                'subscription': 'pong'
            },
            body: JSON.stringify({ type: 'pong', timestamp: Date.now() })
        };

        this.sendToClient(this.frameToString(pongFrame));
    }

    /**
     * Start simulating notifications
     */
    startNotificationSimulation() {
        if (this.simulationInterval) return;

        // Send initial welcome notification
        setTimeout(() => {
            this.sendWelcomeNotification();
        }, 2000);

        // Set up periodic notifications (every 2-5 minutes)
        const intervalTime = Math.floor(Math.random() * 180000) + 120000; // 2-5 minutes

        this.simulationInterval = setInterval(() => {
            if (this.isSimulationActive && Math.random() < 0.4) { // 40% chance
                this.sendRandomNotification();
            }
        }, intervalTime);
    }

    /**
     * Stop notification simulation
     */
    stopNotificationSimulation() {
        this.isSimulationActive = false;
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    /**
     * Send welcome notification
     */
    sendWelcomeNotification() {
        const notification = {
            id: this.generateId(),
            userId: 1,
            title: 'Welcome to Tukio Notifications!',
            content: 'You are now connected to real-time notifications. This is a demo message to show how notifications work.',
            notificationType: 'SYSTEM_ANNOUNCEMENT',
            channel: 'IN_APP',
            status: 'DELIVERED',
            referenceId: null,
            referenceType: null,
            sentAt: new Date().toISOString(),
            deliveredAt: new Date().toISOString(),
            readAt: null,
            createdAt: new Date().toISOString()
        };

        this.sendNotificationToClient(notification);
    }

    /**
     * Send random notification
     */
    sendRandomNotification() {
        const notificationTemplates = [
            {
                type: 'EVENT_REMINDER',
                title: 'Event Reminder: Tech Workshop Tomorrow',
                content: 'Don\'t forget about the Advanced JavaScript Workshop tomorrow at 2:00 PM in Conference Room A.',
                referenceId: Math.floor(Math.random() * 10) + 1,
                referenceType: 'EVENT'
            },
            {
                type: 'EVENT_REGISTRATION',
                title: 'Registration Confirmed: Data Science Bootcamp',
                content: 'Your registration for the Data Science Bootcamp has been confirmed. Check your email for details.',
                referenceId: Math.floor(Math.random() * 10) + 1,
                referenceType: 'EVENT'
            },
            {
                type: 'VENUE_CHANGE',
                title: 'Venue Updated: Mobile App Development Workshop',
                content: 'The venue for Mobile App Development Workshop has been changed to Lab 205. Please update your calendar.',
                referenceId: Math.floor(Math.random() * 10) + 1,
                referenceType: 'EVENT'
            },
            {
                type: 'EVENT_UPDATE',
                title: 'Schedule Change: AI Ethics Seminar',
                content: 'The AI Ethics Seminar schedule has been updated. The event now starts 30 minutes later.',
                referenceId: Math.floor(Math.random() * 10) + 1,
                referenceType: 'EVENT'
            },
            {
                type: 'SYSTEM_ANNOUNCEMENT',
                title: 'Platform Maintenance Tonight',
                content: 'Scheduled maintenance will occur tonight from 11:00 PM to 1:00 AM. Some features may be unavailable.',
                referenceId: null,
                referenceType: null
            },
            {
                type: 'EVENT_CANCELLATION',
                title: 'Event Cancelled: Network Security Workshop',
                content: 'Unfortunately, the Network Security Workshop has been cancelled due to instructor illness. We apologize for the inconvenience.',
                referenceId: Math.floor(Math.random() * 10) + 1,
                referenceType: 'EVENT'
            }
        ];

        const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];

        const notification = {
            id: this.generateId(),
            userId: 1,
            title: template.title,
            content: template.content,
            notificationType: template.type,
            channel: 'IN_APP',
            status: 'DELIVERED',
            referenceId: template.referenceId,
            referenceType: template.referenceType,
            sentAt: new Date().toISOString(),
            deliveredAt: new Date().toISOString(),
            readAt: null,
            createdAt: new Date().toISOString()
        };

        this.sendNotificationToClient(notification);
    }

    /**
     * Send custom notification (for testing)
     * @param {Object} notificationData Custom notification data
     */
    sendTestNotification(notificationData) {
        const notification = {
            id: this.generateId(),
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

        this.sendNotificationToClient(notification);
    }

    /**
     * Send notification to client
     * @param {Object} notification Notification object
     */
    sendNotificationToClient(notification) {
        if (!this.subscriptions.has('/user/queue/notifications')) return;

        const messageFrame = {
            command: 'MESSAGE',
            headers: {
                'destination': '/user/queue/notifications',
                'message-id': 'msg-' + notification.id,
                'subscription': 'sub-notifications',
                'content-type': 'application/json'
            },
            body: JSON.stringify(notification)
        };

        this.sendToClient(this.frameToString(messageFrame));
    }

    /**
     * Send message to client
     * @param {string} frameString STOMP frame string
     */
    sendToClient(frameString) {
        if (this.readyState === MockWebSocketConnection.OPEN && this.onmessage) {
            setTimeout(() => {
                this.onmessage(new MockMessageEvent('message', { data: frameString }));
            }, Math.random() * 100 + 50); // Small random delay
        }
    }

    /**
     * Convert frame object to STOMP frame string
     * @param {Object} frame Frame object
     * @returns {string} STOMP frame string
     */
    frameToString(frame) {
        let frameStr = frame.command + '\n';

        if (frame.headers) {
            for (const [key, value] of Object.entries(frame.headers)) {
                frameStr += `${key}:${value}\n`;
            }
        }

        frameStr += '\n' + (frame.body || '') + '\0';
        return frameStr;
    }

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Math.floor(Math.random() * 1000000).toString();
    }
}

/**
 * Mock SockJS implementation
 */
class MockSockJS extends MockWebSocketConnection {
    constructor(url, protocols, options = {}) {
        super(url, protocols);
        this.options = options;
        console.log('Mock SockJS created for:', url);
    }

    static get CONNECTING() { return 0; }
    static get OPEN() { return 1; }
    static get CLOSING() { return 2; }
    static get CLOSED() { return 3; }
}

/**
 * Mock STOMP Client
 */
class MockStompClient {
    constructor(webSocket) {
        this.webSocket = webSocket;
        this.subscriptions = new Map();
        this.connected = false;
        this.messageId = 0;
        this.subscriptionId = 0;
        this.connectHeaders = {};
        this.debug = null;
        this.heartbeat = { outgoing: 10000, incoming: 10000 };
        this.reconnectDelay = 5000;
        this.onConnect = null;
        this.onDisconnect = null;
        this.onStompError = null;
        this.onWebSocketError = null;
    }

    /**
     * Connect to the STOMP server
     * @param {Object} headers Connection headers
     * @param {Function} connectCallback Success callback
     * @param {Function} errorCallback Error callback
     */
    connect(headers = {}, connectCallback = null, errorCallback = null) {
        this.connectHeaders = headers;
        this.onConnect = connectCallback;
        this.onStompError = errorCallback;

        this.webSocket.onopen = () => {
            this.sendFrame({
                command: 'CONNECT',
                headers: {
                    'accept-version': '1.2',
                    'heart-beat': `${this.heartbeat.outgoing},${this.heartbeat.incoming}`,
                    ...headers
                }
            });
        };

        this.webSocket.onmessage = (event) => {
            this.handleFrame(event.data);
        };

        this.webSocket.onclose = (event) => {
            this.connected = false;
            if (this.onDisconnect) {
                this.onDisconnect();
            }
        };

        this.webSocket.onerror = (error) => {
            if (this.onWebSocketError) {
                this.onWebSocketError(error);
            }
        };
    }

    /**
     * Disconnect from the STOMP server
     * @param {Function} disconnectCallback Disconnect callback
     */
    disconnect(disconnectCallback = null) {
        if (this.connected) {
            this.sendFrame({
                command: 'DISCONNECT',
                headers: {}
            });
        }

        this.webSocket.close();
        this.connected = false;

        if (disconnectCallback) {
            setTimeout(disconnectCallback, 100);
        }
    }

    /**
     * Subscribe to a destination
     * @param {string} destination Destination to subscribe to
     * @param {Function} callback Message callback
     * @param {Object} headers Additional headers
     * @returns {Object} Subscription object
     */
    subscribe(destination, callback, headers = {}) {
        const subId = 'sub-' + (++this.subscriptionId);

        this.subscriptions.set(subId, {
            destination,
            callback,
            headers
        });

        this.sendFrame({
            command: 'SUBSCRIBE',
            headers: {
                'id': subId,
                'destination': destination,
                ...headers
            }
        });

        return {
            id: subId,
            destination,
            unsubscribe: () => {
                this.unsubscribe(subId);
            }
        };
    }

    /**
     * Unsubscribe from a destination
     * @param {string} subscriptionId Subscription ID
     */
    unsubscribe(subscriptionId) {
        if (this.subscriptions.has(subscriptionId)) {
            this.sendFrame({
                command: 'UNSUBSCRIBE',
                headers: {
                    'id': subscriptionId
                }
            });

            this.subscriptions.delete(subscriptionId);
        }
    }

    /**
     * Send a message
     * @param {string} destination Destination
     * @param {Object} headers Headers
     * @param {string} body Message body
     */
    send(destination, headers = {}, body = '') {
        this.sendFrame({
            command: 'SEND',
            headers: {
                'destination': destination,
                ...headers
            },
            body
        });
    }

    /**
     * Publish a message (alias for send)
     * @param {Object} params Message parameters
     */
    publish(params) {
        this.send(params.destination, params.headers, params.body);
    }

    /**
     * Send a STOMP frame
     * @param {Object} frame Frame object
     */
    sendFrame(frame) {
        if (this.webSocket && this.webSocket.readyState === MockWebSocketConnection.OPEN) {
            const frameString = this.frameToString(frame);
            this.webSocket.send(frameString);

            if (this.debug) {
                this.debug('>>> ' + frameString);
            }
        }
    }

    /**
     * Handle incoming STOMP frame
     * @param {string} data Frame data
     */
    handleFrame(data) {
        if (this.debug) {
            this.debug('<<< ' + data);
        }

        const frame = this.parseFrame(data);

        switch (frame.command) {
            case 'CONNECTED':
                this.connected = true;
                if (this.onConnect) {
                    this.onConnect(frame);
                }
                break;

            case 'MESSAGE':
                this.handleMessage(frame);
                break;

            case 'ERROR':
                if (this.onStompError) {
                    this.onStompError(frame);
                }
                break;
        }
    }

    /**
     * Handle incoming message
     * @param {Object} frame Message frame
     */
    handleMessage(frame) {
        const subscriptionId = frame.headers['subscription'];
        if (subscriptionId && this.subscriptions.has(subscriptionId)) {
            const subscription = this.subscriptions.get(subscriptionId);
            subscription.callback(frame);
        }
    }

    /**
     * Parse STOMP frame from string
     * @param {string} data Frame string
     * @returns {Object} Parsed frame
     */
    parseFrame(data) {
        const lines = data.split('\n');
        const command = lines[0];
        const headers = {};
        let bodyStart = 1;

        for (let i = 1; i < lines.length; i++) {
            if (lines[i] === '') {
                bodyStart = i + 1;
                break;
            }

            const colonIndex = lines[i].indexOf(':');
            if (colonIndex > 0) {
                const key = lines[i].substring(0, colonIndex);
                const value = lines[i].substring(colonIndex + 1);
                headers[key] = value;
            }
        }

        const body = lines.slice(bodyStart).join('\n').replace(/\0$/, '');

        return { command, headers, body };
    }

    /**
     * Convert frame to string
     * @param {Object} frame Frame object
     * @returns {string} Frame string
     */
    frameToString(frame) {
        let result = frame.command + '\n';

        if (frame.headers) {
            for (const [key, value] of Object.entries(frame.headers)) {
                result += `${key}:${value}\n`;
            }
        }

        result += '\n';
        if (frame.body) {
            result += frame.body;
        }
        result += '\0';

        return result;
    }

    /**
     * Send test notification (mock-specific method)
     * @param {Object} notificationData Notification data
     */
    sendTestNotification(notificationData) {
        if (this.webSocket && this.webSocket.sendTestNotification) {
            this.webSocket.sendTestNotification(notificationData);
        }
    }

    /**
     * Activate the client (for compatibility with @stomp/stompjs)
     */
    activate() {
        // Mock activation - connection is already established
        console.log('Mock STOMP client activated');
    }

    /**
     * Deactivate the client (for compatibility with @stomp/stompjs)
     */
    deactivate() {
        this.disconnect();
        console.log('Mock STOMP client deactivated');
    }
}

/**
 * Mock Stomp object (similar to @stomp/stompjs)
 */
const MockStomp = {
    over: (webSocket) => {
        return new MockStompClient(webSocket);
    },

    client: (url) => {
        const ws = new MockSockJS(url);
        return new MockStompClient(ws);
    }
};

/**
 * Mock Event classes
 */
class MockEvent {
    constructor(type, eventInitDict = {}) {
        this.type = type;
        this.bubbles = eventInitDict.bubbles || false;
        this.cancelable = eventInitDict.cancelable || false;
        this.timestamp = Date.now();
    }
}

class MockMessageEvent extends MockEvent {
    constructor(type, eventInitDict = {}) {
        super(type, eventInitDict);
        this.data = eventInitDict.data;
        this.origin = eventInitDict.origin || '';
        this.lastEventId = eventInitDict.lastEventId || '';
        this.source = eventInitDict.source || null;
        this.ports = eventInitDict.ports || [];
    }
}

class MockCloseEvent extends MockEvent {
    constructor(type, eventInitDict = {}) {
        super(type, eventInitDict);
        this.code = eventInitDict.code || 0;
        this.reason = eventInitDict.reason || '';
        this.wasClean = eventInitDict.wasClean || false;
    }
}

// Export for use in notification service
export { MockSockJS as SockJS, MockStomp as Stomp };

// Global objects for compatibility (if needed)
if (typeof window !== 'undefined') {
    window.SockJS = MockSockJS;
    window.Stomp = MockStomp;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SockJS: MockSockJS,
        Stomp: MockStomp
    };
}