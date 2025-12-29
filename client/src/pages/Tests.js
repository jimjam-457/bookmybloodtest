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
      <h2>Available Tests</h2>
      <input placeholder="Search by name or category" value={q} onChange={e=>setQ(e.target.value)} />
      {loading && <LoadingSpinner message="Loading tests..." />}
      <div className="grid">
        {!loading && filtered.map(t=> <TestCard key={t.id} test={t} />)}
      </div>
      {items.length > 0 && (
        <div style={{position:'fixed', right:16, bottom:16, zIndex:1000}}>
          <button className="btn" onClick={()=>nav('/booking')}>
            Book ({items.length})
          </button>
        </div>
      )}
    </div>
  );
}
