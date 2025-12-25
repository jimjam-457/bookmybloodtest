import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function HealthPackages() {
  const canonical = 'https://bookmybloodtest.vercel.app/health-packages';
  return (
    <div className="container">
      <Helmet>
        <title>Health Packages | Diagnostic Lab Booking</title>
        <meta name="description" content="Discover health packages for comprehensive screening. Book blood test at home or lab." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Health Packages | Diagnostic Lab Booking" />
        <meta property="og:description" content="Discover health packages for comprehensive screening. Book blood test at home or lab." />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <h1 className="page-title">Health Packages</h1>
      <h2>Popular Packages</h2>
      <p>Choose from comprehensive health packages tailored for preventive care and diagnostics.</p>
      <h3>Thyroid Panel</h3>
      <p>Ideal for monitoring thyroid health and hormone levels.</p>
      <h3>Diabetes Screening</h3>
      <p>Includes fasting glucose and related markers for diabetes detection.</p>
    </div>
  );
}
