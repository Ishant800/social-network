import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react';

export default function MobileNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 py-3 z-50">
      <div className="flex items-center justify-between">
        <button className="p-2 text-indigo-600">
          <Home className="w-6 h-6" />
        </button>
        <button className="p-2 text-slate-500 hover:text-indigo-600">
          <Compass className="w-6 h-6" />
        </button>
        
        {/* Prominent "Create" Button */}
        <button className="relative -top-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-200 active:scale-95 transition-transform border-4 border-white">
          <PlusCircle className="w-7 h-7" />
        </button>

        <button className="p-2 text-slate-500 hover:text-indigo-600">
          <Bell className="w-6 h-6" />
        </button>
        <button className="p-2 text-slate-500 hover:text-indigo-600">
          <User className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}