import React from 'react';
import LandingHero from '@/components/home/LandingHero';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unity 101 Community Radio | 21st Anniversary Awards & Achievement Celebrations',
  description:
    'Official invitation & guest registration portal for Unity 101 Community Radio 21st Anniversary Awards & Achievement Celebrations on Friday 15 January 2027 at Novotel Southampton.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Unity 101 Community Radio — 21st Anniversary Awards & Achievement Celebrations',
    description:
      'Official guest registration portal for the Unity 101 Community Radio 21st Anniversary Awards & Achievement Celebrations at Novotel Southampton.',
    url: 'https://unity101events.org',
    siteName: 'Unity 101 Community Radio',
    locale: 'en_GB',
    type: 'website',
  },
};

const jsonLdGala = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'Unity 101 Community Radio 21st Anniversary Awards & Achievement Celebrations',
  startDate: '2027-01-15T18:00:00+00:00',
  endDate: '2027-01-15T22:30:00+00:00',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  location: {
    '@type': 'Place',
    name: 'Novotel Southampton',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1 West Quay Road',
      addressLocality: 'Southampton',
      addressRegion: 'Hampshire',
      postalCode: 'SO15 1RA',
      addressCountry: 'GB',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: 'Unity 101 Community Radio',
    url: 'https://unity101events.org',
  },
  description:
    'Official 21st Anniversary Awards & Achievement Celebrations honoring 21 landmark years of broadcasting and community service by Unity 101 Community Radio.',
  offers: {
    '@type': 'Offer',
    url: 'https://unity101events.org/register',
    price: '0',
    priceCurrency: 'GBP',
    availability: 'https://schema.org/InStock',
    validFrom: '2026-01-01T00:00:00Z',
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGala) }}
      />
      <LandingHero />
    </>
  );
}
