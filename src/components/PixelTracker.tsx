import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export default function PixelTracker() {
  const [pixelId, setPixelId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Fetch pixel ID from backend
    fetch('/api/pixel')
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setPixelId(data.id);
          initPixel(data.id);
        }
      })
      .catch(err => console.error('Failed to fetch pixel ID', err));
  }, []);

  useEffect(() => {
    if (pixelId && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname, pixelId]);

  const initPixel = (id: string) => {
    if (window.fbq) return;
    
    !function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  };

  return null;
}
