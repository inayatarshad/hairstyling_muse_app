'use client';

import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../src/main';

export default function RoutedApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: '#f8f4ee' }} />;
  }

  return <BrowserRouter><App /></BrowserRouter>;
}
