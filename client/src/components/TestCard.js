import React from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export default function TestCard({ test }) {
  const { addTest, items, removeTest } = useBooking();
  const inCart = items.find(i=>i.id===test.id);
  return (
    <div className="card" style={{position:'relative', paddingBottom: inCart ? 56 : undefined}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12}}>
        <div style={{flex:1}}>
          <h4 style={{margin:'0 0 6px 0'}}>{test.name}</h4>
          <div className="muted small">{test.category} • {test.sample}</div>
          <p style={{marginTop:8, color:'#334155'}}>{test.description}</p>
          <div style={{marginTop:8, display:'flex', flexWrap:'wrap', gap:8, alignItems:'center'}}>
            {test.fasting && <span className="pill">Fasting</span>}
            <span className="pill">Home Collection</span>
            <Link to={`/tests/${test.id}`} className="btn outline small">Details</Link>
            {!inCart ? (
              <button className="btn small" onClick={()=>addTest(test)}>Add</button>
            ) : (
              <button className="pill danger" onClick={()=>removeTest(test.id)}>Remove</button>
            )}
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', minWidth:90}}>
          <div style={{fontWeight:700}}>${test.price.toFixed(2)}</div>
        </div>
      </div>
      {inCart && (
        <Link to="/booking" className="btn" style={{position:'absolute', right:12, bottom:12, width:'auto'}}>
          Book
        </Link>
      )}
    </div>
  );
}
