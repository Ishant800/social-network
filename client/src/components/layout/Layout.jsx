import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isFeedPage = location.pathname === '/';
  const isProfilePage = location.pathname === '/profile';
  const isExplorePage = location.pathname === '/explore';
  const isPostDetailsPage = location.pathname.startsWith('/post/');
  const isBlogDetailsPage = location.pathname.startsWith('/blog/');
  const isDiscussionRoomPage = location.pathname.startsWith('/discussionroom/');
  const isWidePage =
    isProfilePage ||
    isExplorePage ||
    isPostDetailsPage ||
    isBlogDetailsPage ||
    isDiscussionRoomPage;

  if (isAuthPage) {
    return (
      <div className="app-shell min-h-dvh w-full">
        <div className="mx-auto flex min-h-dvh w-full max-w-lg items-center justify-center px-4 py-10">
          <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-teal-900/10 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-dvh w-full ">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-(--border) bg-white/90 shadow-sm shadow-teal-900/5 backdrop-blur-md">
        <Navbar />
      </div>

      <main className="mx-auto w-full max-w-400 px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:pb-10 lg:pt-24">
        <div
          className={`grid grid-cols-1 ${
            isDiscussionRoomPage ? 'lg:gap-5 xl:gap-6' : 'lg:gap-8'
          } ${
            isFeedPage
              ? 'lg:grid-cols-[minmax(0,256px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,256px)_minmax(0,1fr)_minmax(0,320px)] xl:gap-10'
              : 'lg:grid-cols-[minmax(0,256px)_minmax(0,1fr)]'
          }`}
        >
          <aside className="hidden lg:block">
  <div className="fixed top-18 h-[calc(100dvh-6rem)] w-64 overflow-y-auto">
              <Sidebar />
            </div>
          </aside>

          <section className={`min-w-0 w-full ${isWidePage ? 'max-w-none' : ''}`}>
            {isFeedPage ? (
              <div className="mx-auto w-full max-w-2xl">{children}</div>
            ) : isWidePage ? (
              children
            ) : (
              <div className="mx-auto w-full max-w-4xl">{children}</div>
            )}
          </section>

          {isFeedPage && (
            <aside className="hidden xl:block">
              <div className="thin-scrollbar fixed top-20 h-[calc(100dvh-5rem)] w-80 overflow-y-auto pr-1 sm:top-24 sm:h-[calc(100dvh-6rem)]">
                <RightSidebar />
              </div>
            </aside>
          )}
        </div>
      </main>

      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
