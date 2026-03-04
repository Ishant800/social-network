import React from "react";

function Explore() {

  // Dummy Posts
  const posts = [
    { id: 1, image: "https://picsum.photos/400?1", likes: 120 },
    { id: 2, image: "https://picsum.photos/400?2", likes: 98 },
    { id: 3, image: "https://picsum.photos/400?3", likes: 210 },
    { id: 4, image: "https://picsum.photos/400?4", likes: 76 },
    { id: 5, image: "https://picsum.photos/400?5", likes: 305 },
    { id: 6, image: "https://picsum.photos/400?6", likes: 180 },
  ];

  // Dummy Users
  const users = [
    { id: 1, name: "Alex Morgan", username: "@alex", avatar: "https://i.pravatar.cc/150?1" },
    { id: 2, name: "Sophia Lee", username: "@sophia", avatar: "https://i.pravatar.cc/150?2" },
    { id: 3, name: "James Carter", username: "@james", avatar: "https://i.pravatar.cc/150?3" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Search */}
      <div className="max-w-5xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search posts, users..."
          className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-slate-400 shadow-sm"
        />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* LEFT CONTENT */}
        <div className="lg:col-span-3 space-y-10">

          {/* Trending Section */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              🔥 Trending Posts
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {posts.slice(0, 3).map((post) => (
                <div key={post.id} className="relative group">
                  <img
                    src={post.image}
                    alt="post"
                    className="rounded-lg object-cover h-48 w-full"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-semibold">
                    ❤️ {post.likes}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Random Posts */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              🌍 Explore More
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="relative group">
                  <img
                    src={post.image}
                    alt="post"
                    className="rounded-lg object-cover h-48 w-full"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-semibold">
                    ❤️ {post.likes}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="bg-white rounded-xl shadow-md p-4 h-fit">

          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Suggested Users
          </h3>

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.username}
                    </p>
                  </div>
                </div>
                <button className="text-xs bg-slate-900 text-white px-3 py-1 rounded-md hover:bg-slate-800 transition">
                  Follow
                </button>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Explore;