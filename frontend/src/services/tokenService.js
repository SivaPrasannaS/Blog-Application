const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || 'cms_access_token';
const REFRESH_KEY = process.env.REACT_APP_REFRESH_KEY || 'cms_refresh_token';

export const tokenService = {
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
  },
  setTokens(token, refreshToken) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_KEY, refreshToken);
    }
  },
  updateAccessToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
};

export default tokenService;