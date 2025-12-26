import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
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
