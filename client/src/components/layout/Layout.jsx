import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import Navbar from './Navbar';
import NotificationManager from '../notifications/NotificationManager';

export default function Layout({ children }) {
  const { pathname } = useLocation();

  const isAuthPage =
    pathname === '/login' || pathname === '/signup' || pathname === '/verify-email';
  const isFeedPage = pathname === '/';
  const isFullPage = pathname === '/chats' || pathname.startsWith('/discussionroom/');
  const isWidePage = pathname.startsWith('/profile') || pathname === '/explore' ||
                     pathname.startsWith('/post/') || pathname.startsWith('/blog/') ||
                     pathname === '/friendsexplore';
  
  // Show right sidebar on home, explore, and profile pages
  const showRightSidebar = isFeedPage || pathname === '/explore' || pathname.startsWith('/profile/');

  // Auth pages - bare, no chrome
  if (isAuthPage) return <>{children}</>;

  return (
    <div className="app-shell min-h-dvh flex flex-col">

      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--border-soft)] bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <Navbar />
      </header>

      <aside className="hidden lg:block fixed top-16 left-0 w-64 h-[calc(100dvh-4rem)] border-r border-[var(--border-soft)] bg-white/40 overflow-y-auto thin-scrollbar z-40">
        <Sidebar />
      </aside>

      {showRightSidebar && (
        <aside className="hidden lg:block fixed top-16 right-0 w-72 h-[calc(100dvh-4rem)] border-l border-[var(--border-soft)] bg-gradient-to-b from-white/90 to-teal-50/20 overflow-y-auto thin-scrollbar z-40">
          <RightSidebar />
        </aside>
      )}

      {/* Main content area */}
      <main className={`
        flex-1 pt-16
        ${isFullPage ? 'lg:ml-64' : 'lg:ml-64'}
        ${showRightSidebar ? 'lg:mr-72' : ''}
      `}>
        {isFullPage ? (
          // Chat / DiscussionRoom: full height, zero padding
          <div className="h-[calc(100dvh-4rem)]">
            {children}
          </div>
        ) : isFeedPage ? (
          <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8">
            {children}
          </div>
        ) : isWidePage ? (
          <div className="px-4 py-6">
            {children}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6">
            {children}
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      <NotificationManager />
    </div>
  );
}
