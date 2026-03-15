// components/UserSuggestions.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  followUser,
  getUserSuggestions,
  unfollowUser,
} from "../../features/users/userSlice";

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
      <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg w-full max-w-md">
        Warning: {message}
        <button
          onClick={() => dispatch(getUserSuggestions(limit))}
          className="ml-2 underline"
        >
          Retry
        </button>
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
    <div>
      <h1 className="font-medium text-sm mb-4">Suggested Users</h1>
      <div className="grid grid-cols-2 mb-10 md:grid-cols-3 gap-5 w-full">
        {suggestions.map((user) => {
          const userId = user._id || user.id;
          const isFollowing = followingIds.includes(userId);

          return (
            <div
              key={userId}
              className="flex flex-col items-center text-center gap-3 p-5 bg-white rounded-sm border border-gray-100 hover:shadow-md transition"
            >
              {/* Avatar */}
              <img
                src={user?.profileImage?.url || user?.profileImage || fallbackImage}
                alt={user?.name || "User"}
                className="w-16 h-16 rounded-full object-cover bg-gray-100"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />

              {/* Info */}
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || "Anonymous"}
                </h3>

                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "No email"}
                </p>

                {user?.address && (
                  <p className="text-xs text-gray-400 truncate">{user.address}</p>
                )}
              </div>

              {/* Follow Button */}
              <div className="flex gap-2">
                <button className="mt-2 px-4 py-1.5 text-xs shadow font-medium rounded-lg transition">
                  view
                </button>
                <button
                  onClick={() => handleFollowToggle(userId, isFollowing)}
                  disabled={isLoading && !isFollowing}
                  className={`mt-2 px-4 py-1.5 text-xs font-medium rounded-lg transition ${
                    isFollowing
                      ? "bg-gray-200 text-gray-500"
                      : "bg-indigo-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
