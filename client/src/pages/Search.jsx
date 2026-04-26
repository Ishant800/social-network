import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Users, FileText, BookOpen, Loader2 } from 'lucide-react';
import API from '../api/axios';
import SimplePostCard from '../components/posts/SimplePostCard';
import BlogCard from '../components/blogs/BlogCard';

const TABS = ['Users', 'Posts', 'Articles'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState('Users');
  const [results, setResults] = useState({ users: [], posts: [], blogs: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState('');

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(query);

    API.get(`/search?q=${encodeURIComponent(query)}`)
      .then(res => setResults(res.data.results))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [query]);

  const tabCounts = {
    Users: results.users.length,
    Posts: results.posts.length,
    Articles: results.blogs.length,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 mb-1">
          {searched ? `Results for "${searched}"` : 'Search'}
        </h1>
        <p className="text-sm text-gray-400">
          Search users by username · posts by tag · articles by category
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {!loading && searched && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-5">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {tabCounts[tab] > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                    {tabCounts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Users Tab */}
          {activeTab === 'Users' && (
            <div className="space-y-3">
              {results.users.length === 0 ? (
                <Empty icon={Users} text={`No users found for "@${searched}"`} />
              ) : (
                results.users.map(user => (
                  <UserRow key={user._id} user={user} />
                ))
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'Posts' && (
            <div className="space-y-4">
              {results.posts.length === 0 ? (
                <Empty icon={FileText} text={`No posts found with tag "#${searched}"`} />
              ) : (
                results.posts.map(post => (
                  <SimplePostCard key={post._id} post={{
                    ...post,
                    author: {
                      userId: post.user?._id,
                      username: post.user?.username,
                      fullName: post.user?.profile?.fullName || post.user?.username,
                      avatar: post.user?.profile?.avatar?.url || null,
                    }
                  }} />
                ))
              )}
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === 'Articles' && (
            <div className="space-y-4">
              {results.blogs.length === 0 ? (
                <Empty icon={BookOpen} text={`No articles found in category "${searched}"`} />
              ) : (
                results.blogs.map(blog => (
                  <BlogCard key={blog._id} post={blog} />
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* No query */}
      {!loading && !searched && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">Type something in the search bar to get started</p>
        </div>
      )}
    </div>
  );
}

function UserRow({ user }) {
  const name = user.profile?.fullName || user.username;
  const avatar = user.profile?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=475569&bold=true`;

  return (
    <Link
      to={`/profile/${user._id}`}
      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition"
    >
      <img src={avatar} alt={name} className="w-11 h-11 rounded-full object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-400">@{user.username}</p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">
        {user.followers?.length || 0} followers
      </span>
    </Link>
  );
}

function Empty({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-8 h-8 text-gray-300 mb-3" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
