import API from '../../api/axios';

const getBookmarks = async () => {
  const response = await API.get('/bookmark');
  return response.data?.bookmarks || [];
};

const getBookmarkIds = async () => {
  const response = await API.get('/bookmark/ids');
  return response.data?.ids || [];
};

const toggleBookmark = (itemId, type) => 
  API.post(`/bookmark/${itemId}?type=${type}`).then((r) => r.data);

export default { getBookmarks, getBookmarkIds, toggleBookmark };
