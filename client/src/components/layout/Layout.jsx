import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import MobileNav from "./MobileNav";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900">
      <Navbar />
      
      {/* pt-20: Accounts for fixed navbar height 
        Grid layout: 280px | Fluid | 320px
      */}
      <main className="mx-auto max-w-7xl px-4 pt-20 pb-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_320px]">
          
          {/* Left Sidebar - Sticky */}
          <aside className="hidden lg:block lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
            <Sidebar />
          </aside>

          {/* Main Feed */}
          <section className="min-w-0 space-y-6">
            {children}
          </section>

          {/* Right Sidebar - Sticky */}
          <aside className="hidden xl:block xl:sticky xl:top-20 xl:h-[calc(100vh-5rem)]">
            <RightSidebar />
          </aside>
        </div>
      </main>

      <MobileNav/>
    </div>
  );
}