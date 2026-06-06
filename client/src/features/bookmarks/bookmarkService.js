import API from '@/api/axios';

const getBookmarks = async () => {
  const response = await API.get('/bookmark');
  return response.data?.bookmarks || [];
};

const getBookmarkIds = async () => {
  const response = await API.get('/bookmark/ids');
  return response.data?.ids || [];
};

const normalizeBookmarkType = (type) =>
  String(type || '').toLowerCase() === 'blog' ? 'Blog' : 'Post';

const toggleBookmark = (itemId, type) =>
  API.post(`/bookmark/${itemId}?type=${normalizeBookmarkType(type)}`).then((r) => r.data);

export default { getBookmarks, getBookmarkIds, toggleBookmark };
