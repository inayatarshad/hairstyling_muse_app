'use client';

import { BrowserRouter } from 'react-router-dom';
import App from '../../src/main';

export default function RoutedApp() {
  return <BrowserRouter><App /></BrowserRouter>;
}
