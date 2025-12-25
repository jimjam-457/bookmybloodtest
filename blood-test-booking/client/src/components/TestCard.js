import React from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export default function TestCard({ test }) {
  const { addTest, items, removeTest } = useBooking();
  const inCart = items.find(i=>i.id===test.id);
  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', gap:12}}>
        <div>
          <h4 style={{margin:'0 0 6px 0'}}>{test.name}</h4>
          <div className="muted small">{test.category} • {test.sample}</div>
          <p style={{marginTop:8, color:'#334155'}}>{test.description}</p>
          <div style={{marginTop:8}}>
            {test.fasting && <span className="pill">Fasting</span>}
            <span className="pill">Home Collection</span>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:700}}>${test.price.toFixed(2)}</div>
          <div style={{marginTop:10}}>
            <Link to={`/tests/${test.id}`} className="btn outline" style={{display:'inline-block', marginRight:8}}>Details</Link>
            {!inCart ? (
              <button className="btn" onClick={()=>addTest(test)}>Add</button>
            ) : (
              <button className="btn pill danger" onClick={()=>removeTest(test.id)}>Remove</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
