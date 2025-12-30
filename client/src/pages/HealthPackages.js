import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api, { getApiRoot } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HealthPackages() {
  const canonical = 'https://bookmybloodtest.vercel.app/health-packages';
  const nav = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/health-packages')
      .then(res => {
        if (mounted) {
          console.log('Packages received:', res.data);
          setPackages(res.data);
        }
      })
      .catch(e => {
        console.error('Error fetching packages:', e);
        if (mounted) setPackages([]);
      })
      .finally(() => mounted && setLoading(false));
    
    return () => mounted = false;
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return getApiRoot() + imagePath;
  };

  return (
    <div className="container">
      <Helmet>
        <title>Health Packages | Book Blood Test Online</title>
        <meta name="description" content="Comprehensive health packages for screening, prevention, and diagnostics. Book your health check today." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Health Packages | Book Blood Test Online" />
        <meta property="og:description" content="Comprehensive health packages for screening, prevention, and diagnostics." />
        <meta property="og:url" content={canonical} />
      </Helmet>

      <div style={{marginBottom:32}}>
        <h1 className="page-title">Health Packages</h1>
        <p style={{color:'#6b7280', fontSize:'16px', maxWidth:'600px', margin:0}}>Choose from our scientifically designed health packages tailored for prevention and early detection.</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading packages..." />
      ) : packages.length === 0 ? (
        <div className="muted">No health packages available at the moment.</div>
      ) : (
        <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))'}}>
          {packages.map(pkg => (
            <div key={pkg.id} className="card" style={{display:'flex', flexDirection:'column', cursor:'pointer', transition:'all 0.3s ease'}} onClick={() => nav(`/health-packages/${pkg.slug}`)}>
              <div style={{fontSize:'40px', marginBottom:'12px'}}>{pkg.icon || '💊'}</div>
              {pkg.imageUrl && (
                <div style={{marginBottom:'12px', borderRadius:'8px', overflow:'hidden', maxHeight:'150px'}}>
                  <img 
                    src={getImageUrl(pkg.imageUrl)} 
                    alt={pkg.title}
                    style={{width:'100%', height:'150px', objectFit:'cover'}}
                    onError={(e) => console.log('Image error:', pkg.imageUrl)}
                  />
                </div>
              )}
              <h3 style={{margin:'0 0 8px 0', color:'#0369a1', fontWeight:'700', fontSize:'18px'}}>{pkg.title}</h3>
              <p style={{margin:'0 0 12px 0', color:'#6b7280', fontSize:'14px', flex:1}}>{pkg.description}</p>
              
              <div style={{
                margin:'12px 0',
                padding:'12px',
                background:'rgba(3, 105, 161, 0.05)',
                borderRadius:'10px',
                textAlign:'center'
              }}>
                <div style={{fontSize:'24px', fontWeight:'800', color:'#0369a1'}}>₹{pkg.price.toFixed(0)}</div>
                <div style={{fontSize:'12px', color:'#6b7280', marginTop:'4px'}}>Inclusive all tests</div>
              </div>

              {pkg.bestFor && (
                <div style={{
                  padding:'10px 12px',
                  background:'#f0f9ff',
                  borderRadius:'8px',
                  fontSize:'12px',
                  color:'#0369a1',
                  textAlign:'center'
                }}>
                  <strong>Best for:</strong> {pkg.bestFor}
                </div>
              )}

              <button className="btn" style={{marginTop:'12px', width:'100%'}}>View Details</button>
            </div>
          ))}
        </div>
      )}

      <div style={{marginTop:40, padding:'32px', borderRadius:'20px', background:'linear-gradient(135deg, rgba(3,105,161,0.08) 0%, rgba(6,182,212,0.04) 100%)', border:'1px solid rgba(3, 105, 161, 0.1)', textAlign:'center'}}>
        <h2 style={{margin:'0 0 16px 0', color:'#001d3d', fontWeight:'800'}}>Questions About Our Packages?</h2>
        <p style={{color:'#6b7280', margin:'0 0 16px 0'}}>Our health advisors are ready to help you choose the right package for your needs.</p>
        <button className="btn" onClick={() => nav('/contact')}>Contact Us</button>
      </div>
    </div>
  );
}
