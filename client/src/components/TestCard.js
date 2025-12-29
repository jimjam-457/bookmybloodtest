import React from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export default function TestCard({ test }) {
  const { addTest, items, removeTest } = useBooking();
  const inCart = items.find(i=>i.id===test.id);
  return (
    <div className="card" style={{position:'relative', paddingBottom: inCart ? 60 : undefined, display:'flex', flexDirection:'column'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flex:1}}>
        <div style={{flex:1}}>
          <h4 style={{margin:'0 0 8px 0', color:'#0369a1', fontWeight:'700', fontSize:'16px'}}>{test.name}</h4>
          <div className="muted small" style={{marginBottom:'10px'}}>
            <span style={{display:'inline-block', marginRight:'8px'}}>🧬 {test.category}</span>
            <span style={{display:'inline-block'}}>💧 {test.sample}</span>
          </div>
          <p style={{marginTop:8, margin:'0 0 12px 0', color:'#6b7280', fontSize:'14px', lineHeight:'1.5'}}>{test.description}</p>
          <div style={{marginTop:10, display:'flex', flexWrap:'wrap', gap:8, alignItems:'center'}}>
            {test.fasting && <span className="pill" style={{fontSize:'12px', fontWeight:'600'}}>⏱️ Fasting Required</span>}
            <span className="pill" style={{fontSize:'12px', fontWeight:'600'}}>🏠 Home Collection</span>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', minWidth:90}}>
          <div style={{fontWeight:'800', fontSize:'20px', color:'#0369a1'}}>₹{test.price.toFixed(0)}</div>
          <div style={{fontSize:'11px', color:'#6b7280', marginTop:'2px'}}>All-inclusive</div>
        </div>
      </div>
      
      <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
        <Link to={`/tests/${test.id}`} className="btn outline" style={{flex:1, textAlign:'center', padding:'8px 12px', fontSize:'13px'}}>
          View Details
        </Link>
        {!inCart ? (
          <button className="btn" style={{flex:1, padding:'8px 12px', fontSize:'13px'}} onClick={()=>addTest(test)}>
            Add to Cart
          </button>
        ) : (
          <button className="btn danger" style={{flex:1, padding:'8px 12px', fontSize:'13px'}} onClick={()=>removeTest(test.id)}>
            ✕ Remove
          </button>
        )}
      </div>

      {inCart && (
        <Link to="/booking" className="btn" style={{position:'absolute', right:12, bottom:12, width:'auto', padding:'6px 10px', fontSize:'12px'}}>
          Book Now
        </Link>
      )}
    </div>
  );
}
