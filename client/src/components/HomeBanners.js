import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiRoot } from '../services/api';

export default function HomeBanners({ banners = [] }) {
  const nav = useNavigate();
  
  // Helper to convert relative image paths to full URLs pointing to the backend
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath; // Already a full URL
    
    // If relative path, prepend backend root
    return getApiRoot() + imagePath;
  };
  
  const handleClick = (b) => {
    // Handle both camelCase and lowercase field names
    const testId = b.testId || b.testid;
    const packageSlug = b.packageSlug || b.packageslug;
    
    // Prefer package link over test link
    if (packageSlug) {
      nav(`/health-packages/${packageSlug}`);
    } else if (testId) {
      nav(`/tests/${testId}`);
    } else {
      nav('/tests');
    }
  };

  if (!banners || banners.length === 0) {
    return <div className="muted">No featured offers at the moment.</div>;
  }

  return (
    <div className="banner-grid">
      {banners.map(b => {
        // Handle both camelCase and lowercase field names from database
        const imageUrl = b.imageUrl || b.imageurl || '';
        const title = b.title || '';
        const subtitle = b.subtitle || '';
        
        return (
          <button key={b.id} className="banner-card card" onClick={() => handleClick(b)} aria-label={title}>
            <div className="banner-media">
              {imageUrl ? (
                <img 
                  src={getImageUrl(imageUrl)} 
                  alt={title}
                  loading="lazy"
                  width="640"
                  height="280"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => console.log('Image load error:', imageUrl, getImageUrl(imageUrl), e)}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(14,165,233,0.08))' }} />
              )}
            </div>
            <div className="banner-body">
              <h4 style={{margin:0}}>{title}</h4>
              {subtitle && <div className="muted small">{subtitle}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
