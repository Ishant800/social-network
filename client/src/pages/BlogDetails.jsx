import { ArrowLeft, CalendarDays, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import CommentSection from '../components/comment/commentSection';
import PostSkeleton from '../components/skeleton/postSkeleton';
import { getPostDetails, likePost, unlikePost } from '../features/post/postSlice';

const relatedArticles = [
  { title: 'Digital Twins in Modern Engineering', meta: 'Tech · 5 min read' },
  { title: 'The Zen of Minimalist Workspace', meta: 'Lifestyle · 8 min read' },
  { title: 'Collaborative Ecosystems', meta: 'Design · 12 min read' },
];

export default function BlogDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { posts, postDetails, likedPostIds, isLoading, isError, message } =
    useSelector((state) => state.posts);

  const postFromList = posts?.find((item) => (item._id || item.id) === postId);
  const post =
    postFromList ||
    ((postDetails?._id || postDetails?.id) === postId ? postDetails : null);

  useEffect(() => {
    if (!postId || postFromList) return;
    dispatch(getPostDetails(postId));
  }, [dispatch, postId, postFromList]);

  if (isLoading && !post) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-4">
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-4">
        <div className="rounded-2xl border border-rose-100 bg-white p-4 text-sm text-rose-600">
          {message || 'Something went wrong while loading this blog.'}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
          Blog not found.
        </div>
      </div>
    );
  }

  const postKey = post._id || post.id;
  const images = post.media || post.images || [];
  const authorName = post.user?.name || post.author || 'Julian Thorne';
  const authorRole = 'Senior Architectural Critic';
  const authorBio =
    'Architect and writer exploring the intersection of technology and the built environment.';
  const avatar =
    post.user?.profileImage?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`;
  const likeCount =
    typeof post.likesCount === 'number'
      ? post.likesCount
      : typeof post.likes === 'number'
        ? post.likes
        : Array.isArray(post.likes)
          ? post.likes.length
          : 0;
  const commentCount =
    typeof post.commentsCount === 'number'
      ? post.commentsCount
      : typeof post.comments === 'number'
        ? post.comments
        : Array.isArray(post.comments)
          ? post.comments.length
          : 0;
  const isLiked = likedPostIds?.includes(postKey);
  const dateLabel = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString()
    : 'Oct 24, 2023';
  const readTime = `${Math.max(4, Math.ceil((post.content?.length || 600) / 220))} min read`;
  const tags = post.tags?.length ? post.tags : ['Sustainability', 'Future Cities', 'Biophilic', 'Tech'];

  const handleLikeToggle = () => {
    if (!postKey) return;
    if (isLiked) {
      dispatch(unlikePost(postKey));
      return;
    }
    dispatch(likePost(postKey));
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-4 sm:px-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <article className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <header className="border-b border-slate-100 pb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {post.tags?.[0] || 'Architecture'}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {dateLabel}
              </span>
              <span>{readTime}</span>
            </div>

            <h1 className="mt-5 max-w-4xl font-['Plus_Jakarta_Sans'] text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
              {post.title || 'The Future of Sustainable Urban Living'}
            </h1>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={avatar} alt={authorName} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-slate-900">{authorName}</p>
                  <p className="text-sm text-slate-500">{authorRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-full border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <div className="pt-8">
            <p className="mb-8 text-lg leading-8 text-slate-600">
              {post.content}
            </p>

            {images.length > 0 && (
              <section className="mb-10 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
                <div className="overflow-hidden rounded-[1.5rem] bg-slate-100">
                  <img
                    src={images[0]}
                    alt="Featured media"
                    className="h-[420px] w-full object-cover"
                  />
                </div>
                <div className="grid gap-4">
                  {images.slice(1, 3).map((image, index) => (
                    <div key={index} className="overflow-hidden rounded-[1.5rem] bg-slate-100">
                      <img
                        src={image}
                        alt={`Blog media ${index + 2}`}
                        className="h-[202px] w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="space-y-6 text-[15px] leading-8 text-slate-700">
              <p>
                As our cities continue to grow, the dialogue between concrete and nature becomes increasingly
                critical. This exploration looks at how material choices, modular housing, and calmer public
                spaces can create more livable urban systems.
              </p>
              <p>
                Rather than sealed environments, these buildings breathe. The use of porous materials and
                reclaimed timber creates a tactile experience that grounds the inhabitant and makes dense
                neighborhoods feel more human.
              </p>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-slate-900">
                The Psychology of Space
              </h2>
              <p>
                Research indicates that access to natural light and greenery within walking distance of one&apos;s
                workspace reduces stress and improves focus. That is why more mixed-use towers are creating
                community floors for gardens, retail, and collaborative work.
              </p>
            </div>

            <section className="mt-10 border-t border-slate-100 pt-6">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-6 rounded-[1.5rem] bg-slate-50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Views</p>
                    <p className="text-sm font-semibold text-slate-900">12.4k</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLikeToggle}
                  className={`flex items-center gap-3 ${isLiked ? 'text-rose-600' : 'text-slate-500'}`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <div className="text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Likes</p>
                    <p className="text-sm font-semibold text-slate-900">{likeCount}</p>
                  </div>
                </button>
                <div className="flex items-center gap-3 text-slate-500">
                  <MessageCircle className="h-5 w-5" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Comments</p>
                    <p className="text-sm font-semibold text-slate-900">{commentCount}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-10">
              <CommentSection postId={postId} compact />
            </div>
          </div>
        </article>

        <aside className="space-y-5">
          <section className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">About the author</h2>
            <div className="mt-5 text-center">
              <img src={avatar} alt={authorName} className="mx-auto h-20 w-20 rounded-full object-cover" />
              <h3 className="mt-4 font-['Plus_Jakarta_Sans'] text-xl font-bold text-slate-900">{authorName}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500">{authorBio}</p>
              <button className="mt-5 w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
                Follow
              </button>
              <button className="mt-3 w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">
                View profile
              </button>
            </div>
          </section>

          <section className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">More from Atheneum</h2>
            <div className="mt-5 space-y-4">
              {relatedArticles.map((item) => (
                <div key={item.title} className="rounded-[1.25rem] bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold leading-6 text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
