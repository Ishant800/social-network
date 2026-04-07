import { Calendar, Link as LinkIcon, MapPin } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PostCard from "../components/posts/PostCard";

const tabs = ["Posts", "Blogs", "Followers", "Following"];

export default function Profile() {
  const { user, profilePosts } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("Posts");

  if (!user) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-xl p-12 text-center shadow-sm">
        <h2 className="text-2xl font-extrabold text-slate-900">You don't have an account yet</h2>
        <p className="mt-2 text-slate-500">Create an account to continue.</p>
        <Link to="/signup" className="mt-6 inline-flex rounded-sm px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200">
          Create account
        </Link>
      </div>
    );
  }

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "";

  const posts = (profilePosts || []).map((post) => ({
    ...post,
    user: {
      _id: user._id,
      username: user.username,
      name: user.profile?.fullName || user.username,
      profileImage: user.profile?.avatar || null,
    },
  }));

  const renderPosts = () => {
    if (!posts.length) {
      return (
        <div className="rounded-[1.5rem] bg-white p-10 text-center shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">No posts yet</h3>
          <p className="mt-2 text-sm text-slate-500">Your posts will appear here after you share something.</p>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-[760px] space-y-5">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} currentUser={user} />
        ))}
      </div>
    );
  };

  const renderEmpty = (title) => (
    <div className="rounded-[1.5rem] bg-white p-10 text-center shadow-sm">
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">Nothing to show here yet.</p>
    </div>
  );

  return (
    <main className="w-full bg-[#f5f7f9] py-4">
      <div className="mx-auto max-w-275 px-4">
        <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end">
            <img
              src={
                user.profile?.avatar?.url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.profile?.fullName || user.username)}`
              }
              alt={user.profile?.fullName || user.username}
              className="h-24 w-24 rounded-[1.5rem] object-cover"
            />

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">{user.profile?.fullName}</h1>
              <p className="mt-1 text-slate-500">@{user.username}</p>
              <p className="mt-4 max-w-2xl text-slate-700">{user.profile?.bio}</p>

              <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                {user.profile?.location && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {user.profile.location}
                  </span>
                )}
                {user.profile?.website && (
                  <a
                    href={user.profile.website.startsWith("http") ? user.profile.website : `https://${user.profile.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-indigo-600"
                  >
                    <LinkIcon className="h-4 w-4" /> {user.profile.website}
                  </a>
                )}
                {joined && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Joined {joined}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-[1.25rem] bg-slate-50 p-4 text-center">
              <div>
                <p className="text-lg font-bold text-slate-900">{user.stats?.posts || 0}</p>
                <p className="text-xs text-slate-500">Posts</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{user.stats?.followers || 0}</p>
                <p className="text-xs text-slate-500">Followers</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{user.stats?.following || 0}</p>
                <p className="text-xs text-slate-500">Following</p>
              </div>
            </div>
          </div>
        </section>

        <nav className="mt-8 mb-6 flex gap-8 overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold ${
                activeTab === tab ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === "Posts" && renderPosts()}
        {activeTab === "Blogs" && renderEmpty("No blogs yet")}
        {activeTab === "Followers" && renderEmpty("No followers yet")}
        {activeTab === "Following" && renderEmpty("Not following anyone yet")}
      </div>
    </main>
  );
}
