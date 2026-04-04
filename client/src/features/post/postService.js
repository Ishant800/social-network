import API from "../../api/axios";

const normalizePost = (post) => ({
    ...post,
    feedType: "post",
});

const normalizeBlog = (blog) => ({
    ...blog,
    id: blog._id,
    feedType: "blog",
    user: {
        _id: blog.author?._id,
        username: blog.author?.username,
        name: blog.author?.username,
        profileImage: blog.author?.avatar ? { url: blog.author.avatar } : null,
    },
    content: blog.summary || blog.content?.body || "",
    media: blog.coverImage?.url ? [{ url: blog.coverImage.url }] : [],
    tags: blog.tags || [],
    likesCount: blog.stats?.likes || 0,
    commentsCount: blog.stats?.comments || 0,
});

const posts = async ()=>{
    const [postResponse, blogResponse] = await Promise.all([
        API.get("/post/randomposts"),
        API.get("/blog/randomblogs"),
    ]);

    const allPosts = (postResponse.data.posts || []).map(normalizePost);
    const allBlogs = (blogResponse.data.blogs || []).map(normalizeBlog);

    return [...allPosts, ...allBlogs].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
}

const createPost = async (postData) =>{
    const response = await API.post("/post/create",postData)
    return normalizePost(response.data.post)
}

const likePost = async (postId) => {
    const response = await API.post(`/likes/post/like/${postId}`)
    return response.data
}

const unlikePost = async (postId) => {
    const response = await API.post(`/likes/post/unlike/${postId}`)
    return response.data
}

const getPostDetails = async (postId) => {
    const response = await API.get(`/post/post-details/${postId}`)
    return normalizePost(response.data.post)
}

const getBlogDetails = async (blogId) => {
    const response = await API.get(`/blog/blog-details/${blogId}`)
    return response.data.blog
}

export default {posts,createPost,likePost,unlikePost,getPostDetails,getBlogDetails};
