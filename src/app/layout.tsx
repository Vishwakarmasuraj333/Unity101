import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#481268',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://unity101.org'),
  title: {
    default: 'Unity 101 Community Radio | Official Event Registration',
    template: '%s | Unity 101 Community Radio',
  },
  description:
    'Register for Unity 101 Community Radio 20th Anniversary Gala Celebration. Confirm your guest attendance, food preferences, and receive your digital entry confirmation.',
  keywords: [
    'Unity 101',
    'Community Radio',
    'Southampton Radio',
    'Event Registration',
    'Gala Dinner',
    '20th Anniversary',
    'Southampton Events',
  ],
  authors: [{ name: 'Unity 101 Community Radio', url: 'https://unity101.org' }],
  creator: 'Unity 101 Community Radio',
  publisher: 'Unity 101 Community Radio',
  icons: {
    icon: '/images/unity101-logo.svg',
    shortcut: '/images/unity101-logo.svg',
    apple: '/images/unity101-logo.svg',
  },
  openGraph: {
    title: 'Unity 101 Community Radio - 20th Anniversary Event Registration',
    description:
      'Join us in celebrating 20 years of broadcasting excellence. Register your attendance and select catering options.',
    url: 'https://unity101.org/register',
    siteName: 'Unity 101 Community Radio',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unity 101 Community Radio - Event Registration',
    description: 'Official guest registration for Unity 101 Community Radio 20th Anniversary Gala.',
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
