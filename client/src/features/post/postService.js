import API from '../../api/axios';

const normalizePost = (post) => ({
  ...post,
  feedType: 'post',
});

const fetchFeed = async ({ feedType = 'posts', page = 1, limit = 15 } = {}) => {
  const params = new URLSearchParams({ 
    page: String(page),
    limit: String(limit) 
  });
  
  const endpoint = feedType === 'articles' ? '/feed/blogs' : '/feed/posts';
  const { data } = await API.get(`${endpoint}?${params.toString()}`);
  
  const items = feedType === 'articles' 
    ? (data.blogs || []).map((item) => ({ ...item, id: item._id || item.id, feedType: 'blog' }))
    : (data.posts || []).map((item) => ({ ...item, id: item._id || item.id, feedType: 'post' }));
  
  return {
    items,
    hasMore: Boolean(data.pagination?.hasMore),
    page: data.pagination?.page || page,
    total: data.pagination?.total || 0
  };
};

const createPost = async (postData) => {
  const response = await API.post('/post/create', postData);
  return normalizePost(response.data.post);
};

const likePost = async (postId) => {
  const response = await API.post(`/likes/post/${postId}/like`);
  return {
    postId,
    ...response.data
  };
};

const unlikePost = async (postId) => {
  const response = await API.delete(`/likes/post/${postId}/unlike`);
  return {
    postId,
    ...response.data
  };
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

const updatePost = async (postId, postData) => {
  const response = await API.put(`/post/${postId}`, postData);
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

export default {
  fetchFeed,
  createPost,
  updatePost,
  likePost,
  unlikePost,
  likeBlog,
  unlikeBlog,
  getPostDetails,
  getBlogDetails,
  exploreBlogs,
};
