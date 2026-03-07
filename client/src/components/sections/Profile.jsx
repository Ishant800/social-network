import { Edit3, MapPin, Calendar } from "lucide-react";
import { useSelector } from "react-redux";
import { ProfileSkeleton } from "../skeleton/profileSkeleton";
import { useState } from "react";

import PostCard from "../post/PostCard";
import { useNavigate } from "react-router-dom";

export default function Profile() {

  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth);
  const { posts } = useSelector((state) => state.posts);


  const [activeTab, setActiveTab] = useState("Posts");

  if (!user) return <ProfileSkeleton />;

  // User basic info
  const name = user?.name?.trim() || "User";
  const email = user?.email || "";
  const handle = email
    ? email.split("@")[0]
    : name.toLowerCase().replace(/\s+/g, "");

  const bio = user?.bio || "";
  const location = user?.address || "";

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

  const avatar =
    user?.profileImage?.url?.trim() ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128`;

  const followers = user?.followers?.length ?? 0;
  const following = user?.following?.length ?? 0;

  // Filter posts created by this user
  const userPosts =
    posts?.filter((post) => post?.user === user?._id) || [];

  // const handleSave = (data) => {
  //   console.log("Updated profile:", data);
  //   // dispatch(updateProfile(data))
  // };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      
      {/* Header */}
      <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
        <img
          src={avatar}
          alt={name}
          className="w-20 h-20 rounded-2xl object-cover border border-slate-100"
        />

        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{name}</h1>
              <p className="text-sm text-slate-500">@{handle}</p>
            </div>

            <button
              onClick={()=> navigate("/profile/edit")}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {bio && <p className="text-sm text-slate-700 mt-2">{bio}</p>}

          <div className="flex gap-4 mt-3 text-xs text-slate-500 flex-wrap">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {location}
              </span>
            )}

            {joined && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {joined}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 py-3 border-b border-slate-100 text-sm">
        <Stat label="Followers" value={followers} />
        <Stat label="Following" value={following} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 py-2">
        {["Posts", "About", "Friends"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition
              ${
                activeTab === tab
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">
        
        {/* POSTS */}
        {activeTab === "Posts" && (
          <>
            {userPosts.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-6">
                No posts yet
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ABOUT */}
        {activeTab === "About" && (
          <div className="bg-white border border-slate-100 rounded-xl p-4 text-sm text-slate-700 space-y-2">
            <p>
              <strong>Name:</strong> {user.name}
            </p>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            {bio && (
              <p>
                <strong>Bio:</strong> {bio}
              </p>
            )}

            {location && (
              <p>
                <strong>Location:</strong> {location}
              </p>
            )}
          </div>
        )}

        {/* FRIENDS */}
        {activeTab === "Friends" && (
          <div className="text-center text-slate-400 text-sm py-6">
            Friends feature coming soon
          </div>
        )}
      </div>

      
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <button className="hover:text-indigo-600 transition">
      <span className="font-semibold text-slate-900">{value}</span>
      <span className="text-slate-500 ml-1">{label}</span>
    </button>
  );
}