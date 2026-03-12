import { useState, useEffect } from 'react';

export default function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const checkConnectivity = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      try {
        await fetch('https://www.google.com/favicon.ico?_=' + Date.now(), {
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (isMounted) setIsOnline(true);
      } catch {
        clearTimeout(timeout);
        if (isMounted) setIsOnline(false);
      }
    };

    const handleOnline = () => checkConnectivity();
    const handleOffline = () => setIsOnline(false);
    const handleFocus = () => checkConnectivity();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleFocus);

    checkConnectivity();
    intervalId = setInterval(checkConnectivity, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return isOnline;
}