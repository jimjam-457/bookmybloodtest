import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const { items } = useBooking();
  const handleLogout = () => { logout(); nav('/'); };
  return (
    <header className="header">
      <div className="logo"><Link to="/">ThyroLab</Link></div>
      <button
        className="menu-btn btn outline small"
        aria-label="Toggle navigation"
        aria-expanded={open ? 'true' : 'false'}
        onClick={() => setOpen(o=>!o)}
      >
        Menu
      </button>
      <nav className={open ? 'open' : ''}>
        <Link to="/tests">Tests</Link>
        <button
          className="btn outline small"
          onClick={() => {
            setOpen(false);
            if (!user) {
              const next = items && items.length > 0 ? '/booking' : '/tests';
              return nav(`/login?next=${encodeURIComponent(next)}`);
            }
            if (items && items.length > 0) return nav('/booking');
            return nav('/tests');
          }}
        >
          Book
        </button>
        <Link to="/my-bookings">My Bookings</Link>
        {user && user.role === 'admin' && <Link to="/admin">Admin</Link>}
        {user ? (
          <>
            <span className="muted">Hi, {user.name}</span>
            <button onClick={handleLogout} className="btn small">Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn outline">Login</Link>
        )}
      </nav>
    </header>
  );
}
