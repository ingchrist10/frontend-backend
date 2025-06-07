import { useEffect, useCallback } from 'react';
import websocketService from '@/services/websocket';

export const useWebSocket = () => {
    useEffect(() => {
        // Connect to WebSocket when component mounts
        websocketService.connect();

        // Disconnect when component unmounts
        return () => {
            websocketService.disconnect();
        };
    }, []);

    const sendMessage = useCallback((message: string) => {
        websocketService.sendMessage(message);
    }, []);

    return { sendMessage };
};
