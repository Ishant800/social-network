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

const sendVerificationCode = async ({ email }) => {
  const response = await API.post('/auth/send-verification-code', { email });
  return response.data;
};

const verifyEmailCode = async ({ email, code }) => {
  const response = await API.post('/auth/verify-email-code', { email, code });
  return response.data;
};

export default {
  signup,
  login,
  logout,
  getMe,
  sendVerificationCode,
  verifyEmailCode,
};
