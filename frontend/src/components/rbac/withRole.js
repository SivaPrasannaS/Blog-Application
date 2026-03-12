import React from 'react';
import RoleGuard from './RoleGuard';

const withRole = (Component, permission, fallback = null) => {
  return function WithRoleComponent(props) {
    return (
      <RoleGuard permission={permission} fallback={fallback}>
        <Component {...props} />
      </RoleGuard>
    );
  };
};

export default withRole;