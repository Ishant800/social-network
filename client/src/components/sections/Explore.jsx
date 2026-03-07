import { Search, TrendingUp, Hash, Users, MapPin } from "lucide-react";

export default function Explore() {
  const trendingTopics = [
    { tag: "#WebDevelopment", posts: "12.5K" },
    { tag: "#ReactJS", posts: "8.2K" },
    { tag: "#UIUX", posts: "6.1K" },
    { tag: "#JavaScript", posts: "5.8K" },
    { tag: "#TechNews", posts: "4.3K" },
  ];

  const posts = [
    { id: 1, image: "https://picsum.photos/400?1", likes: 120, author: "Alex Rivera" },
    { id: 2, image: "https://picsum.photos/400?2", likes: 98, author: "Sarah Chen" },
    { id: 3, image: "https://picsum.photos/400?3", likes: 210, author: "Mike Ross" },
    { id: 4, image: "https://picsum.photos/400?4", likes: 76, author: "Emma Wilson" },
    { id: 5, image: "https://picsum.photos/400?5", likes: 305, author: "James Carter" },
    { id: 6, image: "https://picsum.photos/400?6", likes: 180, author: "Lisa Park" },
    { id: 7, image: "https://picsum.photos/400?7", likes: 145, author: "David Kim" },
    { id: 8, image: "https://picsum.photos/400?8", likes: 220, author: "Anna Lee" },
    { id: 9, image: "https://picsum.photos/400?9", likes: 95, author: "Tom Brown" },
  ];

  const suggestedUsers = [
    { id: 1, name: "Alex Morgan", username: "@alex", avatar: "https://i.pravatar.cc/150?u=alex&size=80", mutual: 12 },
    { id: 2, name: "Sophia Lee", username: "@sophia", avatar: "https://i.pravatar.cc/150?u=sophia&size=80", mutual: 8 },
    { id: 3, name: "James Carter", username: "@james", avatar: "https://i.pravatar.cc/150?u=james&size=80", mutual: 5 },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4">
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts, users, tags..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Content - 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Trending Topics */}
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-900">Trending Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic) => (
                <button
                  key={topic.tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-medium transition"
                >
                  <Hash className="w-3 h-3" />
                  <span>{topic.tag}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{topic.posts}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Explore Grid */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Explore Posts</h2>
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div key={post.id} className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg">
                  <img
                    src={post.image}
                    alt={`Post by ${post.author}`}
                    className="w-full h-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white">
                    <span className="text-sm font-semibold">❤️ {post.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          
          {/* Suggested Users */}
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-slate-900">Who to follow</h2>
              </div>
              <button className="text-xs text-indigo-600 hover:underline font-medium">See all</button>
            </div>
            
            <div className="space-y-3">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.mutual} mutual</p>
                    </div>
                  </div>
                  <button className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Locations */}
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-900">Popular Locations</h2>
            </div>
            <div className="space-y-3">
              {["New York, USA", "London, UK", "Tokyo, Japan", "Paris, France"].map((location) => (
                <button
                  key={location}
                  className="w-full text-left text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}