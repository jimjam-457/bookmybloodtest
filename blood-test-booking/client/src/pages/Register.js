import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState('');
  const handle = async () => {
    if (!form.name || !/\S+@\S+\.\S+/.test(form.email) || form.password.length < 6) { setError('Invalid input'); return; }
    const res = await register(form.name, form.email, form.password);
    if (res.ok) {
      const next = params.get('next');
      nav(next || '/');
    }
    else setError(res.message);
  };
  return (
    <div>
      <h2>Register</h2>
      <div className="form">
        <label>Full Name</label>
        <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <label>Email</label>
        <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <label>Password</label>
        <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        {error && <div className="error">{error}</div>}
        <div className="actions">
          <button className="btn" onClick={handle}>Register</button>
        </div>
      </div>
    </div>
  );
}
