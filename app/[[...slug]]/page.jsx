'use client';

import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../src/main';

/**
 * The client router is mounted after hydration because BrowserRouter reads
 * window.location. The placeholder matches the page background so there is no
 * flash between the server shell and the app.
 */
export default function RoutedApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: '#1b060a' }} />;
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
