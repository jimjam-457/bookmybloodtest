import React, { useEffect, useState, useCallback } from 'react';
import api, { getApiRoot } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Admin() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [tests, setTests] = useState([]);
  const [newTest, setNewTest] = useState({ name:'', description:'', price:0, fasting:false, sample:'Blood', category:'' });
  const [view, setView] = useState('bookings'); // 'bookings' | 'tests' | 'banners'
  const [banners, setBanners] = useState([]);
  const [bannerForm, setBannerForm] = useState({ title:'', subtitle:'', imageUrl:'', testId:'', packageSlug:'', isActive:true });
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [openBookingId, setOpenBookingId] = useState(null);
  const [filters, setFilters] = useState({ status:'', collectionType:'', city:'', pincode:'', from:'', to:'' });
  const [stats, setStats] = useState({ statusCounts:{}, byDay:[], byWeek:[], slaBuckets:{} });
  const [bookingDetails, setBookingDetails] = useState({});
  const [bookingNotes, setBookingNotes] = useState({});
  const [newNote, setNewNote] = useState('');
  const [editingTestId, setEditingTestId] = useState(null);
  const [searchTests, setSearchTests] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const toCsv = (rows) => {
    const headers = ['id','status','created_at','patient_name','phone','email','city','pincode','collection_type','datetime','total','payment_method','payment_status','user_id'];
    const escape = (v) => {
      const s = v === null || v === undefined ? '' : String(v);
      const needsQuote = /[",\n]/.test(s);
      if (needsQuote) return `"${s.replace(/"/g,'""')}"`;
      return s;
    };
    const lines = [headers.join(',')];
    for (const r of rows) {
      const line = [
        r.id, r.status, r.created_at, r.patient_name, r.phone, r.email, r.city, r.pincode,
        r.collection_type, r.datetime, r.total, r.payment_method, r.payment_status, (r.user_id ?? r.userId ?? '')
      ].map(escape).join(',');
      lines.push(line);
    }
    return lines.join('\n');
  };
  const exportCsv = () => {
    const csv = toCsv(bookings || []);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g,'-');
    a.href = url;
    a.download = `bookings-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchAll = useCallback(async () => {
    if (!user || user.role !== 'admin') {
      setError('Admin access required. Please login as admin.');
      return;
    }
    setLoadingBookings(true);
    setLoadingTests(true);
    try {
      const [bR, tR] = await Promise.all([
        api.get('/bookings', { params: {
          status: filters.status || undefined,
          collectionType: filters.collectionType || undefined,
          city: filters.city || undefined,
          pincode: filters.pincode || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined
        }}),
        api.get('/tests')
      ]);
      setBookings(bR.data); setTests(tR.data);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load admin data.');
    } finally {
      setLoadingBookings(false);
      setLoadingTests(false);
    }
  }, [user, filters]);

  useEffect(()=> { fetchAll(); fetchBanners(); fetchStats(); }, [fetchAll]);
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setBookings(prev=>prev.map(b=>b.id===id?{...b,status}:b));
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update status');
    }
  };
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const r = await api.get('/bookings/stats');
      setStats(r.data || { statusCounts:{}, byDay:[], byWeek:[], slaBuckets:{} });
    } catch {
      setStats({ statusCounts:{}, byDay:[], byWeek:[], slaBuckets:{} });
    } finally {
      setLoadingStats(false);
    }
  };
  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const r = await api.get('/banners');
      setBanners(r.data);
    } catch (e) {
      setBanners([]);
    } finally {
      setLoadingBanners(false);
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

  const createBanner = async () => {
    if (!bannerForm.title) {
      setError('Title is required');
      return;
    }
    if (!bannerForm.imageUrl) {
      setError('Please upload an image');
      return;
    }
    try {
      console.log('Creating banner with data:', { ...bannerForm, testId: bannerForm.testId || null, packageSlug: bannerForm.packageSlug || null });
      const resp = await api.post('/banners', { 
        title: bannerForm.title,
        subtitle: bannerForm.subtitle || '',
        imageUrl: bannerForm.imageUrl,
        testId: bannerForm.testId || null,
        packageSlug: bannerForm.packageSlug || null,
        isActive: true
      });
      console.log('Banner created response:', resp.data);
      setBannerForm({ title:'', subtitle:'', imageUrl:'', testId:'', packageSlug:'', isActive:true });
      setEditingBannerId(null);
      setError(null);
      fetchBanners();
    } catch(e) { 
      console.error('Banner creation error:', e.response?.data);
      setError('Failed to create banner: ' + (e.response?.data?.message || e.message)); 
    }
  };
  const startEditBanner = (b) => {
    // Handle both camelCase and lowercase field names from database
    setEditingBannerId(b.id);
    setBannerForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || b.imageurl || '',
      testId: b.testId || b.testid || '',
      packageSlug: b.packageSlug || b.packageslug || '',
      isActive: b.isActive !== undefined ? b.isActive : (b.active !== undefined ? b.active : true)
    });
  };
  const saveBanner = async () => {
    if (!editingBannerId) return createBanner();
    if (!bannerForm.title) {
      setError('Title is required');
      return;
    }
    try {
      const resp = await api.put(`/banners/${editingBannerId}`, { 
        title: bannerForm.title,
        subtitle: bannerForm.subtitle || '',
        imageUrl: bannerForm.imageUrl,
        testId: bannerForm.testId || null,
        packageSlug: bannerForm.packageSlug || null,
        active: bannerForm.isActive
      });
      console.log('Banner updated response:', resp.data);
      setBannerForm({ title:'', subtitle:'', imageUrl:'', testId:'', packageSlug:'', isActive:true });
      setEditingBannerId(null);
      setError(null);
      fetchBanners();
    } catch(e) {
      console.error('Banner update error:', e.response?.data);
      setError('Failed to update banner: ' + (e.response?.data?.message || e.message));
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
      // Get the relative path from response (e.g., /uploads/filename.jpg)
      const relativePath = resp.data.imageUrl;
      // Build full URL using the actual backend origin
      const backendRoot = getApiRoot();
      const imageUrl = backendRoot + relativePath;
      console.log('Image uploaded. Relative:', relativePath, 'Backend:', backendRoot, 'Full URL:', imageUrl);
      setBannerForm({ ...bannerForm, imageUrl });
      setError(null);
    } catch (e) {
      console.error('Upload error:', e);
      setError('Image upload failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchBookingDetails = async (bookingId) => {
    try {
      const r = await api.get(`/bookings/${bookingId}`);
      setBookingDetails(prev => ({ ...prev, [bookingId]: r.data }));
    } catch (e) {
      console.error('Failed to fetch booking details:', e);
    }
  };

  const fetchBookingNotes = async (bookingId) => {
    try {
      const r = await api.get(`/bookings/${bookingId}/notes`);
      setBookingNotes(prev => ({ ...prev, [bookingId]: r.data || [] }));
    } catch (e) {
      console.error('Failed to fetch notes:', e);
    }
  };

  const addBookingNote = async (bookingId) => {
    if (!newNote.trim()) return;
    try {
      const r = await api.post(`/bookings/${bookingId}/notes`, { note: newNote });
      setBookingNotes(prev => ({
        ...prev,
        [bookingId]: [r.data, ...(prev[bookingId] || [])]
      }));
      setNewNote('');
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add note');
    }
  };

  const editTest = async () => {
    if (!editingTestId) return createTest();
    if (!newTest.name) { setError('Test name required'); return; }
    try {
      await api.put(`/tests/${editingTestId}`, newTest);
      setNewTest({ name:'', description:'', price:0, fasting:false, sample:'Blood', category:'' });
      setEditingTestId(null);
      fetchAll();
      setError(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update test');
    }
  };

  const startEditTest = (t) => {
    setEditingTestId(t.id);
    setNewTest({
      name: t.name || '',
      description: t.description || '',
      price: t.price || 0,
      fasting: t.fasting || false,
      sample: t.sample || 'Blood',
      category: t.category || ''
    });
  };

  const cancelEditTest = () => {
    setEditingTestId(null);
    setNewTest({ name:'', description:'', price:0, fasting:false, sample:'Blood', category:'' });
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
          {loadingBanners && <LoadingSpinner message="Loading banners..." />}
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
                  <img src={bannerForm.imageUrl} alt="preview" style={{maxWidth:'100%', maxHeight:120, borderRadius:4}} onError={(e) => console.error('Preview error:', bannerForm.imageUrl, e)} />
                  <div className="muted small" style={{marginTop:4}}>URL: {bannerForm.imageUrl}</div>
                </div>
              )}

              <input placeholder="Test ID (optional)" value={bannerForm.testId} onChange={e=>setBannerForm({...bannerForm, testId:e.target.value})} />
              <input placeholder="Package Slug (optional)" value={bannerForm.packageSlug} onChange={e=>setBannerForm({...bannerForm, packageSlug:e.target.value})} />
              <label><input type="checkbox" checked={bannerForm.isActive} onChange={e=>setBannerForm({...bannerForm, isActive:e.target.checked})} /> Active</label>
              <div style={{marginTop:8}}>
                <button className="btn" onClick={saveBanner}>{editingBannerId ? 'Save Changes' : 'Add Banner'}</button>
                {editingBannerId && <button className="btn outline" style={{marginLeft:8}} onClick={()=>{ setEditingBannerId(null); setBannerForm({ title:'', subtitle:'', imageUrl:'', testId:'', packageSlug:'', isActive:true }); }}>Cancel</button>}
              </div>
            </div>
          </div>

          <div style={{marginTop:12}}>
            {banners.length === 0 ? <div className="muted">No banners yet.</div> :
              <div className="grid">
                {banners.map(b => {
                  // Handle both camelCase and lowercase field names from database
                  const imageUrl = b.imageUrl || b.imageurl || '';
                  const testId = b.testId || b.testid || '';
                  const packageSlug = b.packageSlug || b.packageslug || '';
                  
                  return (
                    <div key={b.id} className="card">
                      <div style={{marginBottom:8}}>
                        {imageUrl && <img src={imageUrl} alt={b.title} style={{maxWidth:'100%', maxHeight:100, borderRadius:4}} onError={(e) => console.error('Banner image error:', imageUrl, e)} />}
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <div style={{flex:1}}>
                          <strong>{b.title}</strong>
                          <div className="muted small">{b.subtitle}</div>
                          <div className="muted small">Link: {testId ? `Test ${testId}` : (packageSlug || '—')}</div>
                          <div className="muted small" style={{fontSize:'11px', marginTop:4, wordBreak:'break-all'}}>Image: {imageUrl || '—'}</div>
                        </div>
                        <div style={{whiteSpace:'nowrap', marginLeft:8}}>
                          <button className="btn outline" onClick={()=>startEditBanner(b)}>Edit</button>
                          <button className="btn pill danger" style={{marginLeft:8}} onClick={()=>deactivateBanner(b.id)}>Deactivate</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          </div>
        </div>
      )}

      {view === 'bookings' && (
        <div>
          <h3>Bookings</h3>
          {error && <div className="error">{error}</div>}
          {loadingStats && <LoadingSpinner message="Loading stats..." />}
          <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12, marginBottom:12}}>
            <div className="card">
              <div><strong>Total (7d)</strong></div>
              <div className="muted small">Daily counts</div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
                {(stats.byDay||[]).map(d => (
                  <div key={String(d.date)} className="pill">{new Date(d.date).toLocaleDateString()} • {d.count}</div>
                ))}
              </div>
            </div>
            <div className="card">
              <div><strong>Status</strong></div>
              <div className="muted small">Current counts</div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
                {['Pending','In Progress','Completed','Cancelled'].map(s=>(
                  <div key={s} className="pill">{s}: {stats.statusCounts?.[s] || 0}</div>
                ))}
              </div>
            </div>
            <div className="card">
              <div><strong>SLA (open)</strong></div>
              <div className="muted small">Time since creation</div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
                <div className="pill">{'<24h'}: {stats.slaBuckets?.lt24h || 0}</div>
                <div className="pill">{'24–48h'}: {stats.slaBuckets?.['24to48h'] || 0}</div>
                <div className="pill">{'>48h'}: {stats.slaBuckets?.gt48h || 0}</div>
              </div>
            </div>
            <div className="card">
              <div><strong>Weekly</strong></div>
              <div className="muted small">Last 4 weeks</div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
                {(stats.byWeek||[]).map(w => (
                  <div key={String(w.week)} className="pill">
                    {new Date(w.week).toLocaleDateString()} • {w.count}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card" style={{marginBottom:12}}>
            <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, alignItems:'end'}}>
              <div className="form-group">
                <label className="small muted">Status</label>
                <select value={filters.status} onChange={e=>setFilters(f=>({ ...f, status: e.target.value }))}>
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label className="small muted">Collection Type</label>
                <select value={filters.collectionType} onChange={e=>setFilters(f=>({ ...f, collectionType: e.target.value }))}>
                  <option value="">All</option>
                  <option value="Home Collection">Home Collection</option>
                  <option value="Lab Visit">Lab Visit</option>
                </select>
              </div>
              <div className="form-group">
                <label className="small muted">City</label>
                <input value={filters.city} onChange={e=>setFilters(f=>({ ...f, city: e.target.value }))} placeholder="City" />
              </div>
              <div className="form-group">
                <label className="small muted">Pincode</label>
                <input value={filters.pincode} onChange={e=>setFilters(f=>({ ...f, pincode: e.target.value }))} placeholder="Pincode" />
              </div>
              <div className="form-group">
                <label className="small muted">From</label>
                <input type="date" value={filters.from} onChange={e=>setFilters(f=>({ ...f, from: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="small muted">To</label>
                <input type="date" value={filters.to} onChange={e=>setFilters(f=>({ ...f, to: e.target.value }))} />
              </div>
            </div>
            <div className="filters-actions" style={{marginTop:8}}>
              <button className="btn" onClick={fetchAll}>Apply</button>
              <button className="btn outline" style={{marginLeft:8}} onClick={()=>setFilters({ status:'', collectionType:'', city:'', pincode:'', from:'', to:'' })}>Reset</button>
              <button className="btn outline" style={{marginLeft:8}} onClick={exportCsv}>Export CSV</button>
            </div>
          </div>
          {loadingBookings && <LoadingSpinner message="Loading bookings..." />}
          {(bookings||[]).map(b=>(
            <div key={b.id} className="card" style={{cursor:'pointer'}} onClick={()=>{
              setOpenBookingId(openBookingId===b.id?null:b.id);
              if (openBookingId !== b.id) {
                fetchBookingDetails(b.id);
                fetchBookingNotes(b.id);
              }
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                <div><strong>ID {b.id}</strong> — {b.status}</div>
                <div className="muted small">
                  {(() => {
                    const created = b.created_at ? new Date(b.created_at) : null;
                    if (!created) return null;
                    const ms = Date.now() - created.getTime();
                    const h = Math.floor(ms/3600000);
                    const badge = h < 24 ? '<24h' : h < 48 ? '24–48h' : '>48h';
                    return <span className="pill">{badge}</span>;
                  })()}
                </div>
              </div>
              <div>User: {b.user_id || b.userId || '—'} • Total: ₹{Number(b.total||0).toFixed(0)}</div>
              {openBookingId===b.id && (
                <div style={{marginTop:10}}>
                  <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12}}>
                    <div className="card" style={{padding:12}}>
                      <div><strong>Patient:</strong></div>
                      <div>Name: {b.patient_name || '—'}</div>
                      <div>Age: {b.age ?? '—'} • Gender: {b.gender || '—'}</div>
                      <div>Phone: {b.phone || '—'}</div>
                      <div>Email: {b.email || '—'}</div>
                    </div>
                    <div className="card" style={{padding:12}}>
                      <div><strong>Address:</strong></div>
                      <div>{b.address_line1 || '—'}</div>
                      <div>{b.address_line2 || ''}</div>
                      <div>Landmark: {b.landmark || '—'}</div>
                      <div>City: {b.city || '—'} • State: {b.state || '—'}</div>
                      <div>Pincode: {b.pincode || '—'} • Country: {b.country || '—'}</div>
                    </div>
                    <div className="card" style={{padding:12}}>
                      <div><strong>Collection:</strong></div>
                      <div>Type: {b.collection_type || '—'}</div>
                      <div>Datetime: {b.datetime || '—'}</div>
                      <div><strong>Payment:</strong> {b.payment_method || 'COD'} • {b.payment_status || 'PENDING'}</div>
                    </div>
                  </div>

                  {bookingDetails[b.id]?.items && bookingDetails[b.id].items.length > 0 && (
                    <div className="card" style={{marginTop:12, padding:12}}>
                      <div><strong>Tests Included:</strong></div>
                      <div style={{marginTop:8}}>
                        {bookingDetails[b.id].items.map((item, idx) => (
                          <div key={idx} style={{padding:8, background:'#f3f4f6', borderRadius:4, marginBottom:8}}>
                            <div><strong>{item.name || 'Test #' + item.id}</strong></div>
                            <div className="muted small">Sample: {item.sample} • Fasting: {item.fasting ? 'Yes' : 'No'} • Price: ${Number(item.price||0).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="card" style={{marginTop:12, padding:12}}>
                    <div><strong>Notes:</strong></div>
                    <div style={{marginTop:8}}>
                      {(bookingNotes[b.id] || []).length === 0 ? (
                        <div className="muted small">No notes yet</div>
                      ) : (
                        bookingNotes[b.id].map((note, idx) => (
                          <div key={idx} style={{padding:8, background:'#fef3c7', borderRadius:4, marginBottom:8}}>
                            <div className="muted small">{note.admin_name || 'Admin'} • {new Date(note.created_at).toLocaleString()}</div>
                            <div style={{marginTop:4}}>{note.note}</div>
                          </div>
                        ))
                      )}
                    </div>
                    <div style={{marginTop:8, display:'flex', gap:8}}>
                      <input 
                        placeholder="Add a note..." 
                        value={newNote} 
                        onChange={e=>setNewNote(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addBookingNote(b.id)}
                        style={{flex:1}}
                      />
                      <button className="btn" onClick={()=>addBookingNote(b.id)}>Add</button>
                    </div>
                  </div>
                </div>
              )}
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
          {error && <div className="error" style={{marginBottom:12, padding:8, background:'#fee2e2', color:'#991b1b', borderRadius:4}}>{error}</div>}
          {loadingTests && <LoadingSpinner message="Loading tests..." />}
          <div className="card" style={{marginBottom:12}}>
            <div className="form">
              <div style={{marginBottom:8}}>
                <strong>{editingTestId ? 'Edit Test' : 'Create New Test'}</strong>
              </div>
              <input placeholder="Name" value={newTest.name} onChange={e=>setNewTest({...newTest, name:e.target.value})} />
              <input placeholder="Category" value={newTest.category} onChange={e=>setNewTest({...newTest, category:e.target.value})} />
              <input placeholder="Price" type="number" step="0.01" value={newTest.price} onChange={e=>setNewTest({...newTest, price: Number(e.target.value)})} />
              <input placeholder="Description" value={newTest.description} onChange={e=>setNewTest({...newTest, description:e.target.value})} />
              <select value={newTest.sample} onChange={e=>setNewTest({...newTest, sample:e.target.value})}>
                <option value="Blood">Blood</option>
                <option value="Urine">Urine</option>
                <option value="Saliva">Saliva</option>
                <option value="Other">Other</option>
              </select>
              <div>
                <label><input type="checkbox" checked={newTest.fasting} onChange={e=>setNewTest({...newTest, fasting:e.target.checked})} /> Fasting Required</label>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button className="btn" onClick={editingTestId ? editTest : createTest}>
                  {editingTestId ? 'Update Test' : 'Create Test'}
                </button>
                {editingTestId && <button className="btn outline" onClick={cancelEditTest}>Cancel</button>}
              </div>
            </div>
          </div>

          <div className="card" style={{marginBottom:12}}>
            <input 
              placeholder="Search tests..." 
              value={searchTests} 
              onChange={e=>setSearchTests(e.target.value)}
              style={{width:'100%'}}
            />
          </div>

          <div className="grid">
            {tests.filter(t => !searchTests || t.name.toLowerCase().includes(searchTests.toLowerCase()) || t.category.toLowerCase().includes(searchTests.toLowerCase())).map(t=>(
              <div key={t.id} className="card">
                <div><strong>{t.name}</strong></div>
                <div className="muted small">Category: {t.category}</div>
                <div className="muted small">Sample: {t.sample || 'Blood'} • Fasting: {t.fasting ? 'Yes' : 'No'}</div>
                <div style={{marginTop:8}}><strong>${Number(t.price||0).toFixed(2)}</strong></div>
                <div style={{marginTop:8, display:'flex', gap:8}}>
                  <button className="btn" onClick={()=>startEditTest(t)}>Edit</button>
                  <button className="btn danger" onClick={()=>deleteTest(t.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
