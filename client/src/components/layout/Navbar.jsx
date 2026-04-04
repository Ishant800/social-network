import { Bell, Search } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const image =
    user?.profileImage?.url ||
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4XoGpSkgybe5fubd2XlhO_zNXDF9CjbTrEw&s';

  return (
    <header className="w-full border-b border-white/60 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 lg:px-8">
        <p className="font-display text-xl font-bold tracking-tight text-[#3f3fe3]">
          Atheneum
        </p>

        <div className="hidden w-full max-w-md px-4 md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Explore thoughts..."
              className="w-full rounded-2xl bg-[#dfe3e6] py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 md:hidden">
            <Search className="h-5 w-5" />
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-[#4e44d4]" />
          </button>
          <img
            src={image}
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
