import { useEffect } from 'react';

const GoogleAnalytics = () => {
  useEffect(() => {
    try {
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

      // Add load event listener to verify script loading
      gtagScript.addEventListener('load', () => {
        console.log('GA script loaded successfully');
      });

      gtagScript.addEventListener('error', (error) => {
        console.error('Error loading GA script:', error);
      });

      // Append scripts to document head
      document.head.appendChild(gtagScript);
      document.head.appendChild(configScript);

      // Cleanup function
      return () => {
        document.head.removeChild(gtagScript);
        document.head.removeChild(configScript);
      };
    } catch (error) {
      console.error('Error initializing GA:', error);
    }
  }, []);

  return null;
};

export default GoogleAnalytics; 