// components/UserSuggestions.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/axios";
// Your axios/fetch wrapper

export default function UserSuggestions({ limit = 10 }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followingIds, setFollowingIds] = useState(new Set());

  const fallbackImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // Fetch suggestions
  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/profile/usersuggestions?limit=${limit}`);
      // Handle both {  [...] } and direct array
      const users = res?.data || [];
      setSuggestions(users);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  // Handle follow
  const handleFollow = async (userId) => {
    try {
      await API.post(`/api/users/follow/${userId}`);
      setFollowingIds(prev => new Set(prev).add(userId));
    } catch (err) {
      console.error("Follow failed:", err);
      alert("Could not follow user");
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  // ─── Loading ───
  if (loading) {
    return (
      <div className="flex flex-col gap-3 w-full max-w-md">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border animate-pulse">
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

  // ─── Error ───
  if (error) {
    return (
      <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg w-full max-w-md">
        ⚠️ {error}
        <button onClick={fetchSuggestions} className="ml-2 underline">Retry</button>
      </div>
    );
  }

  // ─── Empty ───
  if (!suggestions.length) {
    return (
      <p className="text-center text-sm text-gray-500 py-6 w-full max-w-md">
        No suggestions found
      </p>
    );
  }

  // ─── Cards ───
  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      {suggestions.map((user) => {
        const isFollowing = followingIds.has(user._id || user.id);
        return (
          <div 
            key={user._id || user.id}
            className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition w-full"
          >
            {/* Avatar */}
            <img
              src={user?.profileImage?.url || user?.profileImage || fallbackImage}
              alt={user?.name || "User"}
              className="w-11 h-11 rounded-full object-cover bg-gray-100"
              onError={(e) => { e.target.src = fallbackImage; }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
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
            <button
              onClick={() => handleFollow(user._id || user.id)}
              disabled={isFollowing}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                isFollowing
                  ? "bg-gray-200 text-gray-500 cursor-default"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        );
      })}
    </div>
  );
}