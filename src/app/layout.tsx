import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Glance',
  description: 'A fast, local-first start page you actually want to open.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
