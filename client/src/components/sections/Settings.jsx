import { Shield, Bell, Eye, ChevronRight } from 'lucide-react';

export default function Settings() {
  const options = [
    { icon: Shield, title: "Privacy & Security", desc: "Two-factor auth and data visibility", path: "/settings/privacy" },
    { icon: Bell, title: "Notifications", desc: "Push, email and SMS alerts", path: "/settings/notifications" },
    { icon: Eye, title: "Display", desc: "Theme and accessibility options", path: "/settings/display" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4">
      
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Options List */}
      <div className="space-y-2">
        {options.map((opt) => (
          <a
            key={opt.title}
            href={opt.path}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition"
          >
            <div className="p-2 bg-slate-100 rounded-lg">
              <opt.icon className="w-4 h-4 text-slate-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{opt.title}</p>
              <p className="text-xs text-slate-500">{opt.desc}</p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>
        ))}
      </div>
    </div>
  );
}