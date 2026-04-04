import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API = axios.create({
  baseURL,
});

let isRefreshing = false;
let queue = [];

function subscribeTokenRefresh(cb) {
  queue.push(cb);
}

function onRefreshed(token) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const url = String(original.url || '');
    if (url.includes('/auth/login') || url.includes('/auth/signup') || url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) {
            reject(error);
            return;
          }
          original.headers.Authorization = `Bearer ${token}`;
          original._retry = true;
          resolve(API(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
      const access = data.token || data.accessToken;
      if (!access) {
        throw new Error('No access token in refresh response');
      }
      localStorage.setItem('token', access);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      onRefreshed(access);
      isRefreshing = false;
      original.headers.Authorization = `Bearer ${access}`;
      return API(original);
    } catch (e) {
      isRefreshing = false;
      onRefreshed(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return Promise.reject(e);
    }
  },
);

export default API;
export { baseURL };
