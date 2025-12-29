import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomeBanners from '../components/HomeBanners';
import LoadingSpinner from '../components/LoadingSpinner';
import { getBanners } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function Home() {
  const [banners, setBanners] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { items } = useBooking();
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;
    getBanners().then(data => {
      if (mounted) {
        console.log('Banners received:', data);
        setBanners(data);
      }
    }).catch(e => {
      console.error('Banners fetch error:', e);
      if (mounted) setBanners([]);
    }).finally(() => mounted && setLoading(false));
    return () => mounted = false;
  }, []);

  return (
    <div className="container">
      <section className="hero home-hero">
        <div className="hero-left">
          <h1>🩸 Book Blood Test Online</h1>
          <p className="muted">Quick, convenient diagnostic lab booking with home collection. Certified labs, fast digital reports, and trusted service across India.</p>
          <div style={{marginTop:24, display:'flex', gap:12, flexWrap:'wrap'}}>
            <Link to="/tests" className="btn">Browse Tests</Link>
            <button
              className="btn outline"
              onClick={() => {
                if (!user) {
                  const next = items && items.length > 0 ? '/booking' : '/tests';
                  return nav(`/login?next=${encodeURIComponent(next)}`);
                }
                if (items && items.length > 0) return nav('/booking');
                return nav('/tests');
              }}
            >
              Book Now
            </button>
          </div>
          <div style={{marginTop:28}} className="features-grid">
            <div className="card small">
              <strong>🏠 Home Collection</strong>
              <div className="muted small">Sample collected from your doorstep</div>
            </div>
            <div className="card small">
              <strong>⚡ Fast Reports</strong>
              <div className="muted small">Digital reports in 24-48 hours</div>
            </div>
            <div className="card small">
              <strong>✓ Certified Labs</strong>
              <div className="muted small">Accurate & NABL accredited</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{marginTop:40}}>
        <div style={{marginBottom:20}}>
          <h2 style={{margin:0, color:'#001d3d', fontWeight:800, fontSize:28}}>🎯 Featured Offers</h2>
          <p style={{color:'#6b7280', marginTop:6}}>Explore our special health packages and discounts</p>
        </div>
        {loading ? <LoadingSpinner message="Loading offers..." /> : <HomeBanners banners={banners} />}
      </section>

      <section style={{marginTop:40, padding:'40px 32px', borderRadius:'20px', background:'linear-gradient(135deg, rgba(3,105,161,0.08) 0%, rgba(6,182,212,0.04) 100%)', border:'1px solid rgba(3, 105, 161, 0.1)'}}>
        <h2 style={{margin:'0 0 16px 0', color:'#001d3d', fontWeight:800, fontSize:24}}>Why Choose Us?</h2>
        <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))'}}>
          <div className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'32px', marginBottom:'12px'}}>💉</div>
            <strong style={{fontSize:'16px', color:'#0369a1'}}>Professional Phlebotomists</strong>
            <p style={{margin:'8px 0 0 0', color:'#6b7280', fontSize:'14px'}}>Trained and certified for safe sample collection</p>
          </div>
          <div className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'32px', marginBottom:'12px'}}>🔒</div>
            <strong style={{fontSize:'16px', color:'#0369a1'}}>Secure & Confidential</strong>
            <p style={{margin:'8px 0 0 0', color:'#6b7280', fontSize:'14px'}}>Your health data is encrypted and protected</p>
          </div>
          <div className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'32px', marginBottom:'12px'}}>📱</div>
            <strong style={{fontSize:'16px', color:'#0369a1'}}>Easy Digital Access</strong>
            <p style={{margin:'8px 0 0 0', color:'#6b7280', fontSize:'14px'}}>View reports anytime, anywhere on your phone</p>
          </div>
        </div>
      </section>
    </div>
  );
}
