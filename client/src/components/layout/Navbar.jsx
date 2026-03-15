import { Search, Bell, MessageSquare, PlusSquare } from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';

export default function Navbar() {

  const dispatch = useDispatch()
    const {user} = useSelector((state)=> state.auth)
  // useEffect


  const image = user?.profileImage?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4XoGpSkgybe5fubd2XlhO_zNXDF9CjbTrEw&s"

   
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
            <span className="text-slate-800 font-bold text-xl">Sanyukt</span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md px-4">
          <Search className="absolute left-7 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search communities, people..."
            className="w-full rounded-sm border-none outline-none bg-gray-100 py-2.5 pl-11 pr-4 text-sm "
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
        
          
          <div className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer transition">
            <Bell className="h-6 w-6" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold border-2 border-white">
              3
            </span>
          </div>
          
          <div className="h-9 w-9 overflow-hidden transition cursor-pointer">
            <img src={image} alt="Profile" className='rounded-full' />
          </div>
        </div>
      </div>
    </header>
  );
}