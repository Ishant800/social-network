// components/UserSuggestions.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  followUser,
  getUserSuggestions,
  unfollowUser,
} from "../../features/users/userSlice";
import { Link } from "react-router-dom";

export default function UserSuggestions({ limit = 10 }) {
  const dispatch = useDispatch();
  const { suggestions, followingIds, isLoading, isError, message } = useSelector(
    (state) => state.users,
  );

  const fallbackImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    dispatch(getUserSuggestions(limit));
  }, [dispatch, limit]);


  const handleFollowToggle = (userId, isFollowing) => {
    if (isFollowing) {
      dispatch(unfollowUser(userId));
      return;
    }
    dispatch(followUser(userId));
  };

  // --- Loading ---
  if (isLoading && suggestions.length === 0) {
    return (
      <div className="flex flex-col gap-3 w-full max-w-md">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border animate-pulse"
          >
            <div className="w-11 h-11 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-2 bg-gray-100 rounded w-32" />
            </div>
            <div className="w-16 h-7 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // --- Error ---
  if (isError) {
    return (
      <div className="w-full max-w-3xl mx-auto p-5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">Suggestions unavailable</p>
            <p className="text-xs text-amber-800/80 mt-1">
              {message || "Please try again in a moment."}
            </p>
          </div>
          <button
            onClick={() => dispatch(getUserSuggestions(limit))}
            className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-md bg-amber-900 text-amber-50 hover:bg-amber-800 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- Empty ---
  if (!suggestions.length) {
    return (
      <p className="text-center text-sm text-gray-500 py-6 w-full max-w-md">
        No suggestions found
      </p>
    );
  }

  // --- Cards ---
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Suggested Users</h1>
          <p className="text-xs text-slate-500 mt-1">
            People you may want to connect with
          </p>
        </div>
        <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">
          {suggestions.length} suggestions
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {suggestions.map((user) => {
          const userId = user._id || user.id;
          const isFollowing = followingIds.includes(userId);

          return (
            <div
              key={userId}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={user?.profileImage?.url || user?.profileImage || fallbackImage}
                    alt={user?.name || "User"}
                    className="w-14 h-14 rounded-full object-cover bg-slate-100 ring-2 ring-white shadow"
                    onError={(e) => {
                      e.target.src = fallbackImage;
                    }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {user?.name || "Anonymous"}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email || "No email"}
                  </p>
                </div>
              </div>

              {/* Info */}
              {user?.address && (
                <p className="text-xs text-slate-400 truncate mt-3">
                  {user.address}
                </p>
              )}

              {/* Follow Button */}
              <div className="mt-4 flex items-center gap-2">
                <Link
                  to={`/profile/${userId}`}
                  className="flex-1 text-center px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                >
                  View profile
                </Link>
                <button
                  onClick={() => handleFollowToggle(userId, isFollowing)}
                  disabled={isLoading && !isFollowing}
                  className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                    isFollowing
                      ? "bg-slate-100 text-slate-500"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
