import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  const canonical = 'https://bookmybloodtest.vercel.app/contact';
  return (
    <div className="container">
      <Helmet>
        <title>Contact | Diagnostic Lab Booking</title>
        <meta name="description" content="Contact our support team for booking assistance, reports, and home collection queries." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Contact | Diagnostic Lab Booking" />
        <meta property="og:description" content="Contact our support team for booking assistance, reports, and home collection queries." />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <h1 className="page-title">Contact Us</h1>
      <p>Email: support@thyrolab.local</p>
      <p>Phone: +1 555 1234</p>
      <p>We are available 7 days a week for booking and report support.</p>
    </div>
  );
}
