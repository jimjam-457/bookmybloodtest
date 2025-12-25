import React from 'react';
export default function Footer() {
  return (
    <footer className="footer">
      <div>Contact: support@thyrolab.local | +1 555 1234</div>
      <div>© {new Date().getFullYear()} ThyroLab</div>
    </footer>
  );
}
