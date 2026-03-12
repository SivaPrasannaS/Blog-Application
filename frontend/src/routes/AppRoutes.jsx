import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import PostListPage from '../features/posts/PostListPage';
import PostDetailPage from '../features/posts/PostDetailPage';
import PostFormPage from '../features/posts/PostFormPage';
import CategoryManagerPage from '../features/categories/CategoryManagerPage';
import UserManagementPage from '../features/users/UserManagementPage';
import AnalyticsDashboard from '../features/analytics/AnalyticsDashboard';
import ProtectedRoute from '../components/rbac/ProtectedRoute';

function UnauthorizedPage() {
  return (
    <div className="container py-5">
      <div className="alert alert-warning shadow-sm">You do not have permission to view this page.</div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/posts" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/posts" element={<PostListPage />} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route
        path="/posts/new"
        element={
          <ProtectedRoute permission="post:create">
            <PostFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/posts/:id/edit"
        element={
          <ProtectedRoute>
            <PostFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute permission="category:manage">
            <CategoryManagerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute permission="analytics:view">
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute permission="user:manage">
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;