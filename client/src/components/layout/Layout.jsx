import { useLocation } from 'react-router-dom';
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import MobileNav from "./MobileNav";
import Navbar from './Navbar';

export default function Layout({ children }) {
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isFeedPage = location.pathname === '/';

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]"> {/* Slightly cooler gray for realism */}
      {/* 1. FIXED NAVBAR (Added glass effect) */}
      <div className="fixed top-0 inset-x-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Navbar />
      </div>
      
      <main className="mx-auto max-w-[1440px] px-6 pt-24 pb-24 lg:pb-8">
        <div className="flex justify-between gap-10">
          
          {/* 2. FIXED LEFT SIDEBAR (Widened to 300px) */}
          <aside className="hidden lg:block w-[300px] flex-shrink-0">
            <div className="fixed top-24 w-[300px] h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar pr-2">
              <Sidebar />
            </div>
          </aside>

          {/* 3. CENTER CONTENT */}
          <section className={`flex-1 min-w-0 ${!isFeedPage ? 'max-w-3xl mx-auto' : ''}`}>
            {children} 
          </section>

          {/* 4. FIXED RIGHT SIDEBAR (Widened to 350px) */}
          {isFeedPage && (
            <aside className="hidden xl:block w-[350px] flex-shrink-0">
              <div className="fixed top-24 w-[350px] h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
                <RightSidebar />
              </div>
            </aside>
          )}
          
        </div>
      </main>

      <MobileNav />
    </div>
  );
}