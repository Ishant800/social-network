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
    return <div className="min-h-screen w-full bg-white">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f7f9] text-slate-900">
      <div className="fixed inset-x-0 top-0 z-50">
        <Navbar />
      </div>

      <main
        className={`mx-auto px-4 pb-24 pt-20 lg:pb-8 lg:pt-24 ${
          isDiscussionRoomPage ? 'max-w-390 lg:px-5' : 'max-w-360 lg:px-6'
        }`}
      >
        <div
          className={`grid grid-cols-1 ${
            isDiscussionRoomPage ? 'lg:gap-5 xl:gap-6' : 'lg:gap-8'
          } ${
            isFeedPage
              ? 'lg:grid-cols-[256px_minmax(0,1fr)] xl:grid-cols-[256px_minmax(0,1fr)_320px] xl:gap-10'
              : 'lg:grid-cols-[256px_minmax(0,1fr)]'
          }`}
        >
          <aside className="hidden lg:block">
            <div className="thin-scrollbar fixed top-24 h-[calc(100vh-7rem)] w-64 overflow-y-auto">
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
              <div className="thin-scrollbar fixed top-24 h-[calc(100vh-7rem)] w-80 overflow-y-auto pr-1">
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
