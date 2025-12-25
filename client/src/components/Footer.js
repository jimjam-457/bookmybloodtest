import React from 'react';
import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="footer">
      <div>Contact: support@thyrolab.local | +1 555 1234</div>
      <div className="footer-links">
        <Link to="/blood-tests">Blood Tests</Link>
        <span> · </span>
        <Link to="/health-packages">Health Packages</Link>
        <span> · </span>
        <Link to="/how-it-works">How It Works</Link>
        <span> · </span>
        <Link to="/contact">Contact</Link>
      </div>
      <div>© {new Date().getFullYear()} ThyroLab</div>
    </footer>
  );
}
