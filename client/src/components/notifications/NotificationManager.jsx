import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import NotificationToast from './NotificationToast';
import { addNotificationFromSSE } from '../../features/notifications/notificationSlice';

export default function NotificationManager() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!token) return;

    // Connect to SSE endpoint for real-time notifications
    // Note: EventSource doesn't support custom headers, so we pass token as query param
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const eventSource = new EventSource(`${baseURL}/notifications/stream?token=${token}`);

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
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
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