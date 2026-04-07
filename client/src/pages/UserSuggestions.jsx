import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  followUser,
  getUserSuggestions,
  unfollowUser,
} from "../features/users/userSlice";
import { UserPlus, UserCheck, Mail, Search, X } from "lucide-react";

export default function UserSuggestions({ limit = 10 }) {
  const dispatch = useDispatch();
  const { suggestions, isLoading, isError, message } = useSelector(
    (state) => state.users,
  );
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [followingUsers, setFollowingUsers] = useState([]);

  const fallbackImage = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=3b82f6&color=ffffff`;

  useEffect(() => {
    dispatch(getUserSuggestions(limit));
  }, [dispatch, limit]);

  const handleFollow = (userId) => {
    dispatch(followUser(userId));
    setFollowingUsers((prev) => [...prev, userId]);
  };

  const handleUnfollow = (userId) => {
    dispatch(unfollowUser(userId));
    setFollowingUsers((prev) => prev.filter((id) => id !== userId));
  };

  const isFollowing = (userId) => followingUsers.includes(userId);

  // Filter suggestions
  const filteredSuggestions = suggestions.filter((user) => {
    const userId = user._id || user.id;
    const following = isFollowing(userId);
    
    if (filter === "following" && !following) return false;
    if (filter === "not_following" && following) return false;
    
    if (searchTerm) {
      const displayName = user?.profile?.fullName || user?.username || '';
      return displayName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  });

  const followingCount = followingUsers.length;

  if (isLoading && suggestions.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-32" />
              <div className="h-2 bg-gray-100 rounded w-24" />
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
        <p className="text-sm font-medium text-amber-800">Unable to load suggestions</p>
        <p className="text-xs text-amber-600 mt-1">{message || "Please try again"}</p>
        <button
          onClick={() => dispatch(getUserSuggestions(limit))}
          className="mt-3 px-4 py-1.5 text-xs font-medium rounded-lg bg-amber-900 text-white hover:bg-amber-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!suggestions.length) {
    return (
      <div className="text-center py-8">
        <UserPlus className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-2 text-sm text-gray-500">No suggestions found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Suggestions</h1>
        <p className="text-sm text-gray-500 mt-0.5">People you may want to connect with</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              filter === "all"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All ({suggestions.length})
          </button>
          <button
            onClick={() => setFilter("not_following")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              filter === "not_following"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Follow ({suggestions.length - followingCount})
          </button>
          <button
            onClick={() => setFilter("following")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              filter === "following"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Following ({followingCount})
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {filteredSuggestions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <UserCheck className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm ? "No users match your search" : "No users found"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuggestions.map((user) => {
            const userId = user._id || user.id;
            const following = isFollowing(userId);
            const displayName = user?.profile?.fullName || user?.username || 'User';
            const avatarUrl = user?.profile?.avatar?.url || fallbackImage(displayName);
            const userEmail = user?.email || user?.username;
            const userBio = user?.profile?.bio || user?.bio;

            return (
              <div
                key={userId}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                    onError={(e) => {
                      e.target.src = fallbackImage(displayName);
                    }}
                  />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {displayName}
                    </h3>
                    {userEmail && (
                      <p className="text-xs text-gray-400 truncate">@{userEmail.split('@')[0]}</p>
                    )}
                    {userBio && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{userBio}</p>
                    )}
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={() => following ? handleUnfollow(userId) : handleFollow(userId)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      following
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {following ? (
                      <>
                        <UserCheck className="h-3.5 w-3.5" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        Follow
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition">
                    <Mail className="h-3.5 w-3.5" />
                    Message
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition">
                    View Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}