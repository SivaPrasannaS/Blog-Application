import React from 'react';

function FormInput({ label, name, register, error, type = 'text', ...rest }) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label fw-semibold">
        {label}
      </label>
      <input id={name} type={type} className={`form-control ${error ? 'is-invalid' : ''}`} {...register(name)} {...rest} />
      {error ? <div className="invalid-feedback">{error.message}</div> : null}
    </div>
  );
}

export default FormInput;