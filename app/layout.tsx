import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ridgeline API Sandbox',
  description: 'Fictional sportsbook and casino APIs with per-service bearer keys, for testing agent access and API governance.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
