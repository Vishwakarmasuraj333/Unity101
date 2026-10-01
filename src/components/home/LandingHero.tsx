'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Award,
  Utensils,
  Music,
  Radio,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default function LandingHero() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Target Gala Date: Friday, 15 January 2027, 18:00:00 GMT
  useEffect(() => {
    const targetDate = new Date('2027-01-15T18:00:00Z').getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = Math.max(0, targetDate - now);

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0714] text-slate-100 selection:bg-amber-400 selection:text-purple-950 relative overflow-hidden font-sans">
      {/* Background Ambient Glows & Royal Purple Radial Fields */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#5c1387]/30 via-[#3a0a55]/20 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-[-200px] w-[600px] h-[600px] bg-amber-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[1400px] right-[-200px] w-[600px] h-[600px] bg-purple-600/15 blur-[140px] pointer-events-none -z-10" />

      {/* Decorative Gold Mandala Motifs */}
      <div className="absolute top-12 -left-28 w-96 h-96 opacity-30 select-none pointer-events-none filter drop-shadow-[0_0_35px_rgba(245,196,81,0.5)] -z-10">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={384}
          height={384}
          className="w-full h-full rotate-12"
          priority
        />
      </div>
      <div className="absolute top-96 -right-28 w-96 h-96 opacity-30 select-none pointer-events-none filter drop-shadow-[0_0_35px_rgba(245,196,81,0.5)] -z-10">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={384}
          height={384}
          className="w-full h-full -rotate-45"
          priority
        />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0d0714]/80 border-b border-purple-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-14 h-12 relative drop-shadow-md transition-transform group-hover:scale-105">
              <Image
                src="/images/unity101-21st-anniversary-logo.png"
                alt="Unity 101 Community Radio - 21st Anniversary"
                width={56}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="font-serif-brand font-black text-sm sm:text-base text-white tracking-wider flex items-center space-x-1.5">
                <span>UNITY 101</span>
                <span className="text-amber-400 text-xs px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
                  21 YEARS
                </span>
              </div>
              <div className="text-[10px] text-purple-300/80 uppercase tracking-widest font-semibold">
                Awards &amp; Achievement Celebrations
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-purple-300 hover:text-white transition-colors px-3 py-2 rounded-xl flex items-center space-x-1.5 hover:bg-purple-950/40 border border-transparent hover:border-purple-800/60"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Portal</span>
            </Link>

            <Link
              href="/register"
              className="relative group overflow-hidden rounded-xl p-px font-semibold text-xs transition-all active:scale-95"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-amber-400 via-purple-500 to-amber-300 group-hover:opacity-100 transition-opacity" />
              <span className="relative block px-4 py-2 rounded-[11px] bg-[#220735] text-amber-300 group-hover:bg-[#2e0947] transition-colors flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="font-bold">Register Guest Pass</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Landmark Milestone Badge */}
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/15 via-purple-500/20 to-amber-500/15 border border-amber-400/40 px-4 py-1.5 rounded-full mb-6 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span className="text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-widest font-serif-brand">
            Official 21st Anniversary Awards &amp; Achievement Celebrations
          </span>
        </div>

        {/* Main Headline with Royal Typography */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 font-serif-brand">
          Celebrating 21 Years of Voice,
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,196,81,0.4)]">
            Heritage &amp; Community Honors
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300/90 leading-relaxed mb-10">
          Join civic leaders, broadcast legends, and valued community partners at Novotel Southampton
          for an unforgettable evening honoring 21 landmark years of broadcasting excellence, awards,
          and culinary elegance.
        </p>

        {/* Key Event Details Pills */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 text-left">
          <div className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-4 backdrop-blur-md flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                Date
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                Friday, 15 January 2027
              </div>
            </div>
          </div>

          <div className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-4 backdrop-blur-md flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                Timings
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                6:00 PM – 10:30 PM (Reception: 18:00)
              </div>
            </div>
          </div>

          <div className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-4 backdrop-blur-md flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                Venue
              </div>
              <div className="text-xs sm:text-sm font-bold text-white truncate" title="Novotel Southampton, 1 West Quay Road, SO15 1RA">
                Novotel Southampton, SO15 1RA
              </div>
            </div>
          </div>
        </div>

        {/* Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-purple-950 font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Reserve Complimentary Guest Seat</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </Link>

          <a
            href="#highlights"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-purple-700/60 transition-colors flex items-center justify-center space-x-2 backdrop-blur-md"
          >
            <span>Explore Gala Program</span>
          </a>
        </div>

        {/* Live Countdown Cards */}
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-purple-950/60 to-[#19062b]/80 border border-amber-400/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
          <div className="text-xs uppercase tracking-widest font-bold text-amber-300 mb-4 flex items-center justify-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Countdown to Gala Night</span>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center">
            <div className="bg-[#120320] border border-purple-800/60 rounded-2xl p-3 sm:p-4">
              <div className="text-2xl sm:text-4xl font-black text-amber-400 font-mono">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-purple-300/80 uppercase tracking-widest font-semibold mt-1">
                Days
              </div>
            </div>

            <div className="bg-[#120320] border border-purple-800/60 rounded-2xl p-3 sm:p-4">
              <div className="text-2xl sm:text-4xl font-black text-amber-400 font-mono">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-purple-300/80 uppercase tracking-widest font-semibold mt-1">
                Hours
              </div>
            </div>

            <div className="bg-[#120320] border border-purple-800/60 rounded-2xl p-3 sm:p-4">
              <div className="text-2xl sm:text-4xl font-black text-amber-400 font-mono">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-purple-300/80 uppercase tracking-widest font-semibold mt-1">
                Minutes
              </div>
            </div>

            <div className="bg-[#120320] border border-purple-800/60 rounded-2xl p-3 sm:p-4">
              <div className="text-2xl sm:text-4xl font-black text-amber-400 font-mono">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-purple-300/80 uppercase tracking-widest font-semibold mt-1">
                Seconds
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of the Evening */}
      <section id="highlights" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest font-serif-brand">
            An Evening of Elegance & Heritage
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 font-serif-brand">
            The 21st Anniversary Experience
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
            Every guest will receive our royal commemorative welcome, exquisite culinary offerings,
            and reserved banquet seating at Novotel Southampton.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-gradient-to-b from-purple-950/40 to-[#160624]/60 border border-purple-800/50 hover:border-amber-400/60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-serif-brand">
              Civic & Red Carpet Reception
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Step onto the red carpet for media photo calls, meet esteemed civic dignitaries, and
              enjoy welcome mocktails in the gala foyer.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-gradient-to-b from-purple-950/40 to-[#160624]/60 border border-purple-800/50 hover:border-amber-400/60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-serif-brand">
              3-Course Gourmet Feast
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Indulge in a royal culinary journey with dedicated Pure Vegetarian and Halal
              Non-Vegetarian gourmet menus curated by master banquet chefs.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-gradient-to-b from-purple-950/40 to-[#160624]/60 border border-purple-800/50 hover:border-amber-400/60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-serif-brand">
              Community Honours & Awards
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Honouring the pioneering broadcasters, volunteers, and community champions who have
              powered Unity 101 across 21 remarkable years.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-gradient-to-b from-purple-950/40 to-[#160624]/60 border border-purple-800/50 hover:border-amber-400/60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-serif-brand">
              Live Sitar & Cultural Fusion
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enchanting musical interludes showcasing traditional sitar, percussion, and modern
              cultural fusion reflecting our diverse community.
            </p>
          </div>
        </div>
      </section>

      {/* Assurance / VIP Guarantee Strip */}
      <section className="py-12 bg-gradient-to-r from-purple-950/60 via-[#27093c]/80 to-purple-950/60 border-y border-purple-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-base">
                Complimentary VIP Invitation • Pre-Registration Mandatory
              </div>
              <div className="text-xs text-purple-300/80">
                Seating capacity at Novotel Southampton is strictly limited to maintain gala banquet elegance.
              </div>
            </div>
          </div>

          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0"
          >
            Claim Your Guest Seat Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-purple-900/30 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-amber-400" />
          <span>Unity 101 Community Radio • Licensed by OFCOM</span>
        </div>
        <div>
          © 2005–2027 Unity 101 Community Radio. 21st Anniversary Awards &amp; Achievement Celebrations.
        </div>
      </footer>
    </div>
  );
}
