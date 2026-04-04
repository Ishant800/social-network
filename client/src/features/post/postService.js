import API from '../../api/axios';

const normalizePost = (post) => ({
  ...post,
  feedType: 'post',
});

const fetchFeed = async ({ cursor, limit = 15 } = {}) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set('cursor', cursor);
  }
  const { data } = await API.get(`/feed/home?${params.toString()}`);
  const items = (data.items || []).map((item) => ({
    ...item,
    id: item._id || item.id,
  }));
  return {
    items,
    nextCursor: data.nextCursor || null,
    hasMore: Boolean(data.hasMore),
  };
};

const createPost = async (postData) => {
  const response = await API.post('/post/create', postData);
  return normalizePost(response.data.post);
};

const likePost = async (postId) => {
  const response = await API.post(`/likes/post/like/${postId}`);
  return response.data;
};

const unlikePost = async (postId) => {
  const response = await API.post(`/likes/post/unlike/${postId}`);
  return response.data;
};

const getPostDetails = async (postId) => {
  const response = await API.get(`/post/post-details/${postId}`);
  return normalizePost(response.data.post);
};

const getBlogDetails = async (blogId) => {
  const response = await API.get(`/blog/blog-details/${blogId}`);
  return response.data.blog;
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
  likePost,
  unlikePost,
  getPostDetails,
  getBlogDetails,
  exploreBlogs,
};
