import React from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import RoleGuard from '../rbac/RoleGuard';

const links = [
  { to: '/posts', label: 'Posts' },
  { to: '/posts/new', label: 'New Post' },
  { to: '/categories', label: 'Categories', permission: 'category:manage' },
  { to: '/analytics', label: 'Analytics', permission: 'analytics:view' },
  { to: '/admin/users', label: 'Users', permission: 'user:manage' }
];

function Sidebar() {
  const { pathname } = useLocation();

  const isLinkActive = (to) => {
    if (to === '/posts') {
      return pathname === '/posts' || (Boolean(matchPath('/posts/:id', pathname)) && pathname !== '/posts/new');
    }

    if (to === '/posts/new') {
      return pathname === '/posts/new' || Boolean(matchPath('/posts/:id/edit', pathname));
    }

    return pathname === to;
  };

  return (
    <aside className="py-4">
      <div className="px-3 mb-4">
        <p className="text-uppercase small text-secondary mb-1">Workspace</p>
        <h5 className="mb-0">Editorial Control</h5>
      </div>
      <ul className="nav flex-column gap-2 px-2">
        {links.map((link) => {
          const isActive = isLinkActive(link.to);
          const item = (
            <li className="nav-item" key={link.to}>
              <Link
                to={link.to}
                className={`nav-link rounded-3 px-3 ${isActive ? 'active bg-primary text-white' : 'text-body'}`}
              >
                {link.label}
              </Link>
            </li>
          );

          if (!link.permission) {
            return item;
          }

          return (
            <RoleGuard key={link.to} permission={link.permission}>
              {item}
            </RoleGuard>
          );
        })}
      </ul>
    </aside>
  );
}

export default Sidebar;