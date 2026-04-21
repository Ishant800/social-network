import API from "../../api/axios";

const getSuggestions = async (limit = 10) => {
  const response = await API.get(`/user/usersuggestions?limit=${limit}`);
  return response.data.data;
};

const followUser = async (userId) => {
  const response = await API.post(`/user/follow/${userId}`);
  return response.data;
};

const unfollowUser = async (userId) => {
  const response = await API.post(`/user/unfollow/${userId}`);
  return response.data;
};



export default { getSuggestions, followUser, unfollowUser };
