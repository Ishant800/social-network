import API from '../../api/axios';

const normalizePost = (post) => ({
  ...post,
  feedType: 'post',
});

const fetchFeed = async ({ feedType = 'posts', page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ 
    page: String(page),
    limit: String(limit) 
  });
  
  const endpoint = feedType === 'blogs' ? '/feed/blogs' : '/feed/posts';
  const { data } = await API.get(`${endpoint}?${params.toString()}`);
  
  // Handle both 'posts', 'blogs', and 'items' array formats
  const rawItems = data.items || data.posts || data.blogs || [];
  const items = rawItems.map((item) => ({ 
    ...item, 
    id: item._id || item.id, 
    feedType: feedType === 'blogs' ? 'blog' : 'post' 
  }));
  
  return {
    items,
    hasMore: Boolean(data.hasMore || data.pagination?.hasMore),
    page: data.page || data.pagination?.page || page,
    total: data.meta?.total || data.pagination?.total || 0,
    hasInterests: data.hasInterests
  };
};

const createPost = async (formData) => {
  const response = await API.post('/post/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return normalizePost(response.data.post);
};

const likePost = async (postId) => {
  const response = await API.post(`/likes/post/${postId}/react`, { reactionType: 'like' });
  return { postId, ...response.data };
};

const unlikePost = async (postId) => {
  const response = await API.delete(`/likes/post/${postId}/react`);
  return { postId, ...response.data };
};

const reactToPost = async (postId, reactionType) => {
  const response = await API.post(`/likes/post/${postId}/react`, { reactionType });
  return { postId, ...response.data };
};

const likeBlog = async (blogId) => {
  const response = await API.post(`/likes/blog/${blogId}/like`);
  return {
    postId: blogId, // Keep consistent naming for reducer
    ...response.data
  };
};

const unlikeBlog = async (blogId) => {
  const response = await API.delete(`/likes/blog/${blogId}/unlike`);
  return {
    postId: blogId, // Keep consistent naming for reducer
    ...response.data
  };
};

const getPostDetails = async (postId) => {
  const response = await API.get(`/post/post-details/${postId}`);
  return normalizePost(response.data.post);
};

const getBlogDetails = async (blogId) => {
  const response = await API.get(`/blog/blog-details/${blogId}`);
  return response.data.blog;
};

const updatePost = async (postId, formData) => {
  const response = await API.put(`/post/update/${postId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return normalizePost(response.data.post);
};

const exploreBlogs = async ({ search = '', skip = 0, limit = 24, exclude = '', category = '' } = {}) => {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });
  if (search) params.set('search', search);
  if (exclude) params.set('exclude', exclude);
  if (category) params.set('category', category);
  const response = await API.get(`/blog/explore?${params.toString()}`);
  return response.data;
};

const updateInterestScores = async ({ action, category, tags, reactionType }) => {
  const response = await API.post('/feed/interest-scores', {
    action,
    category,
    tags,
    reactionType
  });
  return response.data;
};

export default {
  fetchFeed,
  createPost,
  updatePost,
  likePost,
  unlikePost,
  reactToPost,
  likeBlog,
  unlikeBlog,
  getPostDetails,
  getBlogDetails,
  exploreBlogs,
  updateInterestScores,
};
