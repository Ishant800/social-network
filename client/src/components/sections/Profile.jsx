import { Calendar, Heart, Link as LinkIcon, MapPin, MessageCircle, Share2, Users } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const profileTabs = ["Posts", "Blogs", "Collections", "Followers", "Following"];

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const { posts } = useSelector((state) => state.posts);
  const [activeTab, setActiveTab] = useState("Posts");

  if (!user) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-4xl bg-white p-12 text-center shadow-sm">
        <h2 className="text-2xl font-extrabold text-slate-900">You don't have an account yet</h2>
        <p className="mt-2 text-slate-500">Create an account to continue.</p>
        <Link
          to="/signup"
          className="mt-6 inline-flex rounded-full bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200"
        >
          Create account
        </Link>
      </div>
    );
  }

  const userId = user?._id || user?.id;
  const name = user?.profile?.fullName || user?.username || "User";
  const handle = user?.username || user?.email?.split("@")[0] || "user";
  const bio = user?.profile?.bio || "Add a short bio to tell people about yourself.";
  const location = user?.profile?.location || "Add your location";
  const website = user?.profile?.website || "";
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "Recently";
  const avatar =
    user?.profile?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f0f4ff&color=334155`;
  const cover =
    user?.profile?.coverImage?.url ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

  const userPosts =
    posts?.filter((post) => {
      const postUserId = post?.user?._id || post?.user?.id || post?.user;
      return postUserId === userId;
    }) || [];

  const profilePosts = userPosts.map((post) => {
    const firstMedia = Array.isArray(post?.media) ? post.media[0] : null;
    const mediaUrl = typeof firstMedia === "string" ? firstMedia : firstMedia?.url;

    return {
      ...post,
      imageUrl: mediaUrl || "",
      likeCount:
        typeof post?.likesCount === "number"
          ? post.likesCount
          : Array.isArray(post?.likes)
            ? post.likes.length
            : 0,
      commentCount:
        typeof post?.commentsCount === "number"
          ? post.commentsCount
          : Array.isArray(post?.comments)
            ? post.comments.length
            : 0,
      createdLabel: new Date(post?.createdAt || post?.created_at || Date.now()).toLocaleDateString(),
    };
  });

  const stats = [
    { label: "Posts", value: String(user?.stats?.posts ?? profilePosts.length).padStart(2, "0") },
    { label: "Followers", value: String(user?.stats?.followers ?? 0).padStart(2, "0") },
    { label: "Following", value: String(user?.stats?.following ?? 0).padStart(2, "0") },
  ];

  const emptyCard = (title, description) => (
    <div className="rounded-[1.75rem] bg-white p-10 text-center shadow-sm">
      <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );

  const renderPosts = () => (
    <div className="mx-auto max-w-[820px] space-y-6">
      {profilePosts.length === 0 && emptyCard("No posts yet", "Your posts will appear here after you share something.")}

      {profilePosts.map((post) => (
        <article
          key={post._id}
          className="grid grid-cols-1 gap-4 md:grid-cols-[56px_minmax(0,1fr)] md:items-start"
        >
          <div className="hidden md:block">
            <img src={avatar} alt={name} className="h-12 w-12 rounded-2xl object-cover" />
          </div>

          <div className="rounded-[1.75rem] bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-slate-900">
                  {post.title || "Post"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">@{handle}</p>
              </div>
              <span className="text-sm text-slate-400">{post.createdLabel}</span>
            </div>

            <p className="mb-6 leading-7 text-slate-600">{post.content}</p>

            {post.imageUrl && (
              <div className="mb-6 overflow-hidden rounded-[1.25rem]">
                <img
                  src={post.imageUrl}
                  alt={post.title || "Post image"}
                  className="max-h-[420px] w-full object-cover"
                />
              </div>
            )}

            <div className="mt-6 flex gap-6">
              <button className="flex items-center gap-2 text-slate-400 hover:text-red-500">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-semibold">{post.likeCount}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">{post.commentCount}</span>
              </button>
              <button className="ml-auto text-slate-400 hover:text-indigo-600">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  const renderBlogs = () => (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Total blogs: <span className="font-semibold text-slate-900">{user?.stats?.blogs || 0}</span>
        </p>
      </div>
      {emptyCard("Blogs will appear here", "Once blog data is connected on the client, your written blogs can be listed in this tab.")}
    </div>
  );

  const renderCollections = () => (
    emptyCard("No collections yet", "Saved collections are not connected right now, so this section is still empty.")
  );

  const renderPeopleList = (title, count) =>
    emptyCard(title, `This account currently has ${count} ${title.toLowerCase()}. A detailed people list is not connected yet.`);

  const renderTabContent = () => {
    if (activeTab === "Posts") return renderPosts();
    if (activeTab === "Blogs") return renderBlogs();
    if (activeTab === "Collections") return renderCollections();
    if (activeTab === "Followers") return renderPeopleList("Followers", user?.stats?.followers || 0);
    if (activeTab === "Following") return renderPeopleList("Following", user?.stats?.following || 0);
    return null;
  };

  return (
    <main className="w-full bg-[#f5f7f9] py-4 font-['Inter']">
      <div className="mx-auto w-full max-w-[1120px]">
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-200 h-[180px] sm:h-[220px] md:h-[260px]">
            <img src={cover} alt={`${name} cover`} className="h-full w-full object-cover" />
          </div>

          <div className="relative -mt-12 flex flex-col gap-5 px-5 sm:px-8 md:-mt-14 md:flex-row md:items-end">
            <div className="h-24 w-24 overflow-hidden rounded-[1.75rem] border-4 border-[#f5f7f9] bg-white shadow-md md:h-32 md:w-32">
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            </div>

            <div className="flex-1 pb-1">
              <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                {name}
              </h1>
              <p className="mt-1 font-medium text-slate-500">@{handle}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <p className="max-w-3xl text-base leading-8 text-slate-700">{bio}</p>

              <div className="mt-5 flex flex-wrap gap-5 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {location}
                </span>
                {website && (
                  <span className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    <a
                      className="text-indigo-600 hover:underline"
                      href={website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {website}
                    </a>
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Joined {joined}
                </span>
              </div>
            </div>

            <div className="rounded-[1.25rem] bg-white p-4 shadow-sm">
              <div className="grid grid-cols-3 gap-3 text-center">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-slate-50 px-3 py-4">
                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <nav className="mb-8 flex gap-8 overflow-x-auto border-b border-slate-200 px-5 sm:px-8">
          {profileTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-4 text-sm font-semibold ${
                activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-indigo-600"></span>
              )}
            </button>
          ))}
        </nav>

        <section className="px-5 sm:px-8">{renderTabContent()}</section>
      </div>
    </main>
  );
}
