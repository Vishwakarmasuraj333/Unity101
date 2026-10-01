import React from 'react';
import Image from 'next/image';
import RegistrationForm from '@/components/registration/RegistrationForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guest Registration | Unity 101 21st Anniversary Awards & Celebrations',
  description:
    'Official guest registration for Unity 101 Community Radio 21st Anniversary Awards & Achievement Celebrations on Friday 15 January 2027 at Novotel Southampton.',
  alternates: {
    canonical: '/register',
  },
  openGraph: {
    title: 'Guest Registration | Unity 101 21st Anniversary Awards & Achievement Celebrations',
    description:
      'Official guest registration for Unity 101 Community Radio 21st Anniversary Awards & Achievement Celebrations at Novotel Southampton.',
    url: '/register',
    type: 'website',
  },
};

const jsonLdEvent = {
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
    'Unity 101 21st Anniversary Awards & Achievement Celebrations celebrating 21 landmark years of community radio service, broadcasting, and awards.',
  offers: {
    '@type': 'Offer',
    url: 'https://unity101events.org/register',
    price: '0',
    priceCurrency: 'GBP',
    availability: 'https://schema.org/InStock',
    validFrom: '2026-01-01T00:00:00Z',
  },
};

export default function RegisterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEvent) }}
      />
      <main className="min-h-screen bg-[#f7f5fa] relative flex flex-col justify-start items-center">
        {/* Top Royal Purple Brand Banner with Clearly Visible Golden Flowers (Mandalas) */}
        <div className="w-full h-56 sm:h-64 bg-gradient-to-b from-[#2a0640] via-[#3e085c] to-[#481268] relative overflow-hidden flex items-start justify-center shadow-lg">
          {/* Left Golden Flower (Mandala) Watermark - Mast & Visible */}
          <div className="absolute -left-10 sm:-left-12 -top-10 sm:-top-12 w-64 sm:w-80 h-64 sm:h-80 opacity-90 select-none pointer-events-none filter drop-shadow-[0_0_25px_rgba(245,196,81,0.6)]">
            <Image
              src="/images/mandala-pattern.svg"
              alt=""
              width={320}
              height={320}
              className="w-full h-full"
              priority
            />
          </div>

          {/* Right Golden Flower (Mandala) Watermark - Mast & Visible */}
          <div className="absolute -right-10 sm:-right-12 -top-10 sm:-top-12 w-64 sm:w-80 h-64 sm:h-80 opacity-90 select-none pointer-events-none filter drop-shadow-[0_0_25px_rgba(245,196,81,0.6)]">
            <Image
              src="/images/mandala-pattern.svg"
              alt=""
              width={320}
              height={320}
              className="w-full h-full rotate-90"
              priority
            />
          </div>

          {/* Center subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-black/30 pointer-events-none" />
        </div>

        {/* Main Registration Form Container with Negative Top Margin for Layered Look */}
        <div className="w-full -mt-40 sm:-mt-48 z-10 mb-12">
          <RegistrationForm />
        </div>
      </main>
    </>
  );
}
