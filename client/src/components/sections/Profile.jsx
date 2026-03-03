import { MapPin, Link as LinkIcon, Calendar, Edit3, Grid, Image as ImageIcon, Heart } from 'lucide-react';

export default function Profile() {
  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Precision Header */}
      <div className="relative h-64 w-full rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100/50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-pink-500">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute -bottom-16 left-8">
          <img 
            src="https://ui-avatars.com/api/?name=Ishant&size=128&background=fff&color=4f46e5" 
            className="h-36 w-36 rounded-[2rem] border-[6px] border-white shadow-xl object-cover"
            alt="Profile"
          />
        </div>
      </div>

      {/* Profile Detail Card */}
      <div className="mt-4 rounded-[2.5rem] bg-white p-8 pt-20 shadow-sm border border-gray-100/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">Ishant</h2>
            <p className="text-indigo-600 font-bold text-lg mt-1">@ishant_dev</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-bold text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
              <Edit3 className="h-4 w-4" /> Edit Profile
            </button>
          </div>
        </div>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600 font-medium">
          Full-stack developer building <span className="text-indigo-600 font-bold">MeroRoom</span>. 
          Obsessed with micro-interactions, clean architecture, and the future of social web. 🚀
        </p>

        <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full"><MapPin className="h-4 w-4 text-indigo-500" /> Kathmandu, Nepal</div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full text-indigo-600 cursor-pointer hover:bg-indigo-50 transition"><LinkIcon className="h-4 w-4" /> meroroom.com</div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full"><Calendar className="h-4 w-4 text-slate-400" /> Joined March 2026</div>
        </div>

        {/* High-End Stats */}
        <div className="mt-10 flex gap-12 border-t border-gray-50 pt-8">
          {[ ['1.2k', 'Followers'], ['482', 'Following'], ['156', 'Posts'] ].map(([val, label]) => (
            <div key={label}>
              <p className="text-2xl font-black text-slate-900">{val}</p>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}