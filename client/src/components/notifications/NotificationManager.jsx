import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import NotificationToast from './NotificationToast';
import { addNotificationFromSSE } from '../../features/notifications/notificationSlice';

export default function NotificationManager() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [toasts, setToasts] = useState([]);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    if (!token) {
      // Clean up if user logs out
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const connectSSE = () => {
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      try {
        // Connect to SSE endpoint for real-time notifications
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const eventSource = new EventSource(`${baseURL}/notifications/stream?token=${token}`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('✅ SSE connection established');
          reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        };

        eventSource.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            
            // Add to Redux store
            dispatch(addNotificationFromSSE(notification));
            
            // Show toast
            const toastId = Date.now();
            setToasts(prev => [...prev, { ...notification, toastId }]);
            
            // Auto-remove toast after 5 seconds
            setTimeout(() => {
              setToasts(prev => prev.filter(toast => toast.toastId !== toastId));
            }, 5000);
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('❌ SSE connection error:', error);
          eventSource.close();
          eventSourceRef.current = null;

          // Implement exponential backoff for reconnection
          const maxAttempts = 5;
          const baseDelay = 1000; // 1 second
          
          if (reconnectAttemptsRef.current < maxAttempts) {
            const delay = Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current), 30000); // Max 30 seconds
            reconnectAttemptsRef.current += 1;
            
            console.log(`🔄 Reconnecting in ${delay / 1000}s (attempt ${reconnectAttemptsRef.current}/${maxAttempts})...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connectSSE();
            }, delay);
          } else {
            console.error('❌ Max reconnection attempts reached. Please refresh the page.');
          }
        };
      } catch (error) {
        console.error('Failed to create EventSource:', error);
      }
    };

    // Initial connection
    connectSSE();

    // Cleanup on unmount or token change
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [dispatch, token]);

  const handleCloseToast = (toastId) => {
    setToasts(prev => prev.filter(toast => toast.toastId !== toastId));
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed top-20 right-4 z-50 pointer-events-none">
      <div className="flex flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.toastId} className="pointer-events-auto">
            <NotificationToast
              notification={toast}
              onClose={() => handleCloseToast(toast.toastId)}
              onNavigate={handleNavigate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}