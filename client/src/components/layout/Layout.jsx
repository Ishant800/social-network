import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import Navbar from './Navbar';
import NotificationManager from '../notifications/NotificationManager';

// Navbar height = 4rem (h-16)
const NAVBAR_H = 'h-16';
const NAVBAR_PT = 'pt-16';

export default function Layout({ children }) {
  const location = useLocation();
  const path = location.pathname;

  const isAuthPage       = path === '/login' || path === '/signup';
  const isFeedPage       = path === '/';
  const isFullPage       = path === '/chats' || path.startsWith('/discussionroom/');
  const isWidePage       = path.startsWith('/profile') || path === '/explore' ||
                           path.startsWith('/post/') || path.startsWith('/blog/');

  // Auth pages - no layout at all
  if (isAuthPage) {
    return <div className="min-h-dvh w-full">{children}</div>;
  }

  // Full-bleed pages (Chat, DiscussionRoom) - sidebar + full height content, no padding
  if (isFullPage) {
    return (
      <div className="min-h-dvh w-full flex flex-col">
        {/* Navbar */}
        <div className={`fixed inset-x-0 top-0 z-50 ${NAVBAR_H} border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-sm`}>
          <Navbar />
        </div>

        {/* Body below navbar */}
        <div className={`flex flex-1 ${NAVBAR_PT} h-dvh`}>
          {/* Sidebar */}
          <aside className="hidden lg:flex w-64 shrink-0 border-r border-gray-100">
            <div className="w-full fixed overflow-y-auto">
              <Sidebar />
            </div>
          </aside>

          {/* Full-height content - no padding */}
          <main className="flex-1 min-w-0 overflow-hidden">
            {children}
          </main>
        </div>

        <div className="lg:hidden">
          <MobileNav />
        </div>

        <NotificationManager />
      </div>
    );
  }

  // Standard pages
  return (
    <div className="min-h-dvh w-full">
      {/* Navbar */}
      <div className={`fixed inset-x-0 top-0 z-50 ${NAVBAR_H} border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-sm`}>
        <Navbar />
      </div>

      {/* Body */}
      <div className={`${NAVBAR_PT} mx-auto w-full max-w-screen-2xl px-4 sm:px-6`}>
        <div className={`grid grid-cols-1 lg:gap-8 py-6 ${
          isFeedPage
            ? 'lg:grid-cols-[256px_minmax(0,1fr)] xl:grid-cols-[256px_minmax(0,1fr)_320px] xl:gap-10'
            : 'lg:grid-cols-[256px_minmax(0,1fr)]'
        }`}>

          {/* Left sidebar */}
          <aside className="hidden lg:block">
            <div className="fixed top-20 h-[calc(100dvh-5.5rem)] overflow-y-auto">
              <Sidebar />
            </div>
          </aside>

          {/* Main content */}
          <section className="min-w-0 w-full pb-20 lg:pb-6">
            {isFeedPage ? (
              <div className="mx-auto w-full max-w-2xl">{children}</div>
            ) : isWidePage ? (
              children
            ) : (
              <div className="mx-auto w-full max-w-3xl">{children}</div>
            )}
          </section>

          {/* Right sidebar - feed only */}
          {isFeedPage && (
            <aside className="hidden xl:block">
              <div className="fixed top-20 h-[calc(100dvh-5.5rem)] overflow-y-auto">
                <RightSidebar />
              </div>
            </aside>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        <MobileNav />
      </div>

      <NotificationManager />
    </div>
  );
}
