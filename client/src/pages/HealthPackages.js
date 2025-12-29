import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function HealthPackages() {
  const canonical = 'https://bookmybloodtest.vercel.app/health-packages';
  const nav = useNavigate();

  const packages = [
    {
      id: 'thyroid-panel',
      icon: '🦋',
      title: 'Thyroid Panel',
      price: '$45',
      description: 'Complete thyroid health assessment',
      tests: ['TSH', 'Free T3', 'Free T4', 'TPO Antibodies'],
      best_for: 'Monitoring thyroid health and hormone levels'
    },
    {
      id: 'diabetes-screening',
      icon: '📊',
      title: 'Diabetes Screening',
      price: '$35',
      description: 'Detect and monitor diabetes risk',
      tests: ['Fasting Glucose', 'HbA1c', 'Post-Meal Glucose'],
      best_for: 'Early detection and diabetes risk assessment'
    },
    {
      id: 'cardiac-health',
      icon: '❤️',
      title: 'Cardiac Health',
      price: '$65',
      description: 'Comprehensive heart health check',
      tests: ['Lipid Profile', 'Troponin', 'BNP'],
      best_for: 'Heart disease prevention and assessment'
    },
    {
      id: 'liver-function',
      icon: '🫘',
      title: 'Liver Function',
      price: '$50',
      description: 'Complete liver health evaluation',
      tests: ['Bilirubin', 'ALT/AST', 'Albumin', 'Proteins'],
      best_for: 'Liver health and detoxification check'
    },
    {
      id: 'kidney-function',
      icon: '💧',
      title: 'Kidney Function',
      price: '$40',
      description: 'Assess kidney health and function',
      tests: ['Creatinine', 'BUN', 'Electrolytes'],
      best_for: 'Kidney function and renal health'
    },
    {
      id: 'full-body-checkup',
      icon: '✨',
      title: 'Full Body Checkup',
      price: '$120',
      description: 'Complete health assessment',
      tests: ['50+ Parameters', 'All Major Systems', 'Complete Report'],
      best_for: 'Annual health screening and wellness'
    }
  ];

  return (
    <div className="container">
      <Helmet>
        <title>Health Packages | Book Blood Test Online</title>
        <meta name="description" content="Comprehensive health packages for screening, prevention, and diagnostics. Book your health check today." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Health Packages | Book Blood Test Online" />
        <meta property="og:description" content="Comprehensive health packages for screening, prevention, and diagnostics." />
        <meta property="og:url" content={canonical} />
      </Helmet>

      <div style={{marginBottom:32}}>
        <h1 className="page-title">Health Packages</h1>
        <p style={{color:'#6b7280', fontSize:'16px', maxWidth:'600px', margin:0}}>Choose from our scientifically designed health packages tailored for prevention and early detection.</p>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))'}}>
        {packages.map(pkg => (
          <div key={pkg.id} className="card" style={{display:'flex', flexDirection:'column'}}>
            <div style={{fontSize:'40px', marginBottom:'12px'}}>{pkg.icon}</div>
            <h3 style={{margin:'0 0 8px 0', color:'#0369a1', fontWeight:'700', fontSize:'18px'}}>{pkg.title}</h3>
            <p style={{margin:'0 0 12px 0', color:'#6b7280', fontSize:'14px'}}>{pkg.description}</p>
            
            <div style={{
              margin:'12px 0',
              padding:'12px',
              background:'rgba(3, 105, 161, 0.05)',
              borderRadius:'10px',
              textAlign:'center'
            }}>
              <div style={{fontSize:'24px', fontWeight:'800', color:'#0369a1'}}>{pkg.price}</div>
              <div style={{fontSize:'12px', color:'#6b7280', marginTop:'4px'}}>Inclusive all tests</div>
            </div>

            <div style={{marginBottom:'12px', flex:1}}>
              <strong style={{fontSize:'13px', color:'#001d3d', display:'block', marginBottom:'8px'}}>Includes:</strong>
              <ul style={{margin:0, paddingLeft:'20px', fontSize:'13px', color:'#6b7280', lineHeight:'1.6'}}>
                {pkg.tests.map((test, idx) => (
                  <li key={idx}>{test}</li>
                ))}
              </ul>
            </div>

            <div style={{
              padding:'10px 12px',
              background:'#f0f9ff',
              borderRadius:'8px',
              marginBottom:'12px',
              fontSize:'12px',
              color:'#0369a1',
              textAlign:'center'
            }}>
              <strong>Best for:</strong> {pkg.best_for}
            </div>

            <button 
              className="btn"
              onClick={() => nav(`/blood-tests?category=${pkg.id}`)}
              style={{width:'100%', marginTop:'auto'}}
            >
              View Tests
            </button>
          </div>
        ))}
      </div>

      <div style={{marginTop:40, padding:'32px', borderRadius:'20px', background:'linear-gradient(135deg, rgba(3,105,161,0.08) 0%, rgba(6,182,212,0.04) 100%)', border:'1px solid rgba(3, 105, 161, 0.1)', textAlign:'center'}}>
        <h2 style={{margin:'0 0 16px 0', color:'#001d3d', fontWeight:'800'}}>Questions About Our Packages?</h2>
        <p style={{color:'#6b7280', margin:'0 0 16px 0'}}>Our health advisors are ready to help you choose the right package for your needs.</p>
        <button className="btn" onClick={() => nav('/contact')}>Contact Us</button>
      </div>
    </div>
  );
}
