import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TestCard from '../components/TestCard';
import { useSearchParams } from 'react-router-dom';

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [q, setQ] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(()=> {
    api.get('/tests').then(r=>setTests(r.data)).catch(()=>setTests([]));
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
      <div className="grid">
        {filtered.map(t=> <TestCard key={t.id} test={t} />)}
      </div>
    </div>
  );
}
