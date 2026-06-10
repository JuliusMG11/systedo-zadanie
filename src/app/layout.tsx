// src/app/layout.tsx
import type { Metadata } from 'next';
import { Space_Grotesk, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/nav/Navbar';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Mionelo Marketing Suite',
    template: '%s · Mionelo',
  },
  description: 'Marketingový přehled výkonu pro mionelo.cz — e-shop s ořechy, semínky a superpotravinami.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${spaceGrotesk.variable} ${hankenGrotesk.variable}`}>
      <body className="min-h-screen bg-cream text-espresso">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
