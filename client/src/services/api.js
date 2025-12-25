import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export function getApiRoot() {
  const url = api.defaults.baseURL || '';
  if (url.startsWith('/')) return window.location.origin;
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return window.location.origin;
  }
}


export async function getBanners() {
  try {
    const resp = await api.get('/banners');
    if (resp && resp.data) return resp.data;
  } catch (e) {
    // ignore and fall through to mock
  }
  // Mock banners used by the Home page when backend doesn't provide banners
  return [
    { id: 1, title: 'Home Sample Collection', subtitle: 'Convenient and safe', img: '/assets/banner1.svg' },
    { id: 2, title: 'Fast Digital Reports', subtitle: 'Access reports online within 24-48 hours', img: '/assets/banner2.svg' }
  ];
}

export default api;
export async function initiatePayment(amount, note) {
  const resp = await api.post('/payments/initiate', { amount, note });
  return resp.data;
}
export async function confirmPayment({ paymentId, utr, proofUrl, bookingId }) {
  const resp = await api.post('/payments/confirm', { paymentId, utr, proofUrl, bookingId });
  return resp.data;
}
