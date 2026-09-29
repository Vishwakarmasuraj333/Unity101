import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Unity 101 Community Radio | Event Registration',
  description:
    'Register for Unity 101 Community Radio events. Official 20th Anniversary celebration guest registration.',
  icons: {
    icon: '/images/unity101-logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-purple-900 selection:text-amber-300">
        {children}
      </body>
    </html>
  );
}
