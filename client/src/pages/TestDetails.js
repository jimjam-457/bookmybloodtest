import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useBooking } from '../context/BookingContext';

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
  if (loading) return <div style={{padding:12, background:'#e0f2fe', color:'#0369a1', borderRadius:4}}>Loading test details...</div>;
  if (!test) return <div>Test not found.</div>;
  return (
    <div>
      <h2>{test.name}</h2>
      <p>{test.description}</p>
      <p>Category: {test.category} • Sample: {test.sample} • {test.fasting ? 'Fasting required' : 'No fasting'}</p>
      <div className="actions">
        <button className="btn" onClick={()=>{ addTest(test); nav('/booking'); }}>Book this test</button>
      </div>
    </div>
  );
}
