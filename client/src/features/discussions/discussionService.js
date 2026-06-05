import API from '../../api/axios';

const getActiveDiscussions = async () => {
  const response = await API.get('/blog/active-discussions');
  return response.data.discussions || [];
};

export default {
  getActiveDiscussions,
};
