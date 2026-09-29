import React from 'react';
import Image from 'next/image';
import RegistrationForm from '@/components/registration/RegistrationForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unity 101 Community Radio | Event Registration',
  description:
    'Register for Unity 101 Community Radio 20th Anniversary event. Guest registration and meal selection.',
};

export default function RegisterPage() {
  return (
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
  );
}
