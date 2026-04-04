export default function PostActions({ likes, comments, shares }) {
  return (
    <div className="flex items-center justify-between border-t pt-3 text-sm text-gray-500">
      <button className="hover:text-[#3f3fe3]">Like {likes}</button>
      <button className="hover:text-[#3f3fe3]">Comment {comments}</button>
      <button className="hover:text-[#3f3fe3]">Share {shares}</button>
    </div>
  );
}
