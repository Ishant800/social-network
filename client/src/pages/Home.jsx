import { useEffect } from "react";
import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";
import PostSkeleton from "../components/skeleton/postSkeleton";
import { useDispatch, useSelector } from "react-redux";
import { getPosts } from "../features/post/postSlice";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const dispatch = useDispatch()
  const {isLoading,isError,posts ,message} = useSelector((state)=> state.posts) 
  useEffect(() => {
   
    if( !isLoading &&posts?.length ===  0){
     dispatch(getPosts())
     console.log("posts api hitted")
     
    }
  }, [dispatch]);

  const navigate = useNavigate()
  const handleCreatePost=()=>{
     navigate("/post/create")
  }



  return (
    <>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
        <PostSkeleton/>
        <PostSkeleton/>
        <PostSkeleton/>
        <PostSkeleton/>
        <PostSkeleton/>
        </div>
      )}

      {isError && (
        <div className="bg-white border border-rose-100 rounded-2xl p-4 text-sm text-rose-600">
          {message || "Something went wrong while loading posts."}
        </div>
      )}

           {!isLoading && posts?.length === 0 && !isError && (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500">
          No posts available right now. Be the first to share something!
        </div>
      )}
     
      

      {/* Posts */}
      {!isLoading &&
        posts?.length > 0 &&
        posts.map((post) => (
          <PostCard key={post.
            _id} post={post} />
        ))}
    </>
  );
}