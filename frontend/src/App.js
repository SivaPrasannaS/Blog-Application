import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';

function App() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app-shell" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <Navbar />
          <div className="container-fluid">
            <div className="row">
              {isAuthenticated && (
                <div className="col-12 col-lg-3 col-xl-2 border-end bg-body-tertiary min-vh-100">
                  <Sidebar />
                </div>
              )}
              <main className={isAuthenticated ? 'col-12 col-lg-9 col-xl-10 py-4' : 'col-12 py-4'}>
                <AppRoutes />
              </main>
            </div>
          </div>
          <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} theme={theme} />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;