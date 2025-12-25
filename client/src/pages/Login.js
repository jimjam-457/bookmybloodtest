import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const handle = async () => {
    if (!form.email || form.password.length < 6) { setError('Invalid input'); return; }
    const res = await login(form.email, form.password);
    if (res.ok) nav('/');
    else setError(res.message);
  };
  return (
    <div>
      <h2>Login</h2>
      <div className="form">
        <label>Email</label>
        <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <label>Password</label>
        <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        {error && <div className="error">{error}</div>}
        <div className="actions">
          <button className="btn" onClick={handle}>Login</button>
          <Link to="/register" className="btn outline">Register</Link>
        </div>
      </div>
    </div>
  );
}
