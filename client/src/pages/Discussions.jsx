import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessagesSquare,
  Users,
  MessageCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { fetchActiveDiscussions } from '../features/discussions/discussionSlice';
import { getAvatarUrl, getDisplayName } from '../utils/userDisplay';

const formatTimeAgo = (date) => {
  if (!date) return '';
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

export default function Discussions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeDiscussions, isLoading, isError, message } = useSelector(
    (s) => s.discussions,
  );

  useEffect(() => {
    dispatch(fetchActiveDiscussions({ limit: 20, hours: 168 }));
  }, [dispatch]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Live Discussions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Join real-time conversations on blogs from the last 7 days
        </p>
      </div>

      {isError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          {message || 'Could not load discussions.'}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
        </div>
      )}

      {!isLoading && activeDiscussions.length === 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
            <MessagesSquare className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">No active discussions</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
            Open a blog and start a conversation, or browse blogs to find one in progress.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/explore"
              className="inline-flex rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Browse blogs
            </Link>
            <Link
              to="/blog/create"
              className="inline-flex rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              Write a blog
            </Link>
          </div>
        </section>
      )}

      {!isLoading && activeDiscussions.length > 0 && (
        <div className="space-y-3">
          {activeDiscussions.map((discussion) => {
            const authorName = getDisplayName(discussion.author);
            const authorAvatar = getAvatarUrl(discussion.author);

            return (
              <button
                key={discussion.blogId}
                type="button"
                onClick={() => navigate(`/discussionroom/${discussion.blogId}`)}
                className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-teal-300 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100">
                    <MessagesSquare className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                      {discussion.title}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-2">
                      {authorAvatar && (
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          className="h-4 w-4 rounded-full object-cover bg-gray-100"
                        />
                      )}
                      <span className="text-xs text-gray-600">{authorName}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {discussion.participantCount}{' '}
                        {discussion.participantCount === 1 ? 'participant' : 'participants'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {discussion.messageCount}{' '}
                        {discussion.messageCount === 1 ? 'message' : 'messages'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTimeAgo(discussion.lastActivity)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
