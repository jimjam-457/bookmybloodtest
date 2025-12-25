import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomeBanners from '../components/HomeBanners';
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
          <h1>Book Blood Test Online at Home or Lab</h1>
          <p className="muted">Book blood test at home with convenient diagnostic lab booking. Certified labs and fast digital reports across India.</p>
          <div style={{marginTop:16}}>
            <Link to="/tests" className="btn">View Tests</Link>
            <button
              className="btn outline"
              style={{marginLeft:12}}
              onClick={() => {
                if (!user) {
                  const next = items && items.length > 0 ? '/booking' : '/tests';
                  return nav(`/login?next=${encodeURIComponent(next)}`);
                }
                if (items && items.length > 0) return nav('/booking');
                return nav('/tests');
              }}
            >
              Book Blood Test
            </button>
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

        
      </section>

      <section style={{marginTop:20}}>
        <h3>Featured Offers</h3>
        {loading ? <div className="muted">Loading banners...</div> : <HomeBanners banners={banners} />}
      </section>
    </div>
  );
}
