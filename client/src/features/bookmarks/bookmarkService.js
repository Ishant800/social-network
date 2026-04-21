import API from '../../api/axios';

const getBookmarks    = ()         => API.get('/bookmark').then((r) => r.data.bookmarks);
const getBookmarkIds  = ()         => API.get('/bookmark/ids').then((r) => r.data.ids);
const toggleBookmark  = (itemId, type) => API.post(`/bookmark/${itemId}?type=${type}`).then((r) => r.data);

export default { getBookmarks, getBookmarkIds, toggleBookmark };
