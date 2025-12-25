import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import Header from './components/Header';
import Footer from './components/Footer';
const Home = lazy(() => import('./pages/Home'));
const Tests = lazy(() => import('./pages/Tests'));
const TestDetails = lazy(() => import('./pages/TestDetails'));
const Booking = lazy(() => import('./pages/Booking'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  const { user } = useAuth();
  const location = useLocation();
  useEffect(() => {
    const id = process.env.REACT_APP_GA_ID;
    if (!id) return;
    if (!window.dataLayer) window.dataLayer = [];
    function gtag(){ window.dataLayer.push(arguments); }
    if (!document.getElementById('ga-script')) {
      const s = document.createElement('script');
      s.id = 'ga-script';
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(s);
      gtag('js', new Date());
      gtag('config', id);
    }
    gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title
    });
    try {
      api.post('/analytics', {
        type: 'page_view',
        path: location.pathname + location.search,
        referrer: document.referrer,
        ua: navigator.userAgent,
        ts: Date.now()
      });
    } catch {}
  }, [location]);
  return (
    <div className="app">
      <Header />
      <main className="container">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/tests/:id" element={<TestDetails />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-bookings" element={user ? <MyBookings /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user && user.role === 'admin' ? <Admin /> : <Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
