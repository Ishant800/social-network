import { Shield, Bell, Eye, Smartphone } from 'lucide-react';

export default function Settings() {
  const options = [
    { icon: Shield, title: "Privacy & Security", desc: "Two-factor authentication and data visibility", color: "text-emerald-600 bg-emerald-50" },
    { icon: Bell, title: "Notification Sync", desc: "Push, Email and SMS alerts for mentions", color: "text-amber-600 bg-amber-50" },
    { icon: Eye, title: "Interface Theme", desc: "Custom colors and high-contrast accessibility", color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="w-full max-w-4xl space-y-10 animate-in fade-in">
      <header>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h2>
        <p className="text-slate-500 font-bold mt-2">Personalize your MeroRoom experience</p>
      </header>
      
      <div className="grid gap-4">
        {options.map((opt) => (
          <div key={opt.title} className="group bg-white p-6 rounded-[2rem] border border-gray-50 flex items-center gap-6 cursor-pointer hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${opt.color} group-hover:scale-110 transition-transform shadow-inner`}>
              <opt.icon className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-black text-slate-900">{opt.title}</h4>
              <p className="text-sm text-slate-500 font-medium mt-0.5">{opt.desc}</p>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all font-bold text-lg">
              →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}