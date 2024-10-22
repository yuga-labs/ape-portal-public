import { useEffect, useState } from 'react';

/**
 * Monitors the hash of the current URL and returns it.
 */
export const useHash = () => {
  const [hash, setHash] = useState('');

  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    // Set the initial hash value on the client
    setHash(window.location.hash);

    // Add the event listener for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return hash;
};
