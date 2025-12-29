import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=> {
    setLoading(true);
    api.get('/bookings').then(r=>setBookings(r.data)).catch(()=>setBookings([])).finally(()=>setLoading(false));
  }, []);
  const cancel = async (id) => {
    if (!window.confirm('Cancel booking?')) return;
    await api.put(`/bookings/${id}/status`, { status: 'Cancelled' });
    setBookings(prev=>prev.map(b=>b.id===id?{...b,status:'Cancelled'}:b));
  };
  return (
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{margin:'0 0 8px 0', fontSize:'28px', fontWeight:'800', color:'#001d3d'}}>📋 My Bookings</h2>
        <p style={{color:'#6b7280', fontSize:'15px', margin:0}}>View and manage all your blood test bookings</p>
      </div>

      {loading && <LoadingSpinner message="Loading your bookings..." />}
      
      {!loading && (
        <>
          {bookings.length === 0 ? (
            <div style={{padding:'40px 20px', textAlign:'center', background:'#f0f9ff', borderRadius:'16px', border:'1px solid rgba(3, 105, 161, 0.1)'}}>
              <div style={{fontSize:'48px', marginBottom:'12px'}}>📝</div>
              <p style={{color:'#0369a1', fontWeight:'600', fontSize:'16px', margin:'0 0 8px 0'}}>No bookings yet</p>
              <p style={{color:'#6b7280', margin:'0 0 16px 0'}}>Get started by booking your first blood test</p>
              <a href="/blood-tests" className="btn" style={{display:'inline-block'}}>Browse Tests</a>
            </div>
          ) : (
            <div className="grid" style={{gridTemplateColumns:'1fr'}}>
              {bookings.map(b=>(
                <div key={b.id} className="card" style={{borderLeft:'4px solid #0369a1'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', flexWrap:'wrap', gap:'8px'}}>
                    <div>
                      <h3 style={{margin:'0 0 4px 0', color:'#001d3d', fontWeight:'700', fontSize:'16px'}}>
                        Booking ID: <span style={{color:'#0369a1'}}>{b.id}</span>
                      </h3>
                      <div style={{fontSize:'13px', color:'#6b7280'}}>
                        {new Date(b.created_at).toLocaleDateString()} at {new Date(b.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div style={{
                      padding:'6px 12px',
                      borderRadius:'999px',
                      fontSize:'12px',
                      fontWeight:'700',
                      background: b.status === 'Completed' ? '#dcfce7' : 
                                   b.status === 'Cancelled' ? '#fee2e2' : 
                                   b.status === 'In Progress' ? '#fef3c7' : '#e0f2fe',
                      color: b.status === 'Completed' ? '#166534' : 
                             b.status === 'Cancelled' ? '#991b1b' : 
                             b.status === 'In Progress' ? '#92400e' : '#0369a1'
                    }}>
                      {b.status}
                    </div>
                  </div>

                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'12px', marginBottom:'12px', fontSize:'14px'}}>
                    <div>
                      <div className="muted small">Tests Selected</div>
                      <div style={{fontWeight:'600', color:'#001d3d', marginTop:'4px'}}>
                        {Array.isArray(b.tests) ? b.tests.length : 0} test{Array.isArray(b.tests) && b.tests.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div>
                      <div className="muted small">Collection Type</div>
                      <div style={{fontWeight:'600', color:'#001d3d', marginTop:'4px'}}>{b.collection_type || '—'}</div>
                    </div>
                    <div>
                      <div className="muted small">Scheduled Date</div>
                      <div style={{fontWeight:'600', color:'#001d3d', marginTop:'4px'}}>{b.datetime || '—'}</div>
                    </div>
                    <div>
                      <div className="muted small">Total Amount</div>
                      <div style={{fontWeight:'600', color:'#0369a1', marginTop:'4px', fontSize:'16px'}}>
                        ${Number(b.total||0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={{paddingTop:'12px', borderTop:'1px solid rgba(3, 105, 161, 0.1)', display:'flex', gap:'8px'}}>
                    <a href={`/booking/${b.id}`} className="btn outline" style={{flex:1, textAlign:'center', padding:'8px 12px', fontSize:'13px'}}>
                      View Details
                    </a>
                    {b.status === 'Pending' && (
                      <button 
                        className="btn danger" 
                        onClick={()=>cancel(b.id)}
                        style={{flex:1, padding:'8px 12px', fontSize:'13px'}}
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
