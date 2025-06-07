class WebSocketService {
    private ws: WebSocket | null = null;
    private readonly url: string;

    constructor() {
        // Use secure WebSocket (wss) in production, ws in development
        const wsProtocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'localhost:8000';
        this.url = `${wsProtocol}://${baseUrl}/ws/chat/`;
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('Connected to WebSocket');
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received:', data);
            // Handle incoming messages here
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onclose = () => {
            console.log('Disconnected from WebSocket');
            // Optionally implement reconnection logic here
        };
    }

    sendMessage(message: string) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ message }));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
