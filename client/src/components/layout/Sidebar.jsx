import { Home, Compass, MessageSquare, Bookmark, Settings, User, LogOut } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Compass, label: 'Explore' },
    { icon: MessageSquare, label: 'Messages' },
    { icon: Bookmark, label: 'Bookmarks' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      {/* User Profile Mini-Card */}
      <div className="flex items-center gap-3 p-2 mb-6 rounded-xl bg-indigo-50/50 border border-indigo-100">
        <img 
          src="https://ui-avatars.com/api/?name=Ishant&background=4f46e5&color=fff" 
          className="w-10 h-10 rounded-full shadow-sm"
          alt="Profile"
        />
        <div className="min-w-0">
          <p className="font-bold text-slate-900 truncate">Ishant</p>
          <p className="text-xs text-indigo-600 font-medium">@ishant</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
              item.active 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="font-medium text-[15px]">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Logout / Footer Action */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <button className="flex items-center gap-4 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-[15px]">Logout</span>
        </button>
      </div>
    </div>
  );
}