import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  const canonical = 'https://bookmybloodtest.vercel.app/contact';
  const contactInfo = [
    {
      icon: '📧',
      title: 'Email',
      value: 'support@thyrolab.local',
      desc: 'For general inquiries'
    },
    {
      icon: '📞',
      title: 'Phone',
      value: '+1 555 1234',
      desc: 'Booking & support team'
    },
    {
      icon: '🕐',
      title: 'Hours',
      value: '7 Days a Week',
      desc: '8:00 AM - 10:00 PM'
    }
  ];

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

      <div style={{marginBottom:32}}>
        <h1 className="page-title">Contact Us</h1>
        <p style={{color:'#6b7280', fontSize:'16px', maxWidth:'600px', margin:0}}>Have questions? Our customer support team is here to help with booking, reports, and any other assistance you need.</p>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', marginBottom:32}}>
        {contactInfo.map((info, idx) => (
          <div key={idx} className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'40px', marginBottom:'12px'}}>{info.icon}</div>
            <h3 style={{margin:'0 0 6px 0', color:'#001d3d', fontWeight:'700'}}>{info.title}</h3>
            <div style={{fontSize:'18px', fontWeight:'700', color:'#0369a1', margin:'6px 0'}}>{info.value}</div>
            <p style={{margin:'6px 0 0 0', color:'#6b7280', fontSize:'14px'}}>{info.desc}</p>
          </div>
        ))}
      </div>

      <div style={{padding:'32px', borderRadius:'20px', background:'linear-gradient(135deg, rgba(3,105,161,0.08) 0%, rgba(6,182,212,0.04) 100%)', border:'1px solid rgba(3, 105, 161, 0.1)'}}>
        <h2 style={{margin:'0 0 24px 0', color:'#001d3d', fontWeight:'800'}}>Send us a Message</h2>
        
        <form style={{display:'flex', flexDirection:'column', gap:'16px', maxWidth:'500px'}}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input id="name" type="text" placeholder="John Doe" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" placeholder="john@example.com" />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <select id="subject">
              <option value="">Select a subject</option>
              <option value="booking">Booking Help</option>
              <option value="reports">Reports & Results</option>
              <option value="collection">Collection Inquiry</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" placeholder="Tell us how we can help..."></textarea>
          </div>

          <button className="btn" style={{width:'100%'}}>Send Message</button>
        </form>
      </div>

      <div style={{marginTop:32, padding:'24px', borderRadius:'16px', background:'#e0f2fe', border:'1px solid rgba(3, 105, 161, 0.2)'}}>
        <strong style={{color:'#0369a1', fontSize:'16px'}}>💡 Quick Tips</strong>
        <ul style={{margin:'12px 0 0 0', paddingLeft:'20px', fontSize:'14px', color:'#0369a1'}}>
          <li>Check our FAQ section for instant answers</li>
          <li>Live chat is available during business hours</li>
          <li>Average response time: within 2 hours</li>
          <li>We speak English, Hindi, and local languages</li>
        </ul>
      </div>
    </div>
  );
}
