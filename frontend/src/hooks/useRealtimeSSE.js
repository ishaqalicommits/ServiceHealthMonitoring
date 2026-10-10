import { useEffect, useRef, useCallback } from 'react';

/**
 * React hook for real-time SSE updates.
 * Connects to /api/sse/stream and calls handlers when events arrive.
 * Auto-reconnects if the connection drops.
 *
 * @param {Object} handlers - map of eventName -> callback(data)
 * @param {boolean} enabled - only connect when true (e.g. when user is logged in)
 */
export function useRealtimeSSE(handlers, enabled = true) {
  const esRef = useRef(null);
  const handlersRef = useRef(handlers);

  // Keep handlers ref up to date without re-connecting
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const connect = useCallback(() => {
    if (!enabled) return;
    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource('/api/sse/stream', { withCredentials: true });
    esRef.current = es;

    es.addEventListener('connected', () => {
      console.log('[SSE] Connected to real-time stream');
    });

    es.addEventListener('heartbeat', () => {
      // Keep-alive ping — no action needed
    });

    // Wire all user-provided handlers
    Object.keys(handlersRef.current).forEach(eventName => {
      es.addEventListener(eventName, (event) => {
        try {
          const data = JSON.parse(event.data);
          handlersRef.current[eventName]?.(data);
        } catch (err) {
          console.warn('[SSE] JSON parse error for event', eventName, err);
        }
      });
    });

    es.onerror = () => {
      console.warn('[SSE] Connection lost, reconnecting in 3s...');
      es.close();
      esRef.current = null;
      setTimeout(connect, 3000);
    };
  }, [enabled]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);
}
