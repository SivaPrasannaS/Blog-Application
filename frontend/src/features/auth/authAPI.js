import axiosInstance from '../../services/axiosInstance';

const authAPI = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  },
  register: async (payload) => {
    const response = await axiosInstance.post('/api/auth/register', payload);
    return response.data;
  },
  refresh: async (refreshToken) => {
    const response = await axiosInstance.post('/api/auth/refresh', { refreshToken });
    return response.data;
  }
};

export default authAPI;