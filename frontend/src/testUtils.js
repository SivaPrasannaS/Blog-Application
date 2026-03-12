import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import rootReducer from './app/rootReducer';

export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = configureStore({ reducer: rootReducer, preloadedState, middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }) }),
    route = '/',
    withRouter = true
  } = {}
) => {
  const content = withRouter ? <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter> : ui;

  return {
    store,
    ...render(
      <Provider store={store}>
        {content}
      </Provider>
    )
  };
};