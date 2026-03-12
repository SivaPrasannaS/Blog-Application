import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';

export const ROLES = {
  USER: 'ROLE_USER',
  MANAGER: 'ROLE_MANAGER',
  ADMIN: 'ROLE_ADMIN'
};

export const PERMISSIONS = {
  'post:create': [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN],
  'post:publish': [ROLES.MANAGER, ROLES.ADMIN],
  'post:delete_any': [ROLES.ADMIN],
  'category:manage': [ROLES.MANAGER, ROLES.ADMIN],
  'user:manage': [ROLES.ADMIN],
  'analytics:view': [ROLES.MANAGER, ROLES.ADMIN]
};

export const createRBACHelpers = (user) => {
  const roles = user?.roles || [];
  const can = (permission) => (PERMISSIONS[permission] || []).some((role) => roles.includes(role));
  const canEditPost = (post) => can('post:publish') || post?.authorId === user?.id;
  const canDeletePost = (post) => can('post:delete_any') || post?.authorId === user?.id;

  return { can, canEditPost, canDeletePost, roles };
};

export const useRBAC = () => {
  const user = useSelector(selectCurrentUser);
  return createRBACHelpers(user);
};

export default useRBAC;