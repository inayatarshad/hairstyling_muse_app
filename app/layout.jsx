import '../src/styles.css';

export const metadata = {
  title: 'Muse — Virtual Hair Studio',
  description: 'A premium virtual hair, beard and colour consultation studio.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
