import React from 'react';

function LoadingSkeleton({ lines = 4, title = 'Loading content...' }) {
  return (
    <div className="card border-0 shadow-sm" data-testid="loading-skeleton">
      <div className="card-body">
        <div className="placeholder-glow mb-3">
          <span className="placeholder col-4 fs-4">{title}</span>
        </div>
        {Array.from({ length: lines }).map((_, index) => (
          <div className="placeholder-glow mb-2" key={index}>
            <span className={`placeholder ${index % 2 === 0 ? 'col-12' : 'col-9'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;