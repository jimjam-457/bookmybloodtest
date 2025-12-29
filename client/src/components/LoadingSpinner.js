import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="test-tube">
          <div className="liquid"></div>
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
        </div>
      </div>
      <div className="loading-text">{message}</div>
    </div>
  );
}
