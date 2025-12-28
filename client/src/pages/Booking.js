import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import api, { setAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';

const STEPS = ['Tests','Patient','Address','Slot & Type','Payment','Review'];

export default function Booking() {
  const { items, removeTest, clear, patient, address, payment, setPatient, setAddress, setPayment } = useBooking();
  const { user, token } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [localPatient, setLocalPatient] = useState(patient || { name:'', age:'', gender:'', phone:'', email:'' });
  const [localAddress, setLocalAddress] = useState(address || { addressLine1:'', addressLine2:'', landmark:'', city:'', state:'', pincode:'', country:'India' });
  const [collectionType, setCollectionType] = useState('Home Collection');
  const [datetime, setDatetime] = useState('');
  const [paymentSelection, setPaymentSelection] = useState('COD');
  const [paymentId, setPaymentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const total = items.reduce((s,t)=>s+(t.price||0),0);

  const canNext = () => {
    if (step === 0) return items.length > 0;
    if (step === 1) return localPatient.name && localPatient.age && /^\d{7,15}$/.test(localPatient.phone) && /\S+@\S+\.\S+/.test(localPatient.email);
    if (step === 2) return localAddress.addressLine1 && localAddress.city && localAddress.state && /^\d{4,7}$/.test(localAddress.pincode);
    if (step === 3) return datetime;
    if (step === 4) return true;
    return true;
  };

  const goNext = async () => {
    if (!canNext()) return;
    if (step === 1) setPatient(localPatient);
    if (step === 2) setAddress(localAddress);
    if (step === 4) setPayment({ method: paymentSelection, paymentId });
    setStep(s => Math.min(STEPS.length-1, s+1));
  };
  const goBack = () => setStep(s => Math.max(0, s-1));

  const submitBooking = async () => {
    // Ensure user is logged in and token exists
    if (!user || !token) {
      alert('You must be logged in to complete booking. Please login.');
      return nav('/login');
    }
    setLoading(true);
    // Ensure token is set in axios headers
    setAuthToken(token);
    try {
      const resp = await api.post('/bookings', {
        tests: items,
        patient: localPatient,
        address: localAddress,
        collectionType,
        datetime,
        paymentMethod: paymentSelection,
        paymentId
      });
      clear();
      setLoading(false);
      nav('/my-bookings');
      alert(`Booking created: ID ${resp.data.id}`);
    } catch (e) {
      setLoading(false);
      alert(e.response?.data?.message || 'Booking failed. Please try again.');
    }
  };

  return (
    <div className="booking-page">
      <h2 className="page-title">Book a Blood Test</h2>

      <div className="stepper">
        {STEPS.map((s,i)=>(
          <div key={s} className={`step ${i===step?'active': i<step ? 'done' : ''}`}>
            <div className="circle">{i+1}</div>
            <div className="label">{s}</div>
          </div>
        ))}
      </div>

      <div className="step-content">
        {step===0 && (
          <div>
            <h3>Selected Tests</h3>
            {items.length===0 ? <p className="muted">No tests selected.</p> :
              items.map(t=>(
                <div key={t.id} className="line card-inline">
                  <div>
                    <strong>{t.name}</strong>
                    <div className="muted small">{t.category} • {t.sample}</div>
                  </div>
                  <div className="price-col">
                    ${t.price.toFixed(2)}
                    <button className="pill danger" onClick={()=>removeTest(t.id)}>Remove</button>
                  </div>
                </div>
              ))
            }
            <div className="actions">
              <div className="muted">Total: <strong>${total.toFixed(2)}</strong></div>
              <div>
                <button className="btn outline" onClick={()=>nav('/tests')}>Add More</button>
                <button className="btn" onClick={goNext} disabled={!canNext()}>Continue</button>
              </div>
            </div>
          </div>
        )}

        {step===1 && (
          <div className="card">
            <h3>Patient Details</h3>
            <FormInput label="Full name" value={localPatient.name} onChange={e=>setLocalPatient({...localPatient, name:e.target.value})}/>
            <div className="row">
              <FormInput label="Age" value={localPatient.age} onChange={e=>setLocalPatient({...localPatient, age:e.target.value})}/>
              <div className="form-group">
                <label>Gender</label>
                <div className="gender-row">
                  {['Male','Female','Other'].map(g=>(
                    <button key={g} className={`pill ${localPatient.gender===g?'active':''}`} onClick={()=>setLocalPatient({...localPatient, gender:g})}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
            <FormInput label="Phone" value={localPatient.phone} onChange={e=>setLocalPatient({...localPatient, phone:e.target.value})}/>
            <FormInput label="Email" value={localPatient.email} onChange={e=>setLocalPatient({...localPatient, email:e.target.value})}/>
            <div className="actions">
              <button className="btn outline" onClick={goBack}>Back</button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>Save & Continue</button>
            </div>
          </div>
        )}

        {step===2 && (
          <div className="card">
            <h3>Address</h3>
            <FormInput label="Address Line 1" value={localAddress.addressLine1} onChange={e=>setLocalAddress({...localAddress,addressLine1:e.target.value})}/>
            <FormInput label="Address Line 2 (optional)" value={localAddress.addressLine2} onChange={e=>setLocalAddress({...localAddress,addressLine2:e.target.value})}/>
            <FormInput label="Landmark (optional)" value={localAddress.landmark} onChange={e=>setLocalAddress({...localAddress,landmark:e.target.value})}/>
            <div className="row">
              <FormInput label="City" value={localAddress.city} onChange={e=>setLocalAddress({...localAddress,city:e.target.value})}/>
              <FormInput label="State" value={localAddress.state} onChange={e=>setLocalAddress({...localAddress,state:e.target.value})}/>
            </div>
            <div className="row">
              <FormInput label="Pincode" value={localAddress.pincode} onChange={e=>setLocalAddress({...localAddress,pincode:e.target.value})}/>
              <FormInput label="Country" value={localAddress.country} onChange={e=>setLocalAddress({...localAddress,country:e.target.value})}/>
            </div>
            <div className="actions">
              <button className="btn outline" onClick={goBack}>Back</button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>Save & Continue</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div className="card">
            <h3>Slot & Collection Type</h3>
            <div className="form-group">
              <label>Collection Type</label>
              <div className="gender-row">
                {['Home Collection','Lab Visit'].map(t=>(
                  <button key={t} className={`pill ${collectionType===t?'active':''}`} onClick={()=>setCollectionType(t)}>{t}</button>
                ))}
              </div>
            </div>
            <FormInput label="Date" type="date" value={datetime.split(' ')[0]||''} onChange={e=>setDatetime(`${e.target.value} ${datetime.split(' ')[1]||'07:00-09:00'}`)} />
            <div className="form-group">
              <label>Time Slot</label>
              <div className="gender-row">
                {['07:00-09:00','09:00-11:00','17:00-19:00'].map(slot=>(
                  <button key={slot} className={`pill ${datetime.includes(slot)?'active':''}`} onClick={()=>setDatetime(prev=>`${prev.split(' ')[0]||new Date().toISOString().slice(0,10)} ${slot}`)}>{slot}</button>
                ))}
              </div>
            </div>
            <div className="actions">
              <button className="btn outline" onClick={goBack}>Back</button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>Continue</button>
            </div>
          </div>
        )}

        {step===4 && (
          <div className="card">
            <h3>Payment</h3>
            <div className="form-group">
              <label>Payment Method</label>
              <div className="gender-row">
                <button className={`pill ${paymentSelection==='COD'?'active':''}`} onClick={()=>setPaymentSelection('COD')}>Cash on Collection</button>
              </div>
            </div>

            {paymentSelection === 'COD' && <p className="muted">Pay the technician at the time of sample collection.</p>}

            <div className="actions">
              <button className="btn outline" onClick={goBack}>Back</button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>Continue</button>
            </div>
          </div>
        )}

        {step===5 && (
          <div className="card">
            <h3>Review & Confirm</h3>
            <div className="order-summary">
              <div><strong>Patient:</strong> {localPatient.name} • {localPatient.phone}</div>
              <div><strong>Address:</strong> {localAddress.addressLine1}, {localAddress.city} - {localAddress.pincode}</div>
              <div><strong>Collection:</strong> {collectionType} • {datetime}</div>
              <div><strong>Tests:</strong> {items.map(t=>t.name).join(', ')}</div>
              <div><strong>Total:</strong> ${total.toFixed(2)}</div>
              <div><strong>Payment:</strong> {paymentSelection} • {paymentSelection === 'COD' ? 'Pending' : 'Paid'}</div>
            </div>

            <div className="actions">
              <button className="btn outline" onClick={goBack}>Back</button>
              <button className="btn" onClick={submitBooking} disabled={loading}>{loading ? 'Processing...' : (paymentSelection === 'COD' ? 'Confirm Booking' : 'Pay & Confirm')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
