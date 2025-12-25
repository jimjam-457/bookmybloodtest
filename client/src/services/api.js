import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
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
