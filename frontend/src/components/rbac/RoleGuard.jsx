import React from 'react';
import { useRBAC } from '../../hooks/useRBAC';

function RoleGuard({ permission, action, post, fallback = null, children }) {
  const { can, canEditPost, canDeletePost } = useRBAC();

  let allowed = false;
  if (permission) {
    allowed = can(permission);
  } else if (action === 'edit') {
    allowed = canEditPost(post);
  } else if (action === 'delete') {
    allowed = canDeletePost(post);
  }

  return allowed ? <>{children}</> : fallback;
}

export default RoleGuard;