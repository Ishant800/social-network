import { useEffect, useState } from 'react';
import { X, Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'like':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'comment':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'follow':
      return <UserPlus className="w-4 h-4 text-green-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const getNotificationMessage = (notification) => {
  const actorName = notification.actor?.username || notification.actor?.profile?.fullName || 'Someone';
  
  switch (notification.type) {
    case 'like':
      return `${actorName} liked your ${notification.post ? 'post' : 'blog'}`;
    case 'comment':
      return `${actorName} commented on your ${notification.post ? 'post' : 'blog'}`;
    case 'follow':
      return `${actorName} started following you`;
    default:
      return 'New notification';
  }
};

export default function NotificationToast({ notification, onClose, onNavigate }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClick = () => {
    if (notification.post) {
      onNavigate(`/post/${notification.post}`);
    } else if (notification.blog) {
      onNavigate(`/blog/${notification.blog}`);
    } else if (notification.type === 'follow' && notification.actor) {
      onNavigate(`/profile/${notification.actor._id}`);
    }
    handleClose();
  };

  const actorAvatar = notification.actor?.profile?.avatar?.url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.actor?.username || 'User')}&background=3b82f6&color=ffffff`;

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        onClick={handleClick}
        className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
      >
        <div className="flex items-start gap-3">
          {/* Actor Avatar */}
          <div className="relative shrink-0">
            <img
              src={actorAvatar}
              alt={notification.actor?.username || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
              {getNotificationIcon(notification.type)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 font-medium">
              {getNotificationMessage(notification)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Just now
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}