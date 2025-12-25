import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  useEffect(()=> {
    api.get('/bookings').then(r=>setBookings(r.data)).catch(()=>setBookings([]));
  }, []);
  const cancel = async (id) => {
    if (!window.confirm('Cancel booking?')) return;
    await api.put(`/bookings/${id}/cancel`);
    setBookings(prev=>prev.map(b=>b.id===id?{...b,status:'Cancelled'}:b));
  };
  return (
    <div>
      <h2>My Bookings</h2>
      {bookings.length===0 ? <p>No bookings yet.</p> : bookings.map(b=>(
        <div key={b.id} className="card">
          <div>ID: {b.id} — {b.status}</div>
          <div>Tests: {b.tests.map(t=>t.name).join(', ')}</div>
          <div>When: {b.datetime}</div>
          <div>Patient: {b.patient.name}</div>
          <div>Total: ${b.total.toFixed(2)}</div>
          {b.status === 'Pending' && <button className="btn danger" onClick={()=>cancel(b.id)}>Cancel</button>}
        </div>
      ))}
    </div>
  );
}
