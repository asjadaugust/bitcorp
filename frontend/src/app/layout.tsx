import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bitcorp ERP - Civil Works Equipment Management',
  description: 'Modern ERP system for civil engineering equipment management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
