interface AuthMessage {
  action: 'signin' | 'signup';
  email: string;
  password: string;
}

interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: any;
    tokens: {
      refresh: string;
      access: string;
    };
  };
}

class AuthWebSocketService {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private messageCallbacks: Array<(response: AuthResponse) => void> = [];

  constructor() {
    const wsProtocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'localhost:8000';
    this.url = `${wsProtocol}://${baseUrl}/ws/auth/`;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('Connected to AuthWebSocket');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        const response: AuthResponse = JSON.parse(event.data);
        this.messageCallbacks.forEach(callback => callback(response));
      };

      this.ws.onclose = () => {
        console.log('Disconnected from AuthWebSocket');
      };
    });
  }

  onMessage(callback: (response: AuthResponse) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const cleanup = this.onMessage((response) => {
        cleanup();
        resolve(response);
      });

      const message: AuthMessage = {
        action: 'signin',
        email,
        password,
      };

      this.ws.send(JSON.stringify(message));
    });
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const cleanup = this.onMessage((response) => {
        cleanup();
        resolve(response);
      });

      const message: AuthMessage = {
        action: 'signup',
        email,
        password,
      };

      this.ws.send(JSON.stringify(message));
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create a singleton instance
const authWebSocketService = new AuthWebSocketService();
export default authWebSocketService;
