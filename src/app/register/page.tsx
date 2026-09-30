import React from 'react';
import Image from 'next/image';
import RegistrationForm from '@/components/registration/RegistrationForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guest Registration | 20th Anniversary Gala Celebration',
  description:
    'Join Unity 101 Community Radio for our landmark 20th Anniversary Community Gala. Fill in your guest details and confirm meal preferences (Vegetarian or Non-Vegetarian).',
  alternates: {
    canonical: '/register',
  },
  openGraph: {
    title: 'Guest Registration | Unity 101 Community Radio 20th Anniversary Gala',
    description:
      'Official guest registration for Unity 101 Community Radio 20th Anniversary Gala Dinner. Secure your place now.',
    url: '/register',
    type: 'website',
  },
};

const jsonLdEvent = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'Unity 101 Community Radio 20th Anniversary Community Gala',
  startDate: '2026-11-20T18:00:00+00:00',
  endDate: '2026-11-20T23:00:00+00:00',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  location: {
    '@type': 'Place',
    name: 'Southampton Community Venue',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Southampton',
      addressRegion: 'Hampshire',
      postalCode: 'SO14',
      addressCountry: 'GB',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: 'Unity 101 Community Radio',
    url: 'https://unity101.org',
  },
  description:
    'Celebration of 20 years of community service and broadcasting by Unity 101 Community Radio.',
  offers: {
    '@type': 'Offer',
    url: 'https://unity101.org/register',
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
        {/* Top Royal Purple Brand Banner with Mandala Pattern */}
        <div className="w-full h-44 sm:h-52 bg-[#3e085c] relative overflow-hidden flex items-start justify-center shadow-md">
          {/* Left Mandala Watermark in Purple Banner */}
          <div className="absolute -left-12 -top-12 w-64 h-64 text-[#5e1289] opacity-40 select-none pointer-events-none">
            <Image
              src="/images/mandala-pattern.svg"
              alt=""
              width={256}
              height={256}
              className="w-full h-full"
              priority
            />
          </div>

          {/* Right Mandala Watermark in Purple Banner */}
          <div className="absolute -right-12 -top-12 w-64 h-64 text-[#5e1289] opacity-40 select-none pointer-events-none">
            <Image
              src="/images/mandala-pattern.svg"
              alt=""
              width={256}
              height={256}
              className="w-full h-full rotate-90"
              priority
            />
          </div>

          {/* Center decorative glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-black/20" />
        </div>

        {/* Main Registration Form Container with Negative Top Margin for Layered Look */}
        <div className="w-full -mt-36 sm:-mt-40 z-10 mb-12">
          <RegistrationForm />
        </div>
      </main>
    </>
  );
}
