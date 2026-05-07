import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { addNotification, setUnreadCount } from '../store/mailSlice';

export const useWebSocket = (accessToken) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!accessToken) return undefined;
    const baseUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const normalized = baseUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '');

    const connect = () => {
      socketRef.current = new WebSocket(`${normalized}/ws/notifications/?token=${accessToken}`);
      socketRef.current.onopen = () => setIsConnected(true);
      socketRef.current.onclose = () => {
        setIsConnected(false);
        reconnectTimerRef.current = window.setTimeout(connect, 3000);
      };
      socketRef.current.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        setLastMessage(payload);
        if (typeof payload.unread_count === 'number') {
          dispatch(setUnreadCount(payload.unread_count));
        }
        dispatch(addNotification(payload));
      };
    };

    connect();

    return () => {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [accessToken, dispatch]);

  return { isConnected, lastMessage };
};
