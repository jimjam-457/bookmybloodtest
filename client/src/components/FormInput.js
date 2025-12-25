import React from 'react';

export default function FormInput({ label, error, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g,'_') || undefined;
  return (
    <div className="form-group">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} {...props} />
      {error && <div className="error" role="alert">{error}</div>}
    </div>
  );
}
