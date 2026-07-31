'use client';

import { Navigate, Route, Routes } from 'react-router-dom';

import Landing from './components/Landing';
import Studio from './components/Studio';
import { Help, Lookbook, Settings } from './components/Pages';
import { useJsClass } from './lib/hooks';

/**
 * Musè route table.
 *
 * The studio is one route on purpose. Upload, style selection, generation and
 * comparison are steps inside it rather than separate URLs, so nothing
 * interrupts the flow or loses the portrait on a navigation.
 */
export default function App() {
  useJsClass();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/studio" element={<Studio />} />
      <Route path="/lookbook" element={<Lookbook />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />

      {/* Legacy consultation URLs from the previous build */}
      <Route path="/consultation/*" element={<Navigate to="/studio" replace />} />
      <Route path="/styles/*" element={<Navigate to="/studio" replace />} />
      <Route path="/color" element={<Navigate to="/studio" replace />} />
      <Route path="/review" element={<Navigate to="/studio" replace />} />
      <Route path="/generate" element={<Navigate to="/studio" replace />} />
      <Route path="/result" element={<Navigate to="/studio" replace />} />
      <Route path="/saved" element={<Navigate to="/lookbook" replace />} />
      <Route path="/compare" element={<Navigate to="/lookbook" replace />} />
      <Route path="/clients" element={<Navigate to="/lookbook" replace />} />
      <Route path="/profile" element={<Navigate to="/settings" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
