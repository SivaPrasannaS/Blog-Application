import React, { useState } from 'react';

function EyeOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7A3 3 0 0 0 13.4 13.5" />
      <path d="M9.9 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-4 4.9" />
      <path d="M6.6 6.7A17.3 17.3 0 0 0 2 12s3.5 7 10 7a10.7 10.7 0 0 0 5.3-1.4" />
    </svg>
  );
}

function PasswordInput({ label, name, register, error }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label fw-semibold">
        {label}
      </label>
      <div className="position-relative">
        <input
          id={name}
          type={showPassword ? 'text' : 'password'}
          className={`form-control pe-5 ${error ? 'is-invalid' : ''}`}
          {...register(name)}
        />
        <button
          type="button"
          className="btn position-absolute top-50 end-0 translate-middle-y me-2 border-0 bg-transparent p-1 text-secondary"
          aria-label="Toggle password visibility"
          aria-pressed={showPassword}
          onClick={() => setShowPassword((value) => !value)}
        >
          {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
        </button>
        {error ? <div className="invalid-feedback d-block">{error.message}</div> : null}
      </div>
    </div>
  );
}

export default PasswordInput;