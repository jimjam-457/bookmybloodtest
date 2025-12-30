import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export function getApiRoot() {
  // If REACT_APP_API_URL is explicitly set (production), use it to get the backend origin
  if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.startsWith('http')) {
    try {
      const u = new URL(process.env.REACT_APP_API_URL);
      return `${u.protocol}//${u.host}`;
    } catch {
      return process.env.REACT_APP_API_URL;
    }
  }
  
  // Fall back to axios baseURL
  const url = api.defaults.baseURL || '';
  if (url.startsWith('http')) {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.host}`;
    } catch {
      return url;
    }
  }
  
  // For relative paths, use current origin (works in dev)
  return window.location.origin;
}


export async function getBanners() {
  const resp = await api.get('/banners');
  return resp.data || [];
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
