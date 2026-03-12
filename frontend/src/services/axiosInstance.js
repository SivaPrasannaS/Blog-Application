import axios from 'axios';
import tokenService from './tokenService';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

let storeRef;
let refreshPromise = null;

export const setupAxiosInterceptors = (store) => {
  storeRef = store;
};

const extractErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Request failed';
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenService.getRefreshToken();

      if (!refreshToken) {
        tokenService.clearTokens();
        storeRef?.dispatch({ type: 'auth/logout' });
        window.location.assign('/login');
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(`${baseURL}/api/auth/refresh`, { refreshToken });
        }
        const response = await refreshPromise;
        refreshPromise = null;

        tokenService.updateAccessToken(response.data.token);
        if (response.data.refreshToken) {
          tokenService.setTokens(response.data.token, response.data.refreshToken);
        }
        storeRef?.dispatch({ type: 'auth/updateAccessToken', payload: response.data.token });
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${response.data.token}`
        };
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        tokenService.clearTokens();
        storeRef?.dispatch({ type: 'auth/logout' });
        window.location.assign('/login');
        return Promise.reject({ ...refreshError, message: extractErrorMessage(refreshError) });
      }
    }

    return Promise.reject({ ...error, message: extractErrorMessage(error) });
  }
);

export default axiosInstance;