import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api, { getApiRoot } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PackageDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { addItem } = useBooking();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get(`/health-packages/${slug}`)
      .then(res => {
        if (mounted) {
          console.log('Package detail:', res.data);
          setPkg(res.data);
        }
      })
      .catch(e => {
        console.error('Error fetching package:', e);
        if (mounted) setError('Package not found');
      })
      .finally(() => mounted && setLoading(false));
    
    return () => mounted = false;
  }, [slug]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return getApiRoot() + imagePath;
  };

  const handleAddToCart = () => {
    if (!pkg.tests || pkg.tests.length === 0) {
      alert('No tests available in this package');
      return;
    }
    // Add all tests from this package to booking
    pkg.tests.forEach(test => {
      addItem({
        id: test.id,
        name: test.name,
        price: test.price || 0
      });
    });
    alert(`Added ${pkg.tests.length} tests from ${pkg.title} to cart!`);
  };

  const handleBookNow = () => {
    if (!user) {
      return nav(`/login?next=/health-packages/${slug}`);
    }
    handleAddToCart();
    nav('/booking');
  };

  if (loading) return <LoadingSpinner message="Loading package details..." />;

  if (error || !pkg) {
    return (
      <div className="container">
        <div style={{textAlign:'center', padding:'40px'}}>
          <h2>{error || 'Package not found'}</h2>
          <button className="btn" onClick={() => nav('/health-packages')}>Back to Packages</button>
        </div>
      </div>
    );
  }

  const totalPrice = pkg.tests?.reduce((sum, t) => sum + (t.price || 0), 0) || pkg.price || 0;

  return (
    <div className="container">
      <Helmet>
        <title>{pkg.title} | Health Packages | Book Blood Test Online</title>
        <meta name="description" content={pkg.description} />
        <meta property="og:title" content={pkg.title} />
        <meta property="og:description" content={pkg.description} />
      </Helmet>

      <button className="btn outline" style={{marginBottom:'24px'}} onClick={() => nav('/health-packages')}>← Back to Packages</button>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:'32px', alignItems:'start'}}>
        {/* Left: Image and Info */}
        <div>
          {pkg.imageUrl && (
            <div style={{marginBottom:'24px', borderRadius:'12px', overflow:'hidden', maxHeight:'400px'}}>
              <img 
                src={getImageUrl(pkg.imageUrl)}
                alt={pkg.title}
                style={{width:'100%', height:'400px', objectFit:'cover'}}
                onError={(e) => console.log('Image error:', pkg.imageUrl)}
              />
            </div>
          )}
          
          <div className="card">
            <div style={{fontSize:'40px', marginBottom:'12px'}}>{pkg.icon || '💊'}</div>
            <h1 style={{margin:'0 0 8px 0', color:'#001d3d', fontWeight:'800'}}>{pkg.title}</h1>
            <p style={{margin:'0 0 16px 0', color:'#6b7280', fontSize:'16px'}}>{pkg.description}</p>
            
            {pkg.bestFor && (
              <div style={{
                padding:'12px',
                background:'#f0f9ff',
                borderRadius:'8px',
                marginBottom:'16px',
                fontSize:'14px',
                color:'#0369a1'
              }}>
                <strong>Best for:</strong> {pkg.bestFor}
              </div>
            )}
          </div>
        </div>

        {/* Right: Tests and Booking */}
        <div>
          <div className="card" style={{marginBottom:'24px'}}>
            <div style={{
              padding:'16px',
              background:'rgba(3, 105, 161, 0.08)',
              borderRadius:'12px',
              marginBottom:'16px'
            }}>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>Total Package Price</div>
              <div style={{fontSize:'32px', fontWeight:'800', color:'#0369a1'}}>₹{totalPrice.toFixed(0)}</div>
              <div style={{fontSize:'12px', color:'#6b7280', marginTop:'4px'}}>
                {pkg.tests?.length || 0} tests included
              </div>
            </div>

            <div style={{display:'flex', gap:'12px', marginBottom:'16px'}}>
              <button 
                className="btn"
                onClick={handleBookNow}
                style={{flex:1}}
              >
                Book Now
              </button>
              <button 
                className="btn outline"
                onClick={handleAddToCart}
                style={{flex:1}}
              >
                Add to Cart
              </button>
            </div>

            <div style={{fontSize:'12px', color:'#6b7280', textAlign:'center'}}>
              ✓ Home Collection Available
              <br/>
              ✓ Fast Reports (24-48 hours)
              <br/>
              ✓ Certified Labs
            </div>
          </div>

          {/* Tests List */}
          {pkg.tests && pkg.tests.length > 0 && (
            <div className="card">
              <h3 style={{margin:'0 0 16px 0', color:'#001d3d', fontWeight:'700'}}>Tests Included ({pkg.tests.length})</h3>
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {pkg.tests.map(test => (
                  <div key={test.id} style={{
                    padding:'12px',
                    background:'#f8fafc',
                    borderRadius:'8px',
                    borderLeft:'4px solid #0369a1'
                  }}>
                    <div style={{fontWeight:'600', color:'#001d3d', marginBottom:'4px'}}>{test.name}</div>
                    {test.description && (
                      <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>{test.description}</div>
                    )}
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'12px'}}>
                      <span style={{color:'#6b7280'}}>
                        {test.fasting && '⚡ Fasting Required'} 
                        {test.sample && ` • ${test.sample}`}
                      </span>
                      <span style={{fontWeight:'600', color:'#0369a1'}}>₹{test.price?.toFixed(0) || '0'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .grid[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
