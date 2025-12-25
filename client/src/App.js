import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tests from './pages/Tests';
import TestDetails from './pages/TestDetails';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import Admin from './pages/Admin';
import { useAuth } from './context/AuthContext';

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
  }, [location]);
  return (
    <div className="app">
      <Header />
      <main className="container">
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
      </main>
      <Footer />
    </div>
  );
}

export default App;
