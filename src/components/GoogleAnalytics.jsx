import { useEffect } from 'react';

const GoogleAnalytics = () => {
  useEffect(() => {
    // Create script elements
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-WG0SR4GL89';

    const configScript = document.createElement('script');
    configScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-WG0SR4GL89');
    `;

    // Append scripts to document head
    document.head.appendChild(gtagScript);
    document.head.appendChild(configScript);

    // Cleanup function
    return () => {
      document.head.removeChild(gtagScript);
      document.head.removeChild(configScript);
    };
  }, []); // Empty dependency array means this runs once on mount

  return null;
};

export default GoogleAnalytics; 