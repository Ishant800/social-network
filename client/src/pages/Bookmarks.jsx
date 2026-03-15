import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleBookmark } from "../features/post/postSlice";

export default function Bookmarks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { bookmarks } = useSelector((state) => state.posts);

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center text-sm text-slate-500">
        No bookmarks yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((post) => {
        const postId = post._id || post.id;
        const authorName = post.user?.name || "User";
        const time = post.createdAt
          ? new Date(post.createdAt).toLocaleString()
          : "";
        return (
          <div
            key={postId}
            className="bg-white border border-slate-100 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {authorName}
                </p>
                <p className="text-xs text-slate-500">{time}</p>
              </div>
              <button
                onClick={() => dispatch(toggleBookmark(post))}
                className="text-xs text-rose-600 hover:underline"
              >
                Remove
              </button>
            </div>

            <p className="text-sm text-slate-800 mt-3">
              {post.content || "No content"}
            </p>

            <div className="mt-3">
              <button
                onClick={() => navigate(`/post/${postId}`)}
                className="text-xs text-indigo-600 hover:underline"
              >
                View details
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
