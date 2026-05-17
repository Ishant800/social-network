import API from '../../api/axios';

const fetchConfessions = async ({ page = 1, limit = 15, category = 'All' } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category && category !== 'All') params.set('category', category);
  const { data } = await API.get(`/confession/feed?${params}`);
  return {
    confessions: (data.confessions || []).map((c) => ({ ...c, id: c._id || c.id })),
    categories: data.categories || [],
    hasMore: Boolean(data.pagination?.hasMore),
    page: data.pagination?.page || page,
  };
};

const fetchTrending = async () => {
  const { data } = await API.get('/confession/trending');
  return (data.trending || []).map((c) => ({ ...c, id: c._id || c.id }));
};

const createConfession = async ({ content, category, tags, voiceBlob, duration }) => {
  if (voiceBlob) {
    const formData = new FormData();
    formData.append('content', content || '');
    formData.append('category', category);
    formData.append('duration', String(duration || 0));
    if (tags?.length) {
      tags.forEach((tag) => formData.append('tags', tag));
    }
    formData.append('voice', voiceBlob, 'confession.webm');
    const { data } = await API.post('/confession/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { ...data.confession, id: data.confession._id || data.confession.id };
  }

  const { data } = await API.post('/confession/create', { content, category, tags });
  return { ...data.confession, id: data.confession._id || data.confession.id };
};

const fetchVoiceStories = async ({ page = 1, limit = 15, category = 'All' } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category && category !== 'All') params.set('category', category);
  const { data } = await API.get(`/confession/voice-stories?${params}`);
  return {
    stories: (data.stories || []).map((c) => ({ ...c, id: c._id || c.id })),
    categories: data.categories || [],
    hasMore: Boolean(data.pagination?.hasMore),
    page: data.pagination?.page || page,
  };
};

const fetchComments = async (postId) => {
  const { data } = await API.get(`/confession/${postId}/comments`);
  return (data.comments || []).map((c) => ({ ...c, id: c._id || c.id }));
};

const postReply = async (postId, text, parentCommentId = null) => {
  const { data } = await API.post(`/confession/${postId}/reply`, { text, parentCommentId });
  return { ...data.comment, id: data.comment._id || data.comment.id };
};

const likeConfession = async (postId) => {
  const { data } = await API.post(`/likes/post/${postId}/react`, { reactionType: 'like' });
  return { postId, ...data };
};

const unlikeConfession = async (postId) => {
  const { data } = await API.delete(`/likes/post/${postId}/react`);
  return { postId, ...data };
};

export default {
  fetchConfessions,
  fetchTrending,
  fetchVoiceStories,
  createConfession,
  fetchComments,
  postReply,
  likeConfession,
  unlikeConfession,
};
