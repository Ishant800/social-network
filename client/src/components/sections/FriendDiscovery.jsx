import { useState } from 'react';
import { UserPlus, Clock, Check, X, Users } from 'lucide-react';

export default function FriendsDiscovery() {
  const [activeTab, setActiveTab] = useState('discovery');

  // Improved dummy data with placeholder images
  const people = [
    { 
      name: "Ankit Jha", 
      bio: "Full Stack Developer | Coffee Lover ☕", 
      mutuals: 12,
      avatar: "https://i.pravatar.cc/150?u=ankit&size=200"
    },
    { 
      name: "Suman KC", 
      bio: "UI/UX Designer at TechHome ✨", 
      mutuals: 5,
      avatar: "https://i.pravatar.cc/150?u=suman&size=200"
    },
    { 
      name: "Priya Singh", 
      bio: "Product Manager | Travel Enthusiast 🌍", 
      mutuals: 8,
      avatar: "https://i.pravatar.cc/150?u=priya&size=200"
    },
    { 
      name: "Rohan Das", 
      bio: "Mobile Developer | Open Source Contributor 💻", 
      mutuals: 3,
      avatar: "https://i.pravatar.cc/150?u=rohan&size=200"
    },
  ];

  const requests = [
    { 
      name: "Aditi Sharma", 
      bio: "Backend Engineer | Node.js & Go", 
      time: "2h ago",
      avatar: "https://i.pravatar.cc/150?u=aditi&size=200"
    },
    { 
      name: "Rahul Verma", 
      bio: "Data Scientist | ML & AI Enthusiast", 
      time: "5h ago",
      avatar: "https://i.pravatar.cc/150?u=rahul&size=200"
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-700">
      
      {/* Header & Segmented Control */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Community
          </h2>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            {activeTab === 'discovery' 
              ? 'Expand your network with like-minded professionals' 
              : 'Review and manage your pending connection requests'}
          </p>
        </div>

        {/* Segmented Toggle */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-fit border border-slate-200 shadow-sm backdrop-blur-sm">
          <button 
            onClick={() => setActiveTab('discovery')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'discovery' 
                ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <UserPlus className="w-4 h-4" /> 
            <span>Discovery</span>
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
              activeTab === 'requests' 
                ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Clock className="w-4 h-4" /> 
            <span>Requests</span>
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activeTab === 'discovery' ? (
          people.map((person) => (
            <article 
              key={person.name} 
              className="group bg-white p-5 rounded-3xl border border-slate-100 
                         flex items-center gap-5 transition-all duration-300 
                         hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 
                         hover:-translate-y-0.5"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img 
                  src={person.avatar} 
                  alt={`${person.name}'s profile`}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-md 
                             group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white 
                               text-[10px] font-bold px-1.5 py-0.5 rounded-full 
                               border-2 border-white shadow-sm">
                  ✓
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                  {person.name}
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5 line-clamp-1">
                  {person.bio}
                </p>
                
                {/* Mutual Friends */}
                <div className="flex items-center gap-2 mt-3">
                  <Users className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-indigo-600">
                    {person.mutuals} mutual connections
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-indigo-600 
                           text-white px-5 py-2.5 rounded-xl text-sm font-semibold 
                           hover:from-indigo-600 hover:to-indigo-700 
                           transition-all duration-200 shadow-md shadow-indigo-100/50
                           active:scale-95 focus:outline-none focus:ring-2 
                           focus:ring-indigo-500 focus:ring-offset-2"
                aria-label={`Connect with ${person.name}`}
              >
                Connect
              </button>
            </article>
          ))
        ) : (
          requests.map((request) => (
            <article 
              key={request.name} 
              className="group bg-white p-5 rounded-3xl border border-slate-100 
                         flex items-center gap-5 transition-all duration-300 
                         hover:border-indigo-200 hover:shadow-lg"
            >
              {/* Avatar */}
              <img 
                src={request.avatar} 
                alt={`${request.name}'s profile`}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-sm 
                           flex-shrink-0"
                loading="lazy"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                  {request.name}
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5 line-clamp-1">
                  {request.bio}
                </p>
                <p className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 
                  <span>Requested {request.time}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <button 
                  className="p-2.5 bg-emerald-500 text-white rounded-xl 
                             hover:bg-emerald-600 transition-all duration-200 
                             shadow-md shadow-emerald-100/50 active:scale-95
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 
                             focus:ring-offset-2"
                  aria-label={`Accept request from ${request.name}`}
                >
                  <Check className="w-5 h-5" />
                </button>
                <button 
                  className="p-2.5 bg-slate-100 text-slate-500 rounded-xl 
                             hover:bg-rose-50 hover:text-rose-500 
                             transition-all duration-200 active:scale-95
                             focus:outline-none focus:ring-2 focus:ring-rose-500 
                             focus:ring-offset-2"
                  aria-label={`Decline request from ${request.name}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Empty State (optional enhancement) */}
      {((activeTab === 'discovery' && people.length === 0) || 
        (activeTab === 'requests' && requests.length === 0)) && (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            {activeTab === 'discovery' ? (
              <UserPlus className="w-8 h-8 text-slate-400" />
            ) : (
              <Clock className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-700">
            {activeTab === 'discovery' ? 'No suggestions right now' : 'No pending requests'}
          </h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'discovery' 
              ? 'Check back later for new connection suggestions based on your interests.' 
              : "When someone sends you a connection request, it'll appear here."}
          </p>
        </div>
      )}
    </div>
  );
}