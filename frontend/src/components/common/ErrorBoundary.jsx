import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Application error boundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="alert alert-danger shadow-sm">Something went wrong while rendering the app.</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;