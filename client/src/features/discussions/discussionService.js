import API from '../../api/axios';

const getActiveDiscussions = async ({ limit = 6, hours = 168 } = {}) => {
  const params = new URLSearchParams({
    limit: String(limit),
    hours: String(hours),
  });
  const response = await API.get(`/blog/active-discussions?${params.toString()}`);
  return response.data.discussions || [];
};

export default {
  getActiveDiscussions,
};
