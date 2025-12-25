import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [tests, setTests] = useState([]);
  const [newTest, setNewTest] = useState({ name:'', description:'', price:0, fasting:false, sample:'Blood', category:'' });
  const [view, setView] = useState('bookings'); // 'bookings' | 'tests' | 'banners'
  const [banners, setBanners] = useState([]);
  const [bannerForm, setBannerForm] = useState({ title:'', subtitle:'', imageUrl:'', testId:'', packageSlug:'', isActive:true });
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user || user.role !== 'admin') {
      setError('Admin access required. Please login as admin.');
      return;
    }
    try {
      const [bR, tR] = await Promise.all([api.get('/bookings'), api.get('/tests')]);
      setBookings(bR.data); setTests(tR.data);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load admin data.');
    }
  }, [user]);

  useEffect(()=> { fetchAll(); fetchBanners(); }, [fetchAll]);
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setBookings(prev=>prev.map(b=>b.id===id?{...b,status}:b));
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update status');
    }
  };
  const createTest = async () => {
    if (!user || user.role !== 'admin') { setError('Admin access required to create tests'); return; }
    try {
      await api.post('/tests', newTest);
      setNewTest({ name:'', description:'', price:0, fasting:false, sample:'Blood', category:'' });
      fetchAll();
      setError(null);
    } catch (e) {
      if (e.response?.status === 401) setError('Unauthorized. Please login.');
      else if (e.response?.status === 403) setError('Forbidden. Admin access required.');
      else setError(e.response?.data?.message || 'Failed to create test');
    }
  };
  const deleteTest = async (id) => {
    if (!user || user.role !== 'admin') { setError('Admin access required'); return; }
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Delete test?')) return;
    try {
      await api.delete(`/tests/${id}`);
      fetchAll();
      setError(null);
    } catch (e) { setError(e.response?.data?.message || 'Failed to delete test'); }
  };

  const fetchBanners = async () => {
    try {
      const r = await api.get('/banners');
      setBanners(r.data);
    } catch (e) {
      setBanners([]);
    }
  };

  const createBanner = async () => {
    try {
      console.log('Creating banner with data:', { ...bannerForm, testId: bannerForm.testId || null, packageSlug: bannerForm.packageSlug || null });
      const resp = await api.post('/banners', { ...bannerForm, testId: bannerForm.testId || null, packageSlug: bannerForm.packageSlug || null });
      console.log('Banner created response:', resp.data);
      setBannerForm({ title:'', subtitle:'', imageUrl:'', testId:'', packageSlug:'', isActive:true });
      fetchBanners();
    } catch(e) { 
      console.error('Banner creation error:', e.response?.data);
      alert('Failed to create banner: ' + (e.response?.data?.message || e.message)); 
    }
  };

  const deactivateBanner = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if(!confirm('Deactivate this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch(e){ alert('Failed'); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const resp = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Build full image URL
      const imageUrl = `http://localhost:5000${resp.data.imageUrl}`;
      console.log('Image uploaded:', imageUrl);
      setBannerForm({ ...bannerForm, imageUrl });
      setError(null);
    } catch (e) {
      console.error('Upload error:', e);
      setError('Image upload failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="admin-page">
      <div style={{display:'flex', gap:12, marginBottom:12}}>
        <button className={`pill ${view==='bookings'?'active':''}`} onClick={()=>setView('bookings')}>Bookings</button>
        <button className={`pill ${view==='tests'?'active':''}`} onClick={()=>setView('tests')}>Tests</button>
        <button className={`pill ${view==='banners'?'active':''}`} onClick={()=>setView('banners')}>Banners</button>
      </div>

      {view === 'banners' && (
        <div>
          <h3>Manage Banners</h3>
          {error && <div className="error" style={{marginBottom:12, padding:8, background:'#fee2e2', color:'#991b1b', borderRadius:4}}>{error}</div>}
          <div className="card">
            <div className="form">
              <input placeholder="Title" value={bannerForm.title} onChange={e=>setBannerForm({...bannerForm, title:e.target.value})} />
              <input placeholder="Subtitle" value={bannerForm.subtitle} onChange={e=>setBannerForm({...bannerForm, subtitle:e.target.value})} />
              
              <div style={{marginBottom:12}}>
                <label style={{display:'block', marginBottom:6}}>Upload Image:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  style={{padding:8}}
                />
                {uploadingImage && <div className="muted small">Uploading...</div>}
              </div>

              {bannerForm.imageUrl && (
                <div style={{marginBottom:12}}>
                  <label style={{display:'block', marginBottom:6}}>Preview:</label>
                  <img src={bannerForm.imageUrl} alt="preview" style={{maxWidth:'100%', maxHeight:120, borderRadius:4}} />
                </div>
              )}

              <input placeholder="Test ID (optional)" value={bannerForm.testId} onChange={e=>setBannerForm({...bannerForm, testId:e.target.value})} />
              <input placeholder="Package Slug (optional)" value={bannerForm.packageSlug} onChange={e=>setBannerForm({...bannerForm, packageSlug:e.target.value})} />
              <label><input type="checkbox" checked={bannerForm.isActive} onChange={e=>setBannerForm({...bannerForm, isActive:e.target.checked})} /> Active</label>
              <div style={{marginTop:8}}>
                <button className="btn" onClick={createBanner}>Add Banner</button>
              </div>
            </div>
          </div>

          <div style={{marginTop:12}}>
            {banners.length === 0 ? <div className="muted">No banners yet.</div> :
              <div className="grid">
                {banners.map(b => (
                  <div key={b.id} className="card">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div>
                        <strong>{b.title}</strong>
                        <div className="muted small">{b.subtitle}</div>
                        <div className="muted small">Link: {b.testId ? `Test ${b.testId}` : (b.packageSlug || '—')}</div>
                      </div>
                      <div>
                        <button className="btn outline" onClick={()=>alert('Edit UI not implemented here yet')}>Edit</button>
                        <button className="btn pill danger" style={{marginLeft:8}} onClick={()=>deactivateBanner(b.id)}>Deactivate</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      )}

      {view === 'bookings' && (
        <div>
          <h3>Bookings</h3>
          {error && <div className="error">{error}</div>}
          {bookings.map(b=>(
            <div key={b.id} className="card">
              <div>ID {b.id} — {b.status}</div>
              <div>User: {b.userId} • Tests: {b.tests.map(t=>t.name).join(', ')}</div>
              <div>
                <select value={b.status} onChange={e=>updateStatus(b.id, e.target.value)}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'tests' && (
        <div>
          <h3>Manage Tests</h3>
          <div className="form">
            <input placeholder="Name" value={newTest.name} onChange={e=>setNewTest({...newTest, name:e.target.value})} />
            <input placeholder="Category" value={newTest.category} onChange={e=>setNewTest({...newTest, category:e.target.value})} />
            <input placeholder="Price" type="number" value={newTest.price} onChange={e=>setNewTest({...newTest, price: Number(e.target.value)})} />
            <input placeholder="Description" value={newTest.description} onChange={e=>setNewTest({...newTest, description:e.target.value})} />
            <div>
              <label><input type="checkbox" checked={newTest.fasting} onChange={e=>setNewTest({...newTest, fasting:e.target.checked})} /> Fasting</label>
            </div>
            <button className="btn" onClick={createTest}>Create Test</button>
          </div>
          <div className="grid">
            {tests.map(t=>(
              <div key={t.id} className="card">
                <div>{t.name}</div>
                <div>${t.price}</div>
                <div><button className="btn danger" onClick={()=>deleteTest(t.id)}>Delete</button></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
