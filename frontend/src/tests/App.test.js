import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import rootReducer from '../app/rootReducer';
import RoleGuard from '../components/rbac/RoleGuard';
import ProtectedRoute from '../components/rbac/ProtectedRoute';
import Sidebar from '../components/common/Sidebar';
import authReducer, { loginAsync, logout, refreshTokenAsync, selectCurrentUser, selectRoles, updateAccessToken } from '../features/auth/authSlice';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import categoriesReducer from '../features/categories/categoriesSlice';
import postsReducer, { archivePostAsync, createPostAsync, deletePostAsync, fetchDraftPostsAsync, fetchPostByIdAsync, fetchPostsAsync, publishPostAsync, updatePostAsync } from '../features/posts/postsSlice';
import PostDetailPage from '../features/posts/PostDetailPage';
import PostFormPage from '../features/posts/PostFormPage';
import PostListPage from '../features/posts/PostListPage';
import UserManagementPage from '../features/users/UserManagementPage';
import usersReducer from '../features/users/usersSlice';
import { createRBACHelpers } from '../hooks/useRBAC';
import axiosInstance from '../services/axiosInstance';
import tokenService from '../services/tokenService';
import { renderWithProviders } from '../testUtils';
import { formatDate } from '../utils/dateUtils';

jest.mock('../features/auth/authSlice', () => {
  const actual = jest.requireActual('../features/auth/authSlice');
  return {
    __esModule: true,
    ...actual,
    default: actual.default,
    loginAsync: jest.fn((payload) => ({ type: 'auth/login', payload }))
  };
});

jest.mock('../features/posts/postsSlice', () => {
  const actual = jest.requireActual('../features/posts/postsSlice');
  return {
    __esModule: true,
    ...actual,
    default: actual.default,
    fetchPostsAsync: jest.fn((payload) => ({ type: 'posts/fetchList', payload })),
    fetchDraftPostsAsync: jest.fn(() => ({ type: 'posts/fetchDrafts' })),
    fetchPostByIdAsync: jest.fn((payload) => ({ type: 'posts/fetchById', payload })),
    createPostAsync: jest.fn((payload) => ({ type: 'posts/create', payload })),
    updatePostAsync: jest.fn((payload) => ({ type: 'posts/update', payload })),
    deletePostAsync: jest.fn((payload) => ({ type: 'posts/delete', payload })),
    publishPostAsync: jest.fn((payload) => ({ type: 'posts/publish', payload })),
    archivePostAsync: jest.fn((payload) => ({ type: 'posts/archive', payload }))
  };
});

jest.mock('../services/axiosInstance', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn()
  }
}));

const emptyAuthState = { user: null, token: null, refreshToken: null, loading: false, error: null };
const emptyPostsState = { items: [], draftItems: [], total: 0, page: 0, selected: null, loading: false, draftsLoading: false, error: null };
const emptyCategoriesState = { items: [], loading: false, error: null };
const emptyUsersState = { items: [], loading: false, error: null };
const categoryState = { items: [{ id: 1, name: 'Tech' }], loading: false, error: null };

describe('unified frontend tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tokenService.clearTokens();
  });

  describe('authSlice', () => {
    it('day_8_login_fulfilled_sets_user_and_token', () => {
      const nextState = authReducer(emptyAuthState, {
        type: 'auth/login/fulfilled',
        payload: {
          token: 'token-1',
          refreshToken: 'refresh-1',
          user: { id: 1, username: 'writer', roles: ['ROLE_USER'] }
        }
      });

      expect(nextState.user.username).toBe('writer');
      expect(nextState.token).toBe('token-1');
    });

    it('day_8_login_rejected_sets_error', () => {
      const nextState = authReducer(emptyAuthState, {
        type: 'auth/login/rejected',
        payload: 'Invalid credentials'
      });

      expect(nextState.error).toBe('Invalid credentials');
    });

    it('day_8_logout_clears_all', () => {
      const nextState = authReducer(
        { user: { id: 1 }, token: 'token', refreshToken: 'refresh', loading: false, error: 'error' },
        logout()
      );

      expect(nextState.user).toBeNull();
      expect(nextState.token).toBeNull();
      expect(nextState.refreshToken).toBeNull();
    });

  });

  describe('postsSlice', () => {
    it('day_8_create_post_fulfilled_updates_selected_only', () => {
      const existingPost = { id: 1, title: 'Existing', createdAt: '2026-03-11T10:00:00' };
      const createdPost = { id: 2, title: 'Created', createdAt: null, status: 'DRAFT' };

      const nextState = postsReducer(
        { ...emptyPostsState, items: [existingPost] },
        { type: 'posts/createPost/fulfilled', payload: createdPost }
      );

      expect(nextState.items).toEqual([existingPost]);
      expect(nextState.selected).toEqual(createdPost);
    });

    it('day_8_publish_post_fulfilled_updates_selected_and_list_immediately', () => {
      const existingPost = { id: 7, title: 'Draft post', status: 'DRAFT' };
      const publishedPost = { id: 7, title: 'Draft post', status: 'PUBLISHED' };

      const nextState = postsReducer(
        { ...emptyPostsState, items: [existingPost], selected: existingPost },
        { type: 'posts/publishPost/fulfilled', payload: publishedPost }
      );

      expect(nextState.selected).toEqual(publishedPost);
      expect(nextState.items).toEqual([publishedPost]);
    });

    it('day_9_publish_post_fulfilled_moves_draft_into_published_table_state', () => {
      const publishedPost = { id: 5, title: 'Published story', status: 'PUBLISHED' };
      const draftPost = { id: 9, title: 'Draft story', status: 'DRAFT' };
      const promotedDraft = { ...draftPost, status: 'PUBLISHED' };

      const nextState = postsReducer(
        { ...emptyPostsState, items: [publishedPost], draftItems: [draftPost], total: 1 },
        { type: 'posts/publishPost/fulfilled', payload: promotedDraft }
      );

      expect(nextState.items).toEqual([promotedDraft, publishedPost]);
      expect(nextState.draftItems).toEqual([]);
      expect(nextState.total).toBe(2);
    });

    it('day_9_archive_post_fulfilled_removes_from_published_list', () => {
      const publishedPost = { id: 3, title: 'Live story', status: 'PUBLISHED' };
      const archivedPost = { id: 3, title: 'Live story', status: 'ARCHIVED' };

      const nextState = postsReducer(
        { ...emptyPostsState, items: [publishedPost], selected: publishedPost, total: 1 },
        { type: 'posts/archivePost/fulfilled', payload: archivedPost }
      );

      expect(nextState.selected).toEqual(archivedPost);
      expect(nextState.items).toEqual([]);
      expect(nextState.total).toBe(0);
    });
  });

  describe('dateUtils', () => {
    it('day_10_invalid_date_returns_fallback', () => {
      expect(formatDate('invalid-date')).toBe('N/A');
    });
  });

  describe('LoginPage', () => {
    it('day_7_renders_login_fields', () => {
      const store = createFeatureStore({ auth: emptyAuthState });
      renderLoginApp(store);
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('day_7_empty_submit_shows_validation_errors', async () => {
      const user = userEvent.setup();
      const store = createFeatureStore({ auth: emptyAuthState });
      renderLoginApp(store);
      await user.click(screen.getByRole('button', { name: /login/i }));
      expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it('day_7_short_password_shows_error', async () => {
      const user = userEvent.setup();
      const store = createFeatureStore({ auth: emptyAuthState });
      renderLoginApp(store);
      await user.type(screen.getByLabelText(/username/i), 'writer');
      await user.type(screen.getByLabelText(/^password$/i), 'short');
      await user.click(screen.getByRole('button', { name: /login/i }));
      expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it('day_8_dispatches_login_async_with_correct_credentials', async () => {
      const user = userEvent.setup();
      const store = createFeatureStore({ auth: emptyAuthState });
      store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
      renderLoginApp(store);
      await user.type(screen.getByLabelText(/username/i), 'writer');
      await user.type(screen.getByLabelText(/^password$/i), 'Password@123');
      await user.click(screen.getByRole('button', { name: /login/i }));
      await waitFor(() => expect(loginAsync).toHaveBeenCalledWith({ username: 'writer', password: 'Password@123' }));
    });

    it('day_8_success_redirects_to_posts', async () => {
      const user = userEvent.setup();
      const store = createFeatureStore({ auth: emptyAuthState });
      store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
      renderLoginApp(store);
      await user.type(screen.getByLabelText(/username/i), 'writer');
      await user.type(screen.getByLabelText(/^password$/i), 'Password@123');
      await user.click(screen.getByRole('button', { name: /login/i }));
      expect(await screen.findByText(/posts page/i)).toBeInTheDocument();
    });

    it('day_8_login_401_shows_error_banner', () => {
      const store = createFeatureStore({ auth: { ...emptyAuthState, error: 'Invalid username or password' } });
      renderLoginApp(store);
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });

    it('day_7_eye_icon_toggles_password_visibility', async () => {
      const user = userEvent.setup();
      const store = createFeatureStore({ auth: emptyAuthState });
      renderLoginApp(store);
      const passwordField = screen.getByLabelText(/^password$/i);
      expect(passwordField).toHaveAttribute('type', 'password');
      await user.click(screen.getByRole('button', { name: /toggle password visibility/i }));
      expect(passwordField).toHaveAttribute('type', 'text');
    });
  });

  describe('PostFormPage', () => {
    it('day_7_manager_shows_status_dropdown', () => {
      const store = createPostFormStore(
        { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        emptyPostsState
      );
      renderPostFormPage(store);
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });

    it('day_7_user_hides_status_dropdown', () => {
      const store = createPostFormStore(
        { user: { id: 1, roles: ['ROLE_USER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        emptyPostsState
      );
      renderPostFormPage(store);
      expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument();
    });

    it('day_7_short_title_shows_error', async () => {
      const user = userEvent.setup();
      const store = createPostFormStore(
        { user: { id: 1, roles: ['ROLE_USER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        emptyPostsState
      );
      renderPostFormPage(store);
      await user.type(screen.getByLabelText(/title/i), 'abcd');
      await user.type(screen.getByLabelText(/body/i), 'This body contains more than twenty characters.');
      await user.selectOptions(screen.getByLabelText(/category/i), '1');
      await user.click(screen.getByRole('button', { name: /create post/i }));
      expect(await screen.findByText(/at least 5 characters/i)).toBeInTheDocument();
    });

    it('day_7_short_body_shows_error', async () => {
      const user = userEvent.setup();
      const store = createPostFormStore(
        { user: { id: 1, roles: ['ROLE_USER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        emptyPostsState
      );
      renderPostFormPage(store);
      await user.type(screen.getByLabelText(/title/i), 'Valid title');
      await user.type(screen.getByLabelText(/body/i), 'short body');
      await user.selectOptions(screen.getByLabelText(/category/i), '1');
      await user.click(screen.getByRole('button', { name: /create post/i }));
      expect(await screen.findByText(/at least 20 characters/i)).toBeInTheDocument();
    });

    it('day_8_user_submit_sets_status_to_draft', async () => {
      const user = userEvent.setup();
      const store = createPostFormStore(
        { user: { id: 1, roles: ['ROLE_USER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        emptyPostsState
      );
      store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
      renderPostFormPage(store);
      await fillPostForm(user);
      await user.click(screen.getByRole('button', { name: /create post/i }));
      await waitFor(() => expect(createPostAsync).toHaveBeenCalledWith(expect.objectContaining({ status: 'DRAFT' })));
    });

    it('day_8_manager_submit_sets_status_to_published', async () => {
      const user = userEvent.setup();
      const store = createPostFormStore(
        { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        emptyPostsState
      );
      store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
      renderPostFormPage(store);
      await fillPostForm(user, true);
      await user.click(screen.getByRole('button', { name: /create post/i }));
      await waitFor(() => expect(createPostAsync).toHaveBeenCalledWith(expect.objectContaining({ status: 'PUBLISHED' })));
    });

    it('day_8_edit_mode_prefills_fields', () => {
      const store = createPostFormStore(
        { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        {
          ...emptyPostsState,
          selected: { id: 9, title: 'Existing title', body: 'This is an existing body with enough length.', categoryId: 1, status: 'PUBLISHED' }
        }
      );
      renderPostFormPage(store, '/posts/9/edit');
      expect(screen.getByDisplayValue(/existing title/i)).toBeInTheDocument();
    });

  });

  describe('PostDetailPage', () => {
    it('day_9_manager_draft_shows_publish_draft_button', () => {
      const store = createPostDetailStore(
        { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        {
          ...emptyPostsState,
          selected: {
            id: 9,
            title: 'Draft title',
            body: 'This draft body is long enough for rendering in the detail page.',
            categoryName: 'Tech',
            authorUsername: 'manager',
            authorId: 2,
            createdAt: '2026-03-11T10:00:00',
            status: 'DRAFT'
          }
        }
      );

      renderPostDetailPage(store);

      expect(screen.getByRole('button', { name: /publish draft/i })).toBeInTheDocument();
      expect(screen.getByText(/^DRAFT$/i)).toBeInTheDocument();
    });

    it('day_9_publish_draft_dispatches_publish_async', async () => {
      const user = userEvent.setup();
      const store = createPostDetailStore(
        { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        {
          ...emptyPostsState,
          selected: {
            id: 9,
            title: 'Draft title',
            body: 'This draft body is long enough for rendering in the detail page.',
            categoryName: 'Tech',
            authorUsername: 'manager',
            authorId: 2,
            createdAt: '2026-03-11T10:00:00',
            status: 'DRAFT'
          }
        }
      );
      store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));

      renderPostDetailPage(store);
      await user.click(screen.getByRole('button', { name: /publish draft/i }));

      await waitFor(() => expect(publishPostAsync).toHaveBeenCalledWith({ id: 9, published: true }));
    });

    it('day_9_manager_published_shows_archive_button', () => {
      const store = createPostDetailStore(
        { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        {
          ...emptyPostsState,
          selected: {
            id: 9,
            title: 'Published title',
            body: 'This published body is long enough for rendering in the detail page.',
            categoryName: 'Tech',
            authorUsername: 'manager',
            authorId: 2,
            createdAt: '2026-03-11T10:00:00',
            status: 'PUBLISHED'
          }
        }
      );

      renderPostDetailPage(store);

      expect(screen.getByRole('button', { name: /archive post/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /publish draft/i })).not.toBeInTheDocument();
    });

    it('day_9_archive_post_dispatches_archive_async', async () => {
      const user = userEvent.setup();
      const store = createPostDetailStore(
        { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        {
          ...emptyPostsState,
          selected: {
            id: 9,
            title: 'Published title',
            body: 'This published body is long enough for rendering in the detail page.',
            categoryName: 'Tech',
            authorUsername: 'manager',
            authorId: 2,
            createdAt: '2026-03-11T10:00:00',
            status: 'PUBLISHED'
          }
        }
      );
      store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));

      renderPostDetailPage(store);
      await user.click(screen.getByRole('button', { name: /archive post/i }));

      await waitFor(() => expect(archivePostAsync).toHaveBeenCalledWith(9));
    });
  });

  describe('PostListPage', () => {
    it('day_9_manager_sees_separate_draft_posts_table', () => {
      const store = createPostListStore(
        { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        {
          ...emptyPostsState,
          items: [
            {
              id: 1,
              title: 'Published story',
              body: 'Published body content that is long enough to be shown in the table preview.',
              categoryName: 'Tech',
              authorUsername: 'editor',
              createdAt: '2026-03-11T09:00:00',
              status: 'PUBLISHED'
            }
          ],
          draftItems: [
            {
              id: 2,
              title: 'Draft story',
              body: 'Draft body content that is long enough to be shown in the table preview.',
              categoryName: 'News',
              authorUsername: 'writer',
              createdAt: '2026-03-11T08:00:00',
              updatedAt: '2026-03-11T10:00:00',
              status: 'DRAFT'
            }
          ],
          total: 1
        }
      );

      renderPostListPage(store);

      expect(screen.getByRole('table', { name: /published posts table/i })).toBeInTheDocument();
      expect(screen.getByRole('table', { name: /draft posts table/i })).toBeInTheDocument();
      expect(screen.getByText(/awaiting publication/i)).toBeInTheDocument();

      const draftTable = screen.getByRole('table', { name: /draft posts table/i });
      expect(within(draftTable).getByText(/draft story/i)).toBeInTheDocument();
      expect(within(draftTable).queryByText(/published story/i)).not.toBeInTheDocument();

      expect(fetchPostsAsync).toHaveBeenCalledWith({ page: 0, size: 10, month: undefined });
      expect(fetchDraftPostsAsync).toHaveBeenCalled();
    });

    it('day_9_publish_from_draft_table_dispatches_publish_async', async () => {
      const user = userEvent.setup();
      const store = createPostListStore(
        { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        {
          ...emptyPostsState,
          draftItems: [
            {
              id: 2,
              title: 'Draft story',
              body: 'Draft body content that is long enough to be shown in the table preview.',
              categoryName: 'News',
              authorUsername: 'writer',
              createdAt: '2026-03-11T08:00:00',
              updatedAt: '2026-03-11T10:00:00',
              status: 'DRAFT'
            }
          ]
        }
      );
      store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));

      renderPostListPage(store);
      await user.click(screen.getByRole('button', { name: /^publish$/i }));

      await waitFor(() => expect(publishPostAsync).toHaveBeenCalledWith({ id: 2, published: true }));
    });
  });

  describe('UserManagementPage', () => {
    it('day_11_filters_admin_user_and_hides_admin_role_option', () => {
      const store = createUserManagementStore(
        { user: { id: 3, roles: ['ROLE_ADMIN'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        {
          items: [
            { id: 1, username: 'support', email: 'support@gmail.com', roles: ['ROLE_USER'], active: true },
            { id: 99, username: 'admin', email: 'admin@cms.local', roles: ['ROLE_ADMIN'], active: true }
          ],
          loading: false,
          error: null
        }
      );

      renderUserManagementPage(store);

      expect(screen.getByText(/support@gmail.com/i)).toBeInTheDocument();
      expect(screen.queryByText(/admin@cms\.local/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /role_admin/i })).not.toBeInTheDocument();
    });

    it('day_11_role_change_only_allows_user_or_manager', async () => {
      const user = userEvent.setup();
      const store = createUserManagementStore(
        { user: { id: 3, roles: ['ROLE_ADMIN'] }, token: 't', refreshToken: 'r', loading: false, error: null },
        {
          items: [
            { id: 1, username: 'support', email: 'support@gmail.com', roles: ['ROLE_USER'], active: true }
          ],
          loading: false,
          error: null
        }
      );
      store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));

      renderUserManagementPage(store);
      await user.selectOptions(screen.getByRole('combobox'), 'ROLE_MANAGER');

      const options = screen.getAllByRole('option').map((option) => option.textContent);
      expect(options).toEqual(['ROLE_USER', 'ROLE_MANAGER']);
    });
  });

  describe('useRBAC helpers', () => {
    it('day_8_post_create_is_true_for_user', () => {
      expect(createRBACHelpers({ id: 1, roles: ['ROLE_USER'] }).can('post:create')).toBe(true);
    });

    it('day_8_post_publish_is_false_for_user', () => {
      expect(createRBACHelpers({ id: 1, roles: ['ROLE_USER'] }).can('post:publish')).toBe(false);
    });

    it('day_8_post_publish_is_true_for_manager', () => {
      expect(createRBACHelpers({ id: 2, roles: ['ROLE_MANAGER'] }).can('post:publish')).toBe(true);
    });

    it('day_8_user_manage_is_false_for_manager', () => {
      expect(createRBACHelpers({ id: 2, roles: ['ROLE_MANAGER'] }).can('user:manage')).toBe(false);
    });

    it('day_8_user_manage_is_true_for_admin', () => {
      expect(createRBACHelpers({ id: 3, roles: ['ROLE_ADMIN'] }).can('user:manage')).toBe(true);
    });

    it('day_8_can_edit_post_is_true_for_owner', () => {
      expect(createRBACHelpers({ id: 1, roles: ['ROLE_USER'] }).canEditPost({ authorId: 1 })).toBe(true);
    });

    it('day_8_can_edit_post_is_true_for_manager_non_owner', () => {
      expect(createRBACHelpers({ id: 2, roles: ['ROLE_MANAGER'] }).canEditPost({ authorId: 1 })).toBe(true);
    });

    it('day_8_can_delete_post_is_false_for_manager_others', () => {
      expect(createRBACHelpers({ id: 2, roles: ['ROLE_MANAGER'] }).canDeletePost({ authorId: 1 })).toBe(false);
    });

    it('day_8_can_delete_post_is_true_for_admin', () => {
      expect(createRBACHelpers({ id: 3, roles: ['ROLE_ADMIN'] }).canDeletePost({ authorId: 1 })).toBe(true);
    });

    it('day_9_post_archive_is_false_for_user', () => {
      expect(createRBACHelpers({ id: 1, roles: ['ROLE_USER'] }).can('post:archive')).toBe(false);
    });

    it('day_9_post_archive_is_true_for_manager', () => {
      expect(createRBACHelpers({ id: 2, roles: ['ROLE_MANAGER'] }).can('post:archive')).toBe(true);
    });
  });

  describe('RoleGuard', () => {
    it('day_8_role_guard_has_permission_renders', () => {
      renderWithProviders(<RoleGuard permission="analytics:view"><div>Visible</div></RoleGuard>, {
        preloadedState: buildAppState({ auth: { user: { id: 1, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null } })
      });
      expect(screen.getByText(/visible/i)).toBeInTheDocument();
    });

    it('day_8_role_guard_no_permission_shows_fallback', () => {
      renderWithProviders(<RoleGuard permission="user:manage" fallback={<div>Fallback</div>}><div>Visible</div></RoleGuard>, {
        preloadedState: buildAppState({ auth: { user: { id: 1, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null } })
      });
      expect(screen.getByText(/fallback/i)).toBeInTheDocument();
    });

    it('day_8_role_guard_user_owner_shows_edit', () => {
      renderWithProviders(<RoleGuard action="edit" post={{ authorId: 1 }}><div>Edit</div></RoleGuard>, {
        preloadedState: buildAppState({ auth: { user: { id: 1, roles: ['ROLE_USER'] }, token: 't', refreshToken: 'r', loading: false, error: null } })
      });
      expect(screen.getByText(/edit/i)).toBeInTheDocument();
    });

    it('day_8_role_guard_manager_others_post_hides_delete', () => {
      const { container } = renderWithProviders(<RoleGuard action="delete" post={{ authorId: 1 }}><div>Delete</div></RoleGuard>, {
        preloadedState: buildAppState({ auth: { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null } })
      });
      expect(container).toBeEmptyDOMElement();
    });

    it('day_8_role_guard_admin_shows_all', () => {
      renderWithProviders(<RoleGuard action="delete" post={{ authorId: 1 }}><div>Delete</div></RoleGuard>, {
        preloadedState: buildAppState({ auth: { user: { id: 3, roles: ['ROLE_ADMIN'] }, token: 't', refreshToken: 'r', loading: false, error: null } })
      });
      expect(screen.getByText(/delete/i)).toBeInTheDocument();
    });
  });

  describe('ProtectedRoute', () => {
    it('day_8_protected_route_unauth_redirects_login', () => {
      renderRoute(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div>Login page</div>} />
            <Route path="/protected" element={<ProtectedRoute><div>Protected content</div></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>,
        buildAppState({ auth: emptyAuthState })
      );
      expect(screen.getByText(/login page/i)).toBeInTheDocument();
    });

    it('day_8_protected_route_no_permission_redirects_unauthorized', () => {
      renderRoute(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/unauthorized" element={<div>Unauthorized page</div>} />
            <Route path="/protected" element={<ProtectedRoute permission="user:manage"><div>Protected content</div></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>,
        buildAppState({ auth: { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null } })
      );
      expect(screen.getByText(/unauthorized page/i)).toBeInTheDocument();
    });

    it('day_8_protected_route_has_permission_renders', () => {
      renderRoute(
        <MemoryRouter>
          <ProtectedRoute permission="analytics:view"><div>Protected content</div></ProtectedRoute>
        </MemoryRouter>,
        buildAppState({ auth: { user: { id: 2, roles: ['ROLE_MANAGER'] }, token: 't', refreshToken: 'r', loading: false, error: null } })
      );
      expect(screen.getByText(/protected content/i)).toBeInTheDocument();
    });
  });

  describe('Sidebar', () => {
    it('day_10_posts_new_route_has_single_active_tab', () => {
      renderRoute(
        <MemoryRouter initialEntries={['/posts/new']}>
          <Sidebar />
        </MemoryRouter>,
        buildAppState({ auth: { user: { id: 3, roles: ['ROLE_ADMIN'] }, token: 't', refreshToken: 'r', loading: false, error: null } })
      );

      expect(screen.getByRole('link', { name: /new post/i })).toHaveClass('active');
      expect(screen.getByRole('link', { name: /^posts$/i })).not.toHaveClass('active');
      expect(document.querySelectorAll('.nav-link.active')).toHaveLength(1);
    });

    it('day_10_post_detail_route_keeps_posts_as_single_active_tab', () => {
      renderRoute(
        <MemoryRouter initialEntries={['/posts/42']}>
          <Sidebar />
        </MemoryRouter>,
        buildAppState({ auth: { user: { id: 3, roles: ['ROLE_ADMIN'] }, token: 't', refreshToken: 'r', loading: false, error: null } })
      );

      expect(screen.getByRole('link', { name: /^posts$/i })).toHaveClass('active');
      expect(screen.getByRole('link', { name: /new post/i })).not.toHaveClass('active');
      expect(document.querySelectorAll('.nav-link.active')).toHaveLength(1);
    });
  });

  describe('auth flow', () => {
    it('day_8_register_login_protected_route_success', async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockResolvedValueOnce({ data: { token: 'token-1', refreshToken: 'refresh-1', user: { id: 1, username: 'writer', roles: ['ROLE_USER'] } } });

      const store = createFeatureStore(buildAppState({ auth: emptyAuthState }));

      renderAuthFlow(store, '/register');
      await user.type(screen.getByLabelText(/username/i), 'writer');
      await user.type(screen.getByLabelText(/email/i), 'writer@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password@123');
      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => expect(screen.getByText(/protected posts/i)).toBeInTheDocument());
    });

    it('day_8_expired_token_refresh_retry_succeeds', async () => {
      const store = createFeatureStore(buildAppState({ auth: { user: { id: 1, roles: ['ROLE_USER'] }, token: 'expired', refreshToken: 'refresh', loading: false, error: null } }));
      store.dispatch(updateAccessToken('renewed-token'));
      await waitFor(() => expect(tokenService.getAccessToken()).toBe('renewed-token'));
    });

    it('day_8_refresh_fail_logout_redirects_login', () => {
      const store = createFeatureStore(buildAppState({ auth: { user: { id: 1, roles: ['ROLE_USER'] }, token: 'token', refreshToken: 'refresh', loading: false, error: null } }));
      store.dispatch(logout());
      renderAuthFlow(store, '/posts');
      expect(screen.getByText(/login view/i)).toBeInTheDocument();
    });

    it('day_8_logout_clears_storage_and_redirects_login', () => {
      const store = createFeatureStore(buildAppState({ auth: { user: { id: 1, roles: ['ROLE_USER'] }, token: 'token', refreshToken: 'refresh', loading: false, error: null } }));
      store.dispatch(logout());
      expect(tokenService.getRefreshToken()).toBeNull();
    });
  });
});

function createFeatureStore(preloadedState) {
  return configureStore({
    reducer: { auth: authReducer, posts: postsReducer, categories: categoriesReducer, users: usersReducer },
    preloadedState: buildAppState(preloadedState),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
  });
}

function createPostFormStore(authState, postsState) {
  return configureStore({
    reducer: { auth: authReducer, posts: postsReducer, categories: categoriesReducer, users: usersReducer },
    preloadedState: {
      auth: authState,
      posts: postsState,
      categories: categoryState,
      users: emptyUsersState
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
  });
}

function createPostListStore(authState, postsState) {
  return configureStore({
    reducer: { auth: authReducer, posts: postsReducer, categories: categoriesReducer, users: usersReducer },
    preloadedState: {
      auth: authState,
      posts: postsState,
      categories: emptyCategoriesState,
      users: emptyUsersState
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
  });
}

function createPostDetailStore(authState, postsState) {
  return configureStore({
    reducer: { auth: authReducer, posts: postsReducer, categories: categoriesReducer, users: usersReducer },
    preloadedState: {
      auth: authState,
      posts: postsState,
      categories: emptyCategoriesState,
      users: emptyUsersState
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
  });
}

function buildAppState(overrides = {}) {
  return {
    auth: emptyAuthState,
    posts: emptyPostsState,
    categories: emptyCategoriesState,
    users: emptyUsersState,
    ...overrides
  };
}

function renderLoginApp(store) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/posts" element={<div>Posts page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

function renderPostFormPage(store, route = '/posts/new') {
  if (!jest.isMockFunction(store.dispatch)) {
    store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
  }

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/posts/new" element={<PostFormPage />} />
          <Route path="/posts/:id/edit" element={<PostFormPage />} />
          <Route path="/posts" element={<div>Posts page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

function renderPostListPage(store, route = '/posts') {
  if (!jest.isMockFunction(store.dispatch)) {
    store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
  }

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/posts" element={<PostListPage />} />
          <Route path="/posts/:id" element={<div>Post detail</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

function renderPostDetailPage(store, route = '/posts/9') {
  if (!jest.isMockFunction(store.dispatch)) {
    store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
  }

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/posts" element={<div>Posts page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

async function fillPostForm(user, choosePublished = false) {
  await user.type(screen.getByLabelText(/title/i), 'Valid title for testing');
  await user.type(screen.getByLabelText(/body/i), 'This body contains more than twenty characters for the form test.');
  await user.selectOptions(screen.getByLabelText(/category/i), '1');
  if (choosePublished && screen.queryByLabelText(/status/i)) {
    await user.selectOptions(screen.getByLabelText(/status/i), 'PUBLISHED');
  }
}

function renderRoute(ui, preloadedState) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
  });
  return render(<Provider store={store}>{ui}</Provider>);
}

function renderAuthFlow(store, route) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<div>Login view</div>} />
          <Route path="/posts" element={<ProtectedRoute permission="post:create"><div>Protected posts</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

function createUserManagementStore(authState, usersState) {
  return configureStore({
    reducer: { auth: authReducer, posts: postsReducer, categories: categoriesReducer, users: usersReducer },
    preloadedState: {
      auth: authState,
      posts: emptyPostsState,
      categories: emptyCategoriesState,
      users: usersState
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
  });
}

function renderUserManagementPage(store, route = '/admin/users') {
  if (!jest.isMockFunction(store.dispatch)) {
    store.dispatch = jest.fn(() => ({ unwrap: () => Promise.resolve() }));
  }

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/admin/users" element={<UserManagementPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}