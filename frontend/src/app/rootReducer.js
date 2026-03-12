import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import usersReducer from '../features/users/usersSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  posts: postsReducer,
  categories: categoriesReducer,
  users: usersReducer
});

export default rootReducer;