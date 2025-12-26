import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import FormInput from '../components/FormInput';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/';
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const handle = async () => {
    const validEmail = /\S+@\S+\.\S+/.test(form.email);
    if (!validEmail || form.password.length < 6) { setError('Please enter a valid email and 6+ char password'); return; }
    const res = await login(form.email, form.password);
    if (res.ok) nav(next);
    else setError(res.message);
  };
  return (
    <div className="container">
      <h2 className="page-title">Welcome back</h2>
      <div className="card" style={{maxWidth:520, margin:'0 auto'}}>
        <div className="form">
          <FormInput
            label="Email"
            type="email"
            value={form.email}
            onChange={e=>setForm({...form, email:e.target.value})}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <div className="row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e=>setForm({...form, password:e.target.value})}
                  placeholder="Minimum 6 characters"
                  autoComplete="current-password"
                  style={{flex:1}}
                />
                <button type="button" className="btn small outline" onClick={()=>setShowPwd(s=>!s)}>
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
          {error && <div className="error" role="alert">{error}</div>}
          <button className="btn" onClick={handle}>Login</button>
          <div style={{display:'flex', justifyContent:'center', gap:8, marginTop:8}}>
            <span className="muted small">New here?</span>
            <Link to="/register" className="btn small outline">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
