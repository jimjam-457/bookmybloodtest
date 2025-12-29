import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function HowItWorks() {
  const canonical = 'https://bookmybloodtest.vercel.app/how-it-works';
  const steps = [
    {
      icon: '🔍',
      title: 'Browse & Select',
      description: 'Explore our comprehensive list of blood tests, health packages, and screening options. Compare prices and features.'
    },
    {
      icon: '📅',
      title: 'Schedule Collection',
      description: 'Choose your preferred date and time for sample collection. Select home collection or visit our lab.'
    },
    {
      icon: '💉',
      title: 'Sample Collection',
      description: 'Our certified phlebotomists collect your sample safely and professionally at your chosen location.'
    },
    {
      icon: '🧪',
      title: 'Lab Testing',
      description: 'Your samples are processed in our NABL-accredited labs using advanced diagnostic equipment.'
    },
    {
      icon: '📊',
      title: 'Get Reports',
      description: 'Receive your digital reports securely within 24-48 hours. Access them anytime from your account.'
    },
    {
      icon: '👨‍⚕️',
      title: 'Consult Doctor',
      description: 'Share reports with your doctor or book a consultation to discuss your test results.'
    }
  ];

  return (
    <div className="container">
      <Helmet>
        <title>How It Works | Book Blood Test Online</title>
        <meta name="description" content="Simple 6-step process to book blood tests at home: select tests, schedule, collect, test, get reports, consult." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="How It Works | Book Blood Test Online" />
        <meta property="og:description" content="Simple 6-step process to book blood tests at home: select tests, schedule, collect, test, get reports, consult." />
        <meta property="og:url" content={canonical} />
      </Helmet>

      <div style={{marginBottom:40}}>
        <h1 className="page-title">How It Works</h1>
        <p style={{color:'#6b7280', fontSize:'16px', maxWidth:'600px'}}>Our simple and transparent process makes blood test booking easy and convenient. Get your health checked in just 6 steps.</p>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px'}}>
        {steps.map((step, idx) => (
          <div key={idx} className="card" style={{textAlign:'center', position:'relative'}}>
            <div style={{
              fontSize:'48px', 
              marginBottom:'12px',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              width:'64px',
              height:'64px',
              background:'linear-gradient(135deg, #e0f2fe 0%, #e1f8ff 100%)',
              borderRadius:'12px',
              margin:'0 auto 16px auto'
            }}>
              {step.icon}
            </div>
            <div style={{
              position:'absolute',
              top:'-12px',
              right:'-12px',
              width:'32px',
              height:'32px',
              background:' linear-gradient(135deg, #0369a1 0%, #06b6d4 100%)',
              borderRadius:'50%',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              color:'white',
              fontWeight:'800',
              fontSize:'16px'
            }}>
              {idx + 1}
            </div>
            <h3 style={{margin:'0 0 8px 0', color:'#0369a1', fontWeight:'700', fontSize:'18px'}}>{step.title}</h3>
            <p style={{margin:0, color:'#6b7280', fontSize:'14px', lineHeight:'1.6'}}>{step.description}</p>
          </div>
        ))}
      </div>

      <div style={{marginTop:40, padding:'32px', borderRadius:'20px', background:'linear-gradient(135deg, rgba(3,105,161,0.08) 0%, rgba(6,182,212,0.04) 100%)', border:'1px solid rgba(3, 105, 161, 0.1)'}}>
        <h2 style={{margin:'0 0 16px 0', color:'#001d3d', fontWeight:'800'}}>Why Our Process is Better</h2>
        <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'16px', marginTop:'16px'}}>
          <div>
            <strong style={{color:'#0369a1'}}>✓ No Hidden Costs</strong>
            <p style={{margin:'6px 0 0 0', color:'#6b7280', fontSize:'14px'}}>Transparent pricing with all-inclusive packages</p>
          </div>
          <div>
            <strong style={{color:'#0369a1'}}>✓ Expert Technicians</strong>
            <p style={{margin:'6px 0 0 0', color:'#6b7280', fontSize:'14px'}}>Certified and trained professionals</p>
          </div>
          <div>
            <strong style={{color:'#0369a1'}}>✓ Quick Results</strong>
            <p style={{margin:'6px 0 0 0', color:'#6b7280', fontSize:'14px'}}>Reports within 24-48 hours</p>
          </div>
          <div>
            <strong style={{color:'#0369a1'}}>✓ Privacy Guaranteed</strong>
            <p style={{margin:'6px 0 0 0', color:'#6b7280', fontSize:'14px'}}>Secure and confidential handling</p>
          </div>
        </div>
      </div>
    </div>
  );
}
