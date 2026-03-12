import { useDispatch, useSelector } from 'react-redux';
import {
  logout,
  refreshTokenAsync,
  selectCurrentUser,
  selectRoles,
  selectRefreshToken,
  selectToken
} from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const roles = useSelector(selectRoles);
  const token = useSelector(selectToken);
  const refreshToken = useSelector(selectRefreshToken);

  return {
    user,
    roles,
    token,
    refreshToken,
    isAuthenticated: Boolean(user && token),
    logout: () => dispatch(logout()),
    refresh: () => dispatch(refreshTokenAsync())
  };
};