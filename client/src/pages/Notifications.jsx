import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { Bell, Heart, MessageCircle, UserPlus, CheckCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchNotifications, markAllRead, markOneRead, resetNotifications } from '../features/notifications/notificationSlice';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'like':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'comment':
      return <MessageCircle className="w-4 h-4 text-blue-600" />;
    case 'follow':
      return <UserPlus className="w-4 h-4 text-green-500" />;
    case 'profile_incomplete':
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
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
    case 'profile_incomplete':
      return notification.message || 'Complete your profile to help others connect with you better!';
    default:
      return 'New notification';
  }
};

const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const notificationDate = new Date(date);
  const diffMs = now - notificationDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return notificationDate.toLocaleDateString();
};

function NotificationItem({ notification, onMarkRead, onNavigate }) {
  const [isMarking, setIsMarking] = useState(false);

  const handleClick = async () => {
    if (!notification.read && !isMarking) {
      setIsMarking(true);
      await onMarkRead(notification._id);
      setIsMarking(false);
    }
    
    if (notification.type === 'profile_incomplete') {
      onNavigate('/profile/edit');
    } else if (notification.post) {
      onNavigate(`/post/${notification.post}`);
    } else if (notification.blog) {
      onNavigate(`/blog/${notification.blog}`);
    } else if (notification.type === 'follow' && notification.actor) {
      onNavigate(`/profile/${notification.actor._id}`);
    }
  };

  const actorAvatar = notification.type === 'profile_incomplete' 
    ? `https://ui-avatars.com/api/?name=System&background=f97316&color=ffffff`
    : notification.actor?.profile?.avatar?.url || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.actor?.username || 'User')}&background=3b82f6&color=ffffff`;

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
        notification.read 
          ? 'bg-white border-gray-200' 
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="relative shrink-0">
        <img
          src={actorAvatar}
          alt={notification.actor?.username || 'User'}
          className="w-10 h-10 rounded-full"
        />
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
          {getNotificationIcon(notification.type)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium">
          {getNotificationMessage(notification)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatTimeAgo(notification.createdAt)}
        </p>
        
        {(notification.post || notification.blog) && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 line-clamp-2">
              {notification.post?.content || notification.blog?.title || 'View content'}
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0">
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        )}
        {isMarking && (
          <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>
    </div>
  );
}

export default function Notifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { items, unreadCount, isLoading, hasMore } = useSelector((state) => state.notifications);
  
  const [filter, setFilter] = useState('all');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    dispatch(fetchNotifications(1));
  }, [dispatch]);

  const handleMarkRead = useCallback(async (notificationId) => {
    dispatch(markOneRead(notificationId));
  }, [dispatch]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setIsMarkingAll(true);
    dispatch(markAllRead());
    setIsMarkingAll(false);
  };

  const handleRefresh = () => {
    dispatch(resetNotifications());
    dispatch(fetchNotifications(1));
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const filteredNotifications = items.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                {isMarkingAll ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          {[
            { key: 'all', label: 'All', count: items.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'read', label: 'Read', count: items.length - unreadCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 text-xs text-gray-400">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading && items.length === 0 ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'unread' ? 'No unread notifications' : 
             filter === 'read' ? 'No read notifications' : 'No notifications yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {filter === 'unread' ? 'All caught up! Check back later for new updates.' :
             filter === 'read' ? 'No notifications have been read yet.' :
             'When you get likes, comments, or new followers, they\'ll appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onNavigate={handleNavigate}
            />
          ))}
          
          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={() => dispatch(fetchNotifications(Math.floor(items.length / 20) + 1))}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {isLoading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
