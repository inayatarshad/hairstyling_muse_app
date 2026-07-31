import { DM_Sans, Fraunces, Inter, Italiana } from 'next/font/google';
import '../src/styles.css';

/* Self-hosted at build time, so there is no external font request at runtime
   and no flash of unstyled text.

   Two pairings on purpose. The landing page keeps the original Italiana and
   DM Sans, which is the voice of the brand. The studio uses Fraunces and Inter,
   which hold up at small sizes and in dense control panels where a high
   contrast display serif would fall apart. */
const landingDisplay = Italiana({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-italiana'
});

const landingSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans'
});

const appDisplay = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK'],
  variable: '--font-fraunces'
});

const appSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata = {
  title: 'Musè · Virtual Hair Studio',
  description:
    'Upload one portrait and try hairstyles, beard shapes and hair colour on your own face. Identity preserved, analysis on device.',
  applicationName: 'Musè',
  openGraph: {
    title: 'Musè · Virtual Hair Studio',
    description: 'See your next look before the cut.',
    type: 'website'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1b060a'
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${landingDisplay.variable} ${landingSans.variable} ${appDisplay.variable} ${appSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
