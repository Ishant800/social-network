import API from '../../api/axios';

const getComments = async (postId, targetType = 'Post') => {
  const response = await API.get(`/comment/getComment/${postId}?type=${targetType}`);
  return response.data.comments;
};

const createComments = async ({ postId, text, targetType }) => {
  const response = await API.post(`/comment/create/${postId}`, {
    text,
    targetType,
  });
  return response.data;
};

export default { getComments, createComments };
