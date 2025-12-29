import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useBooking } from '../context/BookingContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TestDetails() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const { addTest } = useBooking();

  useEffect(()=> {
    setLoading(true);
    api.get(`/tests/${id}`).then(r=>setTest(r.data)).catch(()=>setTest(null)).finally(()=>setLoading(false));
  }, [id]);

  if (loading) return <div className="container"><LoadingSpinner message="Loading test details..." /></div>;
  if (!test) return (
    <div className="container" style={{textAlign:'center', paddingTop:'40px'}}>
      <div style={{fontSize:'48px', marginBottom:'12px'}}>❌</div>
      <h2 style={{color:'#001d3d', fontWeight:'800'}}>Test Not Found</h2>
      <p style={{color:'#6b7280'}}>The test you're looking for doesn't exist or has been removed.</p>
      <Link to="/blood-tests" className="btn" style={{display:'inline-block', marginTop:'16px'}}>Browse All Tests</Link>
    </div>
  );

  return (
    <div className="container">
      <Link to="/blood-tests" className="btn outline" style={{marginBottom:'20px'}}>← Back to Tests</Link>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:'32px', marginTop:'20px', alignItems:'start'}}>
        <div>
          <div style={{padding:'32px', background:'linear-gradient(135deg, rgba(3,105,161,0.08) 0%, rgba(6,182,212,0.04) 100%)', borderRadius:'16px', border:'1px solid rgba(3, 105, 161, 0.1)', marginBottom:'20px'}}>
            <div style={{fontSize:'64px', marginBottom:'16px', textAlign:'center'}}>🧬</div>
            <h1 style={{margin:'0 0 12px 0', fontSize:'28px', fontWeight:'800', color:'#001d3d', textAlign:'center'}}>{test.name}</h1>
            <div style={{textAlign:'center', marginBottom:'16px'}}>
              <span className="pill" style={{marginRight:'8px'}}>Category: {test.category}</span>
              <span className="pill">Sample: {test.sample}</span>
            </div>
            {test.fasting && (
              <div style={{padding:'12px', background:'rgba(217, 119, 6, 0.1)', border:'1px solid rgba(217, 119, 6, 0.2)', borderRadius:'8px', color:'#d97706', textAlign:'center', fontWeight:'600', fontSize:'14px'}}>
                ⏱️ Fasting Required (8-12 hours)
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{margin:'0 0 12px 0', fontWeight:'700', color:'#0369a1'}}>Test Details</h3>
            <div style={{display:'grid', gap:'12px', fontSize:'14px'}}>
              <div>
                <div className="muted small">Category</div>
                <div style={{fontWeight:'600', color:'#001d3d', marginTop:'4px'}}>{test.category}</div>
              </div>
              <div>
                <div className="muted small">Sample Type</div>
                <div style={{fontWeight:'600', color:'#001d3d', marginTop:'4px'}}>{test.sample}</div>
              </div>
              <div>
                <div className="muted small">Fasting Status</div>
                <div style={{fontWeight:'600', color:'#001d3d', marginTop:'4px'}}>{test.fasting ? 'Required (8-12 hours)' : 'Not required'}</div>
              </div>
              <div style={{paddingTop:'12px', borderTop:'1px solid rgba(3, 105, 161, 0.1)'}}>
                <div className="muted small">Price</div>
                <div style={{fontSize:'24px', fontWeight:'800', color:'#0369a1', marginTop:'4px'}}>₹{test.price.toFixed(0)}</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h2 style={{margin:'0 0 16px 0', color:'#001d3d', fontWeight:'700', fontSize:'20px'}}>About This Test</h2>
            <p style={{color:'#6b7280', lineHeight:'1.6', margin:'0 0 16px 0'}}>{test.description}</p>

            <div style={{padding:'16px', background:'#e0f2fe', borderRadius:'12px', border:'1px solid rgba(3, 105, 161, 0.2)', marginBottom:'16px'}}>
              <strong style={{color:'#0369a1', display:'block', marginBottom:'8px'}}>ℹ️ What to Know</strong>
              <ul style={{margin:'0', paddingLeft:'20px', fontSize:'13px', color:'#0369a1'}}>
                <li>Available for home collection and lab visits</li>
                <li>Results delivered within 24-48 hours</li>
                <li>Secure digital report access</li>
                <li>Can be combined with other tests</li>
              </ul>
            </div>

            <div>
              <button 
                className="btn" 
                onClick={()=>{ addTest(test); nav('/booking'); }}
                style={{width:'100%', marginBottom:'8px'}}
              >
                ✓ Add to Cart & Book
              </button>
              <Link to="/blood-tests" className="btn outline" style={{width:'100%', textAlign:'center'}}>
                Browse More Tests
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
