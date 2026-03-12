import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top shadow-sm">
      <div className="container-fluid px-4">
        <Link to="/posts" className="navbar-brand fw-bold text-uppercase">
          CMS Studio
        </Link>
        <div className="d-flex align-items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <span className="small text-secondary">Signed in as {user?.username}</span>
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;