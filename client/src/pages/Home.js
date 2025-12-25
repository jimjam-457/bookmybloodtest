import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HomeBanners from '../components/HomeBanners';
import { getBanners } from '../services/api';

export default function Home() {
  const [banners, setBanners] = useState(null);
  const [loading, setLoading] = useState(true);

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
          <h1>Book Reliable Blood Tests at Home or Lab</h1>
          <p className="muted">Certified labs, quick reports, and convenient home sample collection. Schedule your test with confidence.</p>
          <div style={{marginTop:16}}>
            <Link to="/tests" className="btn">View Tests</Link>
            <Link to="/booking" className="btn outline" style={{marginLeft:12}}>Book Blood Test</Link>
          </div>
          <div style={{marginTop:20}} className="features-grid">
            <div className="card small">
              <strong>Home Sample Collection</strong>
              <div className="muted small">We collect from your doorstep</div>
            </div>
            <div className="card small">
              <strong>Fast Digital Reports</strong>
              <div className="muted small">Secure online reports</div>
            </div>
            <div className="card small">
              <strong>Certified Labs</strong>
              <div className="muted small">Accurate & reliable</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="illustration card">
            {/* Placeholder artwork area; admin will supply images later */}
            <div style={{height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'#0f172a', opacity:0.8}}>
              <div>
                <div style={{fontSize:48}}>🧪</div>
                <div className="muted">Lab Illustration</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{marginTop:20}}>
        <h3>Featured Offers</h3>
        {loading ? <div className="muted">Loading banners...</div> : <HomeBanners banners={banners} />}
      </section>
    </div>
  );
}
