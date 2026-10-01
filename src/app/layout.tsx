import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#481268',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://unity101.vercel.app'),
  title: {
    default: 'Unity 101 Community Radio | 21st Anniversary Awards & Achievement Celebrations',
    template: '%s | Unity 101 Community Radio',
  },
  description:
    'Official invitation and registration portal for Unity 101 Community Radio 21st Anniversary Awards & Achievement Celebrations. Friday 15 January 2027 at Novotel Southampton.',
  keywords: [
    'Unity 101',
    'Community Radio',
    'Southampton Radio',
    'Event Registration',
    'Gala Dinner',
    '21st Anniversary',
    'Awards & Achievement Celebrations',
    'Novotel Southampton',
    'Southampton Events',
  ],
  authors: [{ name: 'Unity 101 Community Radio', url: 'https://unity101.org' }],
  creator: 'Unity 101 Community Radio',
  publisher: 'Unity 101 Community Radio',
  icons: {
    icon: '/images/unity101-21st-anniversary-logo-transparent.png',
    shortcut: '/images/unity101-21st-anniversary-logo-transparent.png',
    apple: '/images/unity101-21st-anniversary-logo-transparent.png',
  },
  openGraph: {
    title: 'Unity 101 Community Radio - 21st Anniversary Awards & Achievement Celebrations',
    description:
      'Join civic leaders, broadcast legends, and valued community partners at Novotel Southampton for an unforgettable evening honoring 21 landmark years of broadcasting excellence.',
    url: 'https://unity101.vercel.app',
    siteName: 'Unity 101 Community Radio',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: '/images/unity101-21st-anniversary-logo-transparent.png',
        width: 800,
        height: 533,
        alt: 'Unity 101 Community Radio 21st Anniversary Awards & Achievement Celebrations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unity 101 Community Radio - 21st Anniversary Celebrations',
    description:
      'Official guest registration for Unity 101 Community Radio 21st Anniversary Awards at Novotel Southampton.',
    images: ['/images/unity101-21st-anniversary-logo-transparent.png'],
  },
  alternates: {
    canonical: 'https://unity101.vercel.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@type': 'RadioStation',
  name: 'Unity 101 Community Radio',
  url: 'https://unity101.org',
  logo: 'https://unity101.org/images/unity101-logo.svg',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Southampton',
    addressRegion: 'Hampshire',
    addressCountry: 'GB',
  },
  sameAs: [
    'https://www.facebook.com/unity101/',
    'https://twitter.com/unity101',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-purple-900 selection:text-amber-300">
        {children}
      </body>
    </html>
  );
}
