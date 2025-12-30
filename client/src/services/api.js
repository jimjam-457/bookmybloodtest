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
      console.log('getApiRoot: Using REACT_APP_API_URL:', `${u.protocol}//${u.host}`);
      return `${u.protocol}//${u.host}`;
    } catch {
      console.log('getApiRoot: URL parse failed, using:', process.env.REACT_APP_API_URL);
      return process.env.REACT_APP_API_URL;
    }
  }
  
  // Fall back to axios baseURL
  const url = api.defaults.baseURL || '';
  if (url.startsWith('http')) {
    try {
      const u = new URL(url);
      console.log('getApiRoot: Using axios baseURL:', `${u.protocol}//${u.host}`);
      return `${u.protocol}//${u.host}`;
    } catch {
      console.log('getApiRoot: URL parse failed, using:', url);
      return url;
    }
  }
  
  // Hardcoded fallback for Vercel production
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    const backendUrl = 'https://bookmybloodtest.onrender.com';
    console.log('getApiRoot: Vercel detected, using hardcoded backend:', backendUrl);
    return backendUrl;
  }
  
  // For relative paths, use current origin (works in dev)
  console.log('getApiRoot: Using window.location.origin:', window.location.origin);
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
