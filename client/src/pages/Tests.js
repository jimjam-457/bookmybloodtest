import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TestCard from '../components/TestCard';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { items } = useBooking();
  const nav = useNavigate();

  useEffect(()=> {
    setLoading(true);
    api.get('/tests').then(r=>setTests(r.data)).catch(()=>setTests([])).finally(()=>setLoading(false));
  }, []);

  // If package query param is set, use it as the search query
  useEffect(() => {
    const pkg = searchParams.get('package');
    if (pkg) setQ(pkg);
  }, [searchParams]);

  const filtered = tests.filter(t => t.name.toLowerCase().includes(q.toLowerCase()) || (t.category||'').toLowerCase().includes(q.toLowerCase()));
  
  return (
    <div>
      <div style={{marginBottom:28}}>
        <h2 style={{margin:'0 0 8px 0', fontSize:'28px', fontWeight:'800', color:'#001d3d'}}>🧬 Available Blood Tests</h2>
        <p style={{color:'#6b7280', fontSize:'15px', margin:0}}>Browse our comprehensive range of diagnostic tests. Filter by name or category to find what you need.</p>
      </div>
      
      <div style={{marginBottom:20, display:'flex', gap:'12px', alignItems:'center'}}>
        <input 
          placeholder="🔍 Search tests by name or category..." 
          value={q} 
          onChange={e=>setQ(e.target.value)}
          style={{flex:1, fontSize:'15px'}}
        />
        {q && (
          <button 
            className="btn outline"
            onClick={() => setQ('')}
            style={{padding:'12px 16px'}}
          >
            Clear
          </button>
        )}
      </div>

      {loading && <LoadingSpinner message="Loading tests..." />}
      
      {!loading && (
        <>
          {q && (
            <div style={{marginBottom:16, padding:'12px', background:'#e0f2fe', borderRadius:'12px', color:'#0369a1', fontSize:'14px'}}>
              Found <strong>{filtered.length}</strong> test{filtered.length !== 1 ? 's' : ''} for "<strong>{q}</strong>"
            </div>
          )}
          
          <div className="grid">
            {filtered.length > 0 ? (
              filtered.map(t=> <TestCard key={t.id} test={t} />)
            ) : (
              <div style={{gridColumn:'1 / -1', textAlign:'center', padding:'32px', color:'#6b7280'}}>
                <div style={{fontSize:'40px', marginBottom:'12px'}}>🔍</div>
                <p>No tests found matching your search.</p>
                <p style={{fontSize:'14px', margin:'8px 0 0 0'}}>Try different keywords or browse all tests</p>
              </div>
            )}
          </div>
        </>
      )}

      {items.length > 0 && (
        <div style={{position:'fixed', right:24, bottom:24, zIndex:1000, animation:'slideIn 0.3s ease-out'}}>
          <button className="btn" onClick={()=>nav('/booking')} style={{
            padding:'14px 20px',
            fontSize:'16px',
            borderRadius:'12px',
            boxShadow:'0 4px 20px rgba(3, 105, 161, 0.3)',
            display:'flex',
            alignItems:'center',
            gap:'8px'
          }}>
            📦 Book ({items.length})
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
