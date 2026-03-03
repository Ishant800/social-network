import { UserPlus, MessageSquare } from 'lucide-react';

export default function RightSidebar() {
  const suggestedUsers = [
    { name: 'Alex Rivera', handle: 'arivera', img: 'AR' },
    { name: 'Sarah Chen', handle: 'schen_dev', img: 'SC' },
  ];

  const onlineFriends = [
    { name: 'John Doe', status: 'Active now' },
    { name: 'Jane Smith', status: '2m ago' },
    { name: 'Mike Ross', status: 'Active now' },
    { name: 'Rachel Zane', status: 'Active now' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Suggested Accounts (Top) */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-900">Suggested Accounts</h2>
          <button className="text-xs font-semibold text-indigo-600 hover:underline">See all</button>
        </div>
        <div className="p-4 space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.handle} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {user.img}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate leading-tight">{user.name}</p>
                  <p className="text-[11px] text-slate-500">@{user.handle}</p>
                </div>
              </div>
              <button className="bg-slate-900 text-white text-xs px-4 py-1.5 rounded-full font-semibold hover:bg-slate-800 transition">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Online Users for Quick Chat (Bottom) */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900">Online Users</h2>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></span>
          </div>
          <MessageSquare className="w-4 h-4 text-slate-400" />
        </div>
        <div className="p-2">
          {onlineFriends.map((friend) => (
            <div key={friend.name} className="flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50/50 rounded-xl cursor-pointer transition-all group">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-slate-200 border border-white">
                    <img src={`https://ui-avatars.com/api/?name=${friend.name}`} className="rounded-full" alt="" />
                </div>
                {friend.status === "Active now" && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                  {friend.name}
                </p>
                <p className="text-[10px] text-slate-500 italic">{friend.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}