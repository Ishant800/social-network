import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import Navbar from './Navbar';
import NotificationManager from '../notifications/NotificationManager';

export default function Layout({ children }) {
  const { pathname } = useLocation();

  const isAuthPage =
    pathname === '/login' || pathname === '/signup';
  const isFeedPage = pathname === '/';
  const isFullPage = pathname === '/chats' || pathname.startsWith('/discussionroom/');
  const isWidePage = pathname.startsWith('/profile') || pathname === '/explore' ||
                     pathname.startsWith('/post/') || pathname.startsWith('/blog/') ||
                     pathname === '/friendsexplore';
  
  // Form pages handle their own layout completely
  const isFormPage = pathname === '/post/create' || 
                     pathname === '/blog/create' || 
                     pathname === '/profile/edit' ||
                     pathname === '/post/edit';
  
  // Show right sidebar on home, explore, and profile pages
  const showRightSidebar = isFeedPage || pathname === '/explore' || pathname.startsWith('/profile/');

  // Auth pages - bare, no chrome
  if (isAuthPage) return <>{children}</>;

  // Form pages - render with navbar/sidebars but let pages handle their own content layout
  if (isFormPage) {
    return (
      <div className="min-h-dvh flex flex-col">
        {/* Fixed Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-gray-100 bg-white/90 backdrop-blur-md">
          <Navbar />
        </header>

        {/* Fixed Left Sidebar */}
        <aside className="hidden lg:block fixed top-16 left-0 w-64 h-[calc(100dvh-4rem)] border-r border-gray-100 overflow-y-auto scrollbar-none z-40">
          <Sidebar />
        </aside>

        {/* Main content - form pages handle their own layout */}
        <main className="flex-1 pt-16 lg:ml-64">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <div className="lg:hidden">
          <MobileNav />
        </div>

        <NotificationManager />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">

      {/* Fixed Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <Navbar />
      </header>

      {/* Fixed Left Sidebar */}
      <aside className="hidden lg:block fixed top-16 left-0 w-64 h-[calc(100dvh-4rem)] border-r border-gray-100 overflow-y-auto scrollbar-none z-40">
        <Sidebar />
      </aside>

      {/* Fixed Right Sidebar - shows on home, explore, and profile pages */}
      {showRightSidebar && (
        <aside className="hidden lg:block fixed top-16 right-0 w-72 h-[calc(100dvh-4rem)] border-l border-gray-100 overflow-y-auto scrollbar-none z-40">
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
          <div className="max-w-2xl mx-auto px-4 py-6">
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
