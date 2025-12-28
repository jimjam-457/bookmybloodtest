import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  useEffect(()=> {
    api.get('/bookings').then(r=>setBookings(r.data)).catch(()=>setBookings([]));
  }, []);
  const cancel = async (id) => {
    if (!window.confirm('Cancel booking?')) return;
    await api.put(`/bookings/${id}/status`, { status: 'Cancelled' });
    setBookings(prev=>prev.map(b=>b.id===id?{...b,status:'Cancelled'}:b));
  };
  return (
    <div>
      <h2>My Bookings</h2>
      {bookings.length===0 ? <p>No bookings yet.</p> : bookings.map(b=>(
        <div key={b.id} className="card">
          <div>ID: {b.id} — {b.status}</div>
          <div>Tests: {Array.isArray(b.tests) ? b.tests.map(t=>t.name).join(', ') : '—'}</div>
          <div>When: {b.datetime || '—'}</div>
          <div>Patient: {(b.patient && b.patient.name) || b.patient_name || '—'}</div>
          <div>Total: ${Number(b.total||0).toFixed(2)}</div>
          {b.status === 'Pending' && <button className="btn danger" onClick={()=>cancel(b.id)}>Cancel</button>}
        </div>
      ))}
    </div>
  );
}
