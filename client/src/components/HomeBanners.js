import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function HomeBanners({ banners = [] }) {
  const nav = useNavigate();
  
  // Helper to convert relative image paths to full URLs pointing to the backend
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath; // Already a full URL
    
    const apiUrl = api.defaults.baseURL || '/api';
    if (apiUrl.startsWith('http')) {
      // Full backend URL like https://api.example.com/api
      return apiUrl.replace('/api', '') + imagePath;
    } else {
      // Relative like /api - use current origin
      return window.location.origin + imagePath;
    }
  };
  
  const handleClick = (b) => {
    if (b.testId) nav(`/tests/${b.testId}`);
    else if (b.packageSlug) nav(`/tests?package=${encodeURIComponent(b.packageSlug)}`);
    else nav('/tests');
  };

  if (!banners || banners.length === 0) {
    return <div className="muted">No featured offers at the moment.</div>;
  }

  return (
    <div className="banner-grid">
      {banners.map(b => (
        <button key={b.id} className="banner-card card" onClick={() => handleClick(b)} aria-label={b.title}>
          <div className="banner-media">
            {b.imageUrl ? (
              <img 
                src={getImageUrl(b.imageUrl)} 
                alt={b.title}
                loading="lazy"
                width="640"
                height="280"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => console.log('Image load error:', b.imageUrl, getImageUrl(b.imageUrl), e)}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(14,165,233,0.08))' }} />
            )}
          </div>
          <div className="banner-body">
            <h4 style={{margin:0}}>{b.title}</h4>
            {b.subtitle && <div className="muted small">{b.subtitle}</div>}
          </div>
        </button>
      ))}
    </div>
  );
}
