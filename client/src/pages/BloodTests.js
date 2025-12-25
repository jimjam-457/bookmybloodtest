import React from 'react';
import { Helmet } from 'react-helmet-async';
import Tests from './Tests';

export default function BloodTests() {
  const canonical = 'https://bookmybloodtest.vercel.app/blood-tests';
  return (
    <div>
      <Helmet>
        <title>Blood Tests | Book Blood Test Online</title>
        <meta name="description" content="Browse and book blood tests online. Home sample collection and fast reports." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Blood Tests | Book Blood Test Online" />
        <meta property="og:description" content="Browse and book blood tests online. Home sample collection and fast reports." />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <h1 className="page-title">Blood Tests</h1>
      <Tests />
    </div>
  );
}
