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
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    const validEmail = /\S+@\S+\.\S+/.test(form.email);
    if (!validEmail || form.password.length < 6) { 
      setError('Please enter a valid email and 6+ character password'); 
      return; 
    }
    setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.ok) nav(next);
    else setError(res.message);
  };

  return (
    <div className="container">
      <div style={{maxWidth:'480px', margin:'0 auto', paddingTop:'20px', paddingBottom:'40px'}}>
        <div style={{marginBottom:32, textAlign:'center'}}>
          <h1 style={{fontSize:'32px', fontWeight:'800', color:'#001d3d', margin:'0 0 8px 0'}}>🔐 Welcome Back</h1>
          <p style={{color:'#6b7280', margin:0}}>Sign in to access your bookings and health records</p>
        </div>

        <div className="card" style={{borderRadius:'18px'}}>
          <div className="form">
            <FormInput
              label="Email Address"
              type="email"
              value={form.email}
              onChange={e=>setForm({...form, email:e.target.value})}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{display:'flex', gap:8, alignItems:'flex-end'}}>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e=>setForm({...form, password:e.target.value})}
                  placeholder="Minimum 6 characters"
                  autoComplete="current-password"
                  style={{flex:1}}
                />
                <button 
                  type="button" 
                  className="btn outline" 
                  onClick={()=>setShowPwd(s=>!s)}
                  style={{padding:'12px 14px', fontSize:'13px'}}
                >
                  {showPwd ? '👁️ Hide' : '👁️ Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="error" role="alert">
                <strong>⚠️ Error:</strong> {error}
              </div>
            )}

            <button 
              className="btn" 
              onClick={handle}
              disabled={loading}
              style={{width:'100%', marginTop:'20px', padding:'12px 16px', fontSize:'16px'}}
            >
              {loading ? '⏳ Signing in...' : '✓ Sign In'}
            </button>

            <div style={{marginTop:20, paddingTop:20, borderTop:'1px solid rgba(3, 105, 161, 0.1)', textAlign:'center'}}>
              <p style={{color:'#6b7280', margin:'0 0 12px 0', fontSize:'14px'}}>New to our platform?</p>
              <Link to="/register" className="btn outline" style={{width:'100%', textAlign:'center'}}>
                Create Account
              </Link>
            </div>
          </div>
        </div>

        <div style={{marginTop:24, padding:'16px', background:'#e0f2fe', borderRadius:'12px', border:'1px solid rgba(3, 105, 161, 0.2)', textAlign:'center', fontSize:'13px', color:'#0369a1'}}>
          💡 <strong>Demo Account:</strong> Use test@example.com / password123
        </div>
      </div>
    </div>
  );
    </div>
  );
}
