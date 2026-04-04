import API from '../../api/axios';

const signup = async (userData) => {
  const response = await API.post('/auth/signup', userData);
  return response.data;
};

const login = async (userData) => {
  const response = await API.post('/auth/login', userData);
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

const getMe = async () => {
  const response = await API.get('/user/getMe');
  return response.data;
};

export default { signup, login, logout, getMe };
