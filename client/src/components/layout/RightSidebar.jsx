import { MessageSquare } from 'lucide-react';
import { useNavigate} from 'react-router-dom';

export default function RightSidebar() {

  
  const suggestedUsers = [
    { name: 'Alex Rivera', handle: 'arivera', avatar: 'https://i.pravatar.cc/150?u=alex&size=80' },
    { name: 'Sarah Chen', handle: 'schen_dev', avatar: 'https://i.pravatar.cc/150?u=sarah&size=80' },
  ];

  const onlineFriends = [
    { name: 'John Doe', status: 'Active now', avatar: 'https://i.pravatar.cc/150?u=john&size=80' },
    { name: 'Jane Smith', status: '2m ago', avatar: 'https://i.pravatar.cc/150?u=jane&size=80' },
    { name: 'Mike Ross', status: 'Active now', avatar: 'https://i.pravatar.cc/150?u=mike&size=80' },
    { name: 'Rachel Zane', status: 'Active now', avatar: 'https://i.pravatar.cc/150?u=rachel&size=80' },
  ];

  const navigate = useNavigate()

  return (
    <div className="w-full space-y-4">
      
      {/* Suggested Accounts */}
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-900">Suggested</span>
          <button onClick={()=> navigate("/friendsexplore")} className="text-xs text-indigo-600 hover:underline">See all</button>
        </div>
        
        <div className="p-2">
          {suggestedUsers.map((user) => (
            <div key={user.handle} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500">@{user.handle}</p>
                </div>
              </div>
              <button className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg transition">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Online Friends */}
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900">Online</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
          <MessageSquare className="w-4 h-4 text-slate-400" />
        </div>
        
        <div className="p-2">
          {onlineFriends.map((friend) => (
            <button key={friend.name} className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg text-left transition">
              <div className="relative">
                <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full object-cover" />
                {friend.status === 'Active now' && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>
              
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{friend.name}</p>
                <p className="text-xs text-slate-500">{friend.status}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}