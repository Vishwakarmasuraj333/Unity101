import React from 'react';
import Image from 'next/image';
import RegistrationForm from '@/components/registration/RegistrationForm';
import { Metadata } from 'next';
import { Sparkles } from 'lucide-react';

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
      <main className="min-h-screen bg-gradient-to-b from-[#180426] via-[#24083a] to-[#12031c] relative flex flex-col justify-start items-center overflow-x-hidden selection:bg-amber-400 selection:text-slate-950">
        {/* Ambient Golden Spotlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] max-w-full h-[450px] bg-gradient-to-b from-amber-400/20 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-12 right-0 w-[550px] h-[450px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Top Royal Purple Brand Banner with Shimmering Gold Accents */}
        <div className="w-full h-48 sm:h-56 bg-gradient-to-r from-[#1c042d] via-[#33084d] to-[#1c042d] relative overflow-hidden flex flex-col items-center justify-start pt-5 border-b border-amber-400/35 shadow-2xl">
          {/* Top Gold Shimmer Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Left Mandala Watermark with Golden Aura */}
          <div className="absolute -left-12 -top-12 w-64 h-64 text-amber-400 opacity-20 select-none pointer-events-none filter drop-shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <Image
              src="/images/mandala-pattern.svg"
              alt=""
              width={256}
              height={256}
              className="w-full h-full"
              priority
            />
          </div>

          {/* Right Mandala Watermark with Golden Aura */}
          <div className="absolute -right-12 -top-12 w-64 h-64 text-amber-400 opacity-20 select-none pointer-events-none filter drop-shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <Image
              src="/images/mandala-pattern.svg"
              alt=""
              width={256}
              height={256}
              className="w-full h-full rotate-90"
              priority
            />
          </div>

          {/* Golden Gala Announcement Badge */}
          <div className="relative z-10 inline-flex items-center space-x-2.5 px-4 sm:px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-950/80 via-amber-900/50 to-amber-950/80 border border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.35)] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
            <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent text-xs sm:text-[13px] font-extrabold tracking-wider uppercase drop-shadow-sm">
              20th Anniversary Community Gala • Official Guest Portal
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0 hidden sm:inline-block" />
          </div>

          {/* Center decorative glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-black/30 pointer-events-none" />
        </div>

        {/* Main Registration Form Container with Negative Top Margin for Layered Look */}
        <div className="w-full -mt-34 sm:-mt-38 z-10 mb-14">
          <RegistrationForm />
        </div>
      </main>
    </>
  );
}
