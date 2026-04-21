import API from '../../api/axios';

const getNotifications = (page = 1) =>
  API.get(`/notifications?page=${page}`).then((r) => r.data);

const markAllRead = () => API.put('/notifications/read').then((r) => r.data);
const markOneRead = (id) => API.put(`/notifications/${id}/read`).then((r) => r.data);

export default { getNotifications, markAllRead, markOneRead };
