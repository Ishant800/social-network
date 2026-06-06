import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCheck,
  RefreshCw,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  fetchNotifications,
  markAllRead,
  markOneRead,
  resetNotifications,
} from '../features/notifications/notificationSlice';
import { getDisplayName, getAvatarUrl } from '../utils/userDisplay';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
];

const getNotificationIcon = (type) => {
  const wrap = 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full';
  switch (type) {
    case 'like':
      return (
        <span className={`${wrap} bg-rose-50 text-rose-500`}>
          <Heart className="h-3.5 w-3.5" />
        </span>
      );
    case 'comment':
      return (
        <span className={`${wrap} bg-blue-50 text-blue-500`}>
          <MessageCircle className="h-3.5 w-3.5" />
        </span>
      );
    case 'follow':
      return (
        <span className={`${wrap} bg-emerald-50 text-emerald-500`}>
          <UserPlus className="h-3.5 w-3.5" />
        </span>
      );
    case 'profile_incomplete':
      return (
        <span className={`${wrap} bg-amber-50 text-amber-500`}>
          <AlertCircle className="h-3.5 w-3.5" />
        </span>
      );
    case 'discussion_ping':
      return (
        <span className={`${wrap} bg-violet-50 text-violet-500`}>
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      );
    case 'system':
      return (
        <span className={`${wrap} bg-teal-50 text-teal-600`}>
          <Bell className="h-3.5 w-3.5" />
        </span>
      );
    default:
      return (
        <span className={`${wrap} bg-gray-100 text-gray-400`}>
          <Bell className="h-3.5 w-3.5" />
        </span>
      );
  }
};

const getNotificationMessage = (notification) => {
  const actorName = getDisplayName(notification.actor);

  switch (notification.type) {
    case 'like':
      return (
        <>
          <span className="font-medium text-gray-900">{actorName}</span>
          {' liked your '}
          {notification.post ? 'post' : 'article'}
        </>
      );
    case 'comment':
      return (
        <>
          <span className="font-medium text-gray-900">{actorName}</span>
          {' commented on your '}
          {notification.post ? 'post' : 'article'}
        </>
      );
    case 'follow':
      return (
        <>
          <span className="font-medium text-gray-900">{actorName}</span>
          {' started following you'}
        </>
      );
    case 'profile_incomplete':
      return notification.message || 'Complete your profile so others can find and connect with you.';
    case 'discussion_ping':
      return (
        <>
          <span className="font-medium text-gray-900">{actorName}</span>
          {' '}
          {notification.message || 'invited you to a live discussion'}
        </>
      );
    case 'system':
      return notification.message || 'You have a new system update.';
    default:
      return 'You have a new notification.';
  }
};

const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getDateGroup = (date) => {
  if (!date) return 'Earlier';
  const d = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const notifDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (notifDay.getTime() === today.getTime()) return 'Today';
  if (notifDay.getTime() === yesterday.getTime()) return 'Yesterday';
  if (now - d < 7 * 86400000) return 'This week';
  return 'Earlier';
};

function NotificationItem({ notification, onMarkRead, onNavigate, isLast }) {
  const [isMarking, setIsMarking] = useState(false);
  const isSystem =
    notification.type === 'profile_incomplete' || notification.type === 'system';

  const actorAvatar = isSystem
    ? 'https://ui-avatars.com/api/?name=SN&background=0d9488&color=ffffff&bold=true'
    : getAvatarUrl(
        notification.actor,
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          getDisplayName(notification.actor),
        )}&background=e2e8f0&color=475569&bold=true`,
      );

  const previewText =
    notification.post?.content || notification.blog?.title || null;

  const handleClick = async () => {
    if (!notification.read && !isMarking) {
      setIsMarking(true);
      await onMarkRead(notification._id);
      setIsMarking(false);
    }

    if (notification.type === 'system') {
      onNavigate('/settings');
    } else if (notification.type === 'profile_incomplete') {
      onNavigate('/profile/edit');
    } else if (notification.type === 'discussion_ping' && notification.blog) {
      onNavigate(`/discussionroom/${notification.blog}`);
    } else if (notification.post) {
      onNavigate(`/post/${notification.post}`);
    } else if (notification.blog) {
      onNavigate(`/blog/${notification.blog}`);
    } else if (notification.type === 'follow' && notification.actor) {
      onNavigate(`/profile/${notification.actor._id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-start gap-3 px-1 py-3 text-left transition-colors hover:bg-gray-50 ${
        !isLast ? 'border-b border-gray-100' : ''
      } ${!notification.read ? 'bg-teal-50/40' : ''}`}
    >
      <img
        src={actorAvatar}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />

      {getNotificationIcon(notification.type)}

      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-snug text-gray-700">
          {getNotificationMessage(notification)}
        </span>
        {previewText && (
          <span className="mt-0.5 block truncate text-xs text-gray-400">
            {previewText}
          </span>
        )}
        <span className="mt-1 block text-xs text-gray-400">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </span>

      <span className="flex w-5 shrink-0 items-center justify-center pt-1">
        {isMarking ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
        ) : !notification.read ? (
          <span className="h-2 w-2 rounded-full bg-teal-500" aria-label="Unread" />
        ) : null}
      </span>
    </button>
  );
}

function EmptyState({ filter }) {
  const messages = {
    unread: {
      title: 'All caught up',
      description: 'No unread notifications.',
    },
    read: {
      title: 'No read notifications',
      description: 'Opened notifications will appear here.',
    },
    all: {
      title: 'No notifications yet',
      description: 'Likes, comments, and follows will show up here.',
    },
  };
  const copy = messages[filter] || messages.all;

  return (
    <div className="py-12 text-center">
      <Bell className="mx-auto h-8 w-8 text-gray-300" />
      <p className="mt-3 text-sm font-medium text-gray-900">{copy.title}</p>
      <p className="mt-1 text-sm text-gray-500">{copy.description}</p>
    </div>
  );
}

export default function Notifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { items, unreadCount, isLoading, hasMore } = useSelector(
    (state) => state.notifications,
  );

  const [filter, setFilter] = useState('all');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications(1));
  }, [dispatch]);

  const handleMarkRead = useCallback(
    (notificationId) => {
      dispatch(markOneRead(notificationId));
    },
    [dispatch],
  );

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

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const filteredNotifications = items.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const groupedNotifications = useMemo(() => {
    const groups = {};
    filteredNotifications.forEach((n) => {
      const label = getDateGroup(n.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });
    const order = ['Today', 'Yesterday', 'This week', 'Earlier'];
    return order
      .filter((label) => groups[label]?.length)
      .map((label) => ({ label, items: groups[label] }));
  }, [filteredNotifications]);

  const readCount = items.length - unreadCount;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-400 transition hover:text-gray-700 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-teal-700 transition hover:text-teal-800 disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {isMarkingAll ? 'Marking…' : 'Mark all read'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-1 border-b border-gray-200">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.key === 'all'
              ? items.length
              : tab.key === 'unread'
              ? unreadCount
              : readCount;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-2.5 text-sm font-medium transition ${
                filter === tab.key
                  ? 'border-b-2 border-gray-900 text-gray-900 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1 text-xs text-gray-400">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading && items.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <>
          <div className="border-t border-gray-200">
            {groupedNotifications.map((group, groupIdx) => (
              <section key={group.label}>
                <h2 className="sticky top-16 z-10 bg-white px-1 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {group.label}
                </h2>
                {group.items.map((notification, idx) => {
                  const isLastInPage =
                    groupIdx === groupedNotifications.length - 1 &&
                    idx === group.items.length - 1 &&
                    !hasMore;
                  return (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                      onNavigate={navigate}
                      isLast={isLastInPage}
                    />
                  );
                })}
              </section>
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={() =>
                dispatch(fetchNotifications(Math.floor(items.length / 20) + 1))
              }
              disabled={isLoading}
              className="w-full py-3 text-sm font-medium text-gray-500 transition hover:text-gray-800 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </span>
              ) : (
                'Load more'
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
