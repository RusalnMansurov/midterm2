import { useEffect, useRef } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

/**
 * Opens a native WebSocket connection.
 * JWT is passed via the Sec-WebSocket-Protocol header
 * because browsers do not support custom WS headers.
 *
 * @param {function} onMessage - called with parsed JSON on every TICKER_UPDATE
 * @param {string|null} token  - JWT token from localStorage
 */
const useWebSocket = (onMessage, token) => {
  const wsRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Pass token as the subprotocol — backend reads req.headers['sec-websocket-protocol']
    const ws = new WebSocket(WS_URL, token);
    wsRef.current = ws;

    ws.onopen = () => console.log('WS connected');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    ws.onerror = (err) => console.error('WS error', err);
    ws.onclose = () => console.log('WS disconnected');

    return () => ws.close();
  }, [token]); // reconnect if token changes

  return wsRef;
};

export default useWebSocket;
