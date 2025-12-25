import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function HowItWorks() {
  const canonical = 'https://bookmybloodtest.vercel.app/how-it-works';
  return (
    <div className="container">
      <Helmet>
        <title>How It Works | Book Blood Test Online</title>
        <meta name="description" content="Book blood test online in three steps: select tests, schedule collection, get fast reports." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="How It Works | Book Blood Test Online" />
        <meta property="og:description" content="Book blood test online in three steps: select tests, schedule collection, get fast reports." />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <h1 className="page-title">How It Works</h1>
      <h2>Step 1: Select Tests</h2>
      <p>Browse blood tests and health packages. Add tests to your selection.</p>
      <h2>Step 2: Schedule Collection</h2>
      <p>Choose home sample collection or lab visit. Select preferred date and time.</p>
      <h2>Step 3: Receive Reports</h2>
      <p>Get secure digital reports within 24–48 hours from trusted labs.</p>
    </div>
  );
}
