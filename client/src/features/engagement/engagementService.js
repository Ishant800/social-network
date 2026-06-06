import API from '../../api/axios';

const trackShare = async (contentType, contentId) => {
  const { data } = await API.post('/recommendation/track/share', {
    contentType,
    contentId,
  });
  return data;
};

export default { trackShare };
