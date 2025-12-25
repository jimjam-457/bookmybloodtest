import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import './index.css';
import { getCLS, getFID, getLCP, getTTFB, getFCP } from 'web-vitals';
const GA_ID = process.env.REACT_APP_GA_ID;
const sendToAnalytics = (metric) => {
  if (!GA_ID) return;
  if (!window.dataLayer) return;
  window.dataLayer.push({
    event: 'web_vitals',
    metric_name: metric.name,
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta
  });
};
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
getFCP(sendToAnalytics);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <App />
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
