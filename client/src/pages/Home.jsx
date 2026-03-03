
import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";

const dummyPosts = [
    {
    id: 1,
    author: "Ishant",
    username: "ishant_dev",
    time: "2 hours ago",
    content: "Just finished building the new MeroRoom UI gallery! What do you guys think of this multi-image layout? 🚀 #webdev #react #tailwindcss",
    likes: 124,
    comments: 18,
    // Add multiple images here to test the grid
    images: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159" // 5th image (will show +1)
    ]
  },
  {
    id: 2,
    author: "Ishant",
    username: "ishant",
    time: "2h",
    content: "Built the first version of our social app feed today. Next step is comments and notifications.",
    images: ["https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"],
    likes: 34,
    comments: 8,
    shares: 3,
  },
  {
    id: 3,
    author: "Sita",
    username: "sita.dev",
    time: "4h",
    content: "Working on responsive layout fixes. Desktop and mobile views are finally behaving properly.",
    image: "",
    likes: 21,
    comments: 4,
    shares: 1,
  },
  {
    id: 4,
    author: "Rabin",
    username: "rabin.codes",
    time: "6h",
    content: "Just deployed backend auth routes. Login, register, and token checks are now connected.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    likes: 56,
    comments: 12,
    shares: 7,
  },
  {
    id: 5,
    author: "Maya",
    username: "maya.ui",
    time: "8h",
    content: "UI polish day: cleaned spacing, fixed cards, and standardized buttons across the app.",
    image: "",
    likes: 18,
    comments: 2,
    shares: 0,
  },
];

export default function Home() {
 return (
    <> 
      <CreatePost />
      {dummyPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}
