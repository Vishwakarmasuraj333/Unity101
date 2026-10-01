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
  Lock,
  ArrowRight,
  ArrowUp,
  ExternalLink,
  Car,
  Shirt,
} from 'lucide-react';

export default function LandingHero() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [showBackToTop, setShowBackToTop] = useState(false);

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

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0714] text-slate-100 selection:bg-amber-400 selection:text-purple-950 relative overflow-hidden font-sans">
      {/* Background Ambient Glows & Royal Purple Radial Fields */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-[#5c1387]/35 via-[#3a0a55]/20 to-transparent blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[700px] left-[-220px] w-[650px] h-[650px] bg-amber-500/12 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[1300px] right-[-220px] w-[650px] h-[650px] bg-purple-600/18 blur-[150px] pointer-events-none -z-10" />

      {/* Decorative Gold Mandala Motifs */}
      <div className="absolute top-8 -left-32 w-[420px] h-[420px] opacity-25 select-none pointer-events-none filter drop-shadow-[0_0_35px_rgba(245,196,81,0.45)] -z-10">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={420}
          height={420}
          className="w-full h-full rotate-12"
          priority
        />
      </div>
      <div className="absolute top-96 -right-32 w-[420px] h-[420px] opacity-25 select-none pointer-events-none filter drop-shadow-[0_0_35px_rgba(245,196,81,0.45)] -z-10">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={420}
          height={420}
          className="w-full h-full -rotate-45"
          priority
        />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0d0714]/85 border-b border-purple-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3.5 group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 relative transition-transform duration-300 group-hover:scale-105 shrink-0">
              <Image
                src="/images/unity101-21st-anniversary-logo-transparent.png"
                alt="Unity 101 Community Radio - 21st Anniversary"
                width={64}
                height={64}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(245,196,81,0.35)]"
                priority
              />
            </div>
            <div>
              <div className="font-serif-brand font-black text-sm sm:text-base tracking-wider flex items-center space-x-2">
                <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(245,196,81,0.5)]">
                  UNITY 101
                </span>
                <span className="text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/50 shadow-xs">
                  21 YEARS
                </span>
              </div>
              <div className="text-[10px] text-amber-200/90 uppercase tracking-widest font-semibold">
                Awards &amp; Achievement Celebrations
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <a
              href="#highlights"
              className="hidden md:inline-flex text-xs font-semibold text-purple-200/90 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-purple-950/40"
            >
              Highlights
            </a>

            <a
              href="#venue"
              className="hidden md:inline-flex text-xs font-semibold text-purple-200/90 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-purple-950/40"
            >
              Venue &amp; Timings
            </a>

            <Link
              href="/admin/login"
              className="text-xs font-semibold text-purple-300 hover:text-white transition-colors px-3 py-2 rounded-xl flex items-center space-x-1.5 hover:bg-purple-950/40 border border-transparent hover:border-purple-800/60"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Portal</span>
            </Link>

            <Link
              href="/register"
              className="relative group rounded-xl p-[1.5px] font-semibold text-xs transition-all active:scale-95 shadow-md shadow-amber-500/20 overflow-hidden flex items-center justify-center"
            >
              {/* Satrangi Rotating Border */}
              <span
                className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,#ff0055,#ff5500,#ffcc00,#00e676,#00b0ff,#7c4dff,#e040fb,#ff0055)] animate-satrangi pointer-events-none"
                aria-hidden="true"
              />

              <span className="relative block px-3.5 sm:px-4 py-2 rounded-[10.5px] bg-gradient-to-r from-[#2f0a4f] via-[#48117a] to-[#2f0a4f] text-amber-200 overflow-hidden z-10 transition-colors duration-300">
                {/* Left-to-Right Sliding Hover Background Fill */}
                <span
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out will-change-transform"
                  aria-hidden="true"
                />

                <span className="relative z-10 flex items-center space-x-1.5 group-hover:text-purple-950 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:text-purple-950 transition-colors animate-pulse" />
                  <span className="font-bold">Register Guest Pass</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:text-purple-950 group-hover:translate-x-0.5 transition-all" />
                </span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Floating Golden 21st Anniversary Laurel Crest */}
        <div className="relative inline-block mx-auto mb-6 group">
          <div className="absolute -inset-6 bg-gradient-to-r from-amber-400/25 via-purple-600/30 to-amber-400/25 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-44 sm:w-56 md:w-64 h-auto mx-auto drop-shadow-[0_12px_35px_rgba(245,196,81,0.45)] transition-transform duration-500 hover:scale-105">
            <Image
              src="/images/unity101-21st-anniversary-logo-transparent.png"
              alt="Unity 101 Community Radio - 21st Anniversary Awards & Achievement Celebrations"
              width={280}
              height={290}
              className="w-full h-auto object-contain select-none"
              priority
            />
          </div>
        </div>

        {/* Landmark Milestone Badge */}
        <div className="block">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/15 via-purple-600/25 to-amber-500/15 border border-amber-400/50 px-4 sm:px-5 py-2 rounded-full mb-6 shadow-[0_0_25px_rgba(245,158,11,0.25)] backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
            <span className="text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-widest font-serif-brand">
              Official 21st Anniversary Awards &amp; Achievement Celebrations
            </span>
          </div>
        </div>

        {/* Main Headline with Royal Typography */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6 font-serif-brand">
          Celebrating 21 Years of Voice,
          <br />
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(245,196,81,0.5)]">
            Heritage &amp; Community Honors
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed mb-10 px-2">
          Join civic leaders, broadcast legends, and valued community partners at{' '}
          <strong className="text-amber-300 font-semibold">Novotel Southampton</strong> for an
          unforgettable evening honoring 21 landmark years of broadcasting excellence, awards,
          and culinary elegance.
        </p>

        {/* Key Event Details Glass Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
          {/* Date Card */}
          <div className="bg-gradient-to-b from-purple-950/60 to-[#180529]/80 border border-amber-400/25 hover:border-amber-400/60 rounded-2xl p-4.5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                  Event Date
                </div>
                <div className="text-sm sm:text-base font-bold text-white">
                  Friday, 15 January 2027
                </div>
                <div className="text-[11px] text-purple-300/80">
                  Reception from 18:00 GMT
                </div>
              </div>
            </div>
          </div>

          {/* Timings Card */}
          <div className="bg-gradient-to-b from-purple-950/60 to-[#180529]/80 border border-amber-400/25 hover:border-amber-400/60 rounded-2xl p-4.5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                  Gala Timings
                </div>
                <div className="text-sm sm:text-base font-bold text-white">
                  6:00 PM – 10:30 PM
                </div>
                <div className="text-[11px] text-purple-300/80">
                  Banquet &amp; Awards Ceremony
                </div>
              </div>
            </div>
          </div>

          {/* Venue Card */}
          <div className="bg-gradient-to-b from-purple-950/60 to-[#180529]/80 border border-amber-400/25 hover:border-amber-400/60 rounded-2xl p-4.5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                  Gala Venue
                </div>
                <div className="text-sm sm:text-base font-bold text-white truncate" title="Novotel Southampton">
                  Novotel Southampton
                </div>
                <div className="text-[11px] text-purple-300/80 truncate" title="1 West Quay Road, SO15 1RA">
                  1 West Quay Rd, SO15 1RA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            id="hero-reserve-seat-btn"
            className="w-full sm:w-auto relative group rounded-2xl p-[2.5px] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_55px_rgba(236,72,153,0.55),0_0_40px_rgba(59,130,246,0.45)]"
          >
            {/* Satrangi (7-Color Rainbow) Ambient Glow Filter Behind Button */}
            <span
              className="absolute -inset-1 rounded-2xl bg-[conic-gradient(from_0deg,#ff0055,#ff5500,#ffcc00,#00e676,#00b0ff,#7c4dff,#e040fb,#ff0055)] opacity-50 blur-md group-hover:opacity-95 group-hover:blur-xl transition-all duration-500 animate-satrangi pointer-events-none"
              aria-hidden="true"
            />

            {/* Satrangi (7-Color Rainbow) Rotating Border Frame */}
            <span
              className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,#ff0055,#ff5500,#ffcc00,#00e676,#00b0ff,#7c4dff,#e040fb,#ff0055)] animate-satrangi pointer-events-none"
              aria-hidden="true"
            />

            {/* Inner Content Box with Full Royal Purple Gala Base */}
            <span className="relative w-full h-full flex items-center justify-center space-x-2.5 px-8 py-4 rounded-[13.5px] bg-gradient-to-r from-[#2c0847] via-[#48117a] to-[#2c0847] overflow-hidden z-10 transition-colors duration-300">
              {/* Left-to-Right Sliding Background Color on Hover - Full Coverage */}
              <span
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out will-change-transform"
                aria-hidden="true"
              />

              {/* Dazzling Satrangi / Radiant Light Flare Overlay on Hover */}
              <span
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500/25 via-amber-400/25 to-cyan-400/25 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out delay-75 will-change-transform"
                aria-hidden="true"
              />

              {/* Button Typography & Icons */}
              <span className="relative z-10 flex items-center justify-center space-x-2.5 text-amber-200 group-hover:text-purple-950 font-black text-sm uppercase tracking-wider transition-colors duration-300">
                <Sparkles className="w-4 h-4 text-amber-300 group-hover:text-purple-950 transition-all duration-300 group-hover:rotate-45 group-hover:scale-110" />
                <span>Reserve Complimentary Guest Seat</span>
                <ChevronRight className="w-4 h-4 stroke-[3] text-amber-300 group-hover:text-purple-950 transition-all duration-300 group-hover:translate-x-1.5" />
              </span>
            </span>
          </Link>

          <a
            href="#highlights"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-purple-700/60 hover:border-amber-400/50 transition-colors flex items-center justify-center space-x-2 backdrop-blur-md"
          >
            <span>Explore Gala Program</span>
          </a>
        </div>

        {/* Live Countdown Cards */}
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-purple-950/70 to-[#19062b]/90 border border-amber-400/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
          <div className="text-xs uppercase tracking-widest font-bold text-amber-300 mb-5 flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Countdown to 21st Anniversary Gala Night</span>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center">
            <div className="bg-[#120320]/90 border border-purple-800/80 rounded-2xl p-3 sm:p-5 shadow-inner">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-400 font-mono tracking-tight">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-purple-300/90 uppercase tracking-widest font-bold mt-1.5">
                Days
              </div>
            </div>

            <div className="bg-[#120320]/90 border border-purple-800/80 rounded-2xl p-3 sm:p-5 shadow-inner">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-400 font-mono tracking-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-purple-300/90 uppercase tracking-widest font-bold mt-1.5">
                Hours
              </div>
            </div>

            <div className="bg-[#120320]/90 border border-purple-800/80 rounded-2xl p-3 sm:p-5 shadow-inner">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-400 font-mono tracking-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-purple-300/90 uppercase tracking-widest font-bold mt-1.5">
                Minutes
              </div>
            </div>

            <div className="bg-[#120320]/90 border border-purple-800/80 rounded-2xl p-3 sm:p-5 shadow-inner">
              <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-400 font-mono tracking-tight">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-purple-300/90 uppercase tracking-widest font-bold mt-1.5">
                Seconds
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of the Evening */}
      <section id="highlights" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center mb-14">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest font-serif-brand">
            An Evening of Elegance &amp; Heritage
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
          <div className="bg-gradient-to-b from-purple-950/40 to-[#160624]/60 border border-purple-800/50 hover:border-amber-400/60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-serif-brand">
              Civic &amp; Red Carpet Reception
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Step onto the red carpet for media photo calls, meet esteemed civic dignitaries, and
              enjoy welcome mocktails in the gala foyer.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-gradient-to-b from-purple-950/40 to-[#160624]/60 border border-purple-800/50 hover:border-amber-400/60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group shadow-lg">
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
          <div className="bg-gradient-to-b from-purple-950/40 to-[#160624]/60 border border-purple-800/50 hover:border-amber-400/60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-serif-brand">
              Community Honours &amp; Awards
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Honouring the pioneering broadcasters, volunteers, and community champions who have
              powered Unity 101 across 21 remarkable years.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-gradient-to-b from-purple-950/40 to-[#160624]/60 border border-purple-800/50 hover:border-amber-400/60 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-serif-brand">
              Live Sitar &amp; Cultural Fusion
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enchanting musical interludes showcasing traditional sitar, percussion, and modern
              cultural fusion reflecting our diverse community.
            </p>
          </div>
        </div>
      </section>

      {/* Venue & Event Coordinates Section */}
      <section id="venue" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="bg-gradient-to-r from-purple-950/70 via-[#27093c]/90 to-purple-950/70 border border-amber-400/30 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest font-serif-brand">
                Prestigious Banquet Venue
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 font-serif-brand">
                Novotel Southampton
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Located in the heart of Southampton, Novotel provides a luxurious banquet environment
                with spacious seating, red-carpet greeting, and state-of-the-art acoustics.
              </p>

              <div className="mt-6 space-y-3.5 text-xs text-slate-300">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>1 West Quay Road, Southampton, Hampshire, SO15 1RA</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Car className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>On-site guest parking available &amp; 3-minute walk from Southampton Central Station</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shirt className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Dress Code: Black Tie / Formal Evening / Traditional Cultural Attire</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://maps.google.com/?q=Novotel+Southampton+1+West+Quay+Road+SO15+1RA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/60 text-white text-xs font-semibold transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-purple-300" />
                </a>

                <Link
                  href="/register"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <span>Reserve Your Seat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="bg-[#120320]/80 border border-purple-800/60 rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="border-b border-purple-900/60 pb-3">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Event Schedule
                </span>
                <h4 className="text-white font-bold text-sm mt-0.5">
                  Friday, 15 January 2027
                </h4>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-purple-950">
                  <span className="text-slate-400">18:00 – 18:45</span>
                  <span className="text-white font-medium">Red Carpet, Drinks Reception &amp; Media Calls</span>
                </div>
                <div className="flex justify-between py-1 border-b border-purple-950">
                  <span className="text-slate-400">19:00 – 19:30</span>
                  <span className="text-white font-medium">Civic Dignitary Addresses &amp; Welcome</span>
                </div>
                <div className="flex justify-between py-1 border-b border-purple-950">
                  <span className="text-slate-400">19:30 – 21:00</span>
                  <span className="text-white font-medium">3-Course Banquet Dinner &amp; Sitar Fusion</span>
                </div>
                <div className="flex justify-between py-1 border-b border-purple-950">
                  <span className="text-slate-400">21:00 – 22:15</span>
                  <span className="text-amber-300 font-bold">21st Anniversary Awards Ceremony</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">22:15 – 22:30</span>
                  <span className="text-white font-medium">Commemorative Photos &amp; Close</span>
                </div>
              </div>
            </div>
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
            className="relative group rounded-xl p-[2px] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden shadow-lg shadow-purple-950/50 shrink-0"
          >
            {/* Satrangi Rotating Border Frame */}
            <span
              className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,#ff0055,#ff5500,#ffcc00,#00e676,#00b0ff,#7c4dff,#e040fb,#ff0055)] animate-satrangi pointer-events-none"
              aria-hidden="true"
            />

            {/* Inner Pill with Full Purple Base */}
            <span className="relative w-full h-full flex items-center justify-center space-x-2 px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#2c0847] via-[#48117a] to-[#2c0847] overflow-hidden z-10 transition-colors duration-300">
              {/* Left-to-Right Sliding Background Color on Hover - Full Coverage */}
              <span
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out will-change-transform"
                aria-hidden="true"
              />

              <span className="relative z-10 text-amber-200 group-hover:text-purple-950 font-bold text-xs uppercase tracking-wider transition-colors duration-300 flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:text-purple-950 transition-colors" />
                <span>Claim Your Guest Seat Now</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-purple-900/30 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-amber-400" />
          <span>Unity 101 Community Radio • Licensed by OFCOM</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-purple-300/80">
          <a
            href="https://unity101.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors inline-flex items-center space-x-1"
            title="Official Unity 101 Website (Opens in new tab)"
          >
            <span>unity101.org</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span>•</span>
          <a
            href="https://maps.google.com/?q=Novotel+Southampton+1+West+Quay+Road+SO15+1RA"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors inline-flex items-center space-x-1"
            title="Directions to Novotel Southampton (Opens in new tab)"
          >
            <span>Novotel Map</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span>•</span>
          <a
            href="/admin/login"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors inline-flex items-center space-x-1"
            title="Executive Admin Portal (Opens in new tab)"
          >
            <span>Admin Portal</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span>•</span>
          <a
            href="/scanner"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors inline-flex items-center space-x-1"
            title="Live Reception Pass Scanner (Opens in new tab)"
          >
            <span>VIP Scanner</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        <div className="text-slate-500 text-center md:text-right">
          © 2005–2027 Unity 101 Community Radio. 21st Anniversary Awards &amp; Achievement Celebrations.
        </div>
      </footer>

      {/* Floating Professional Back to Top Button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        title="Back to top"
        className={`fixed bottom-6 right-6 z-50 group p-[2px] rounded-full transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5)] hover:scale-110 active:scale-95 overflow-hidden flex items-center justify-center ${
          showBackToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        {/* Satrangi Rotating Border */}
        <span
          className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,#ff0055,#ff5500,#ffcc00,#00e676,#00b0ff,#7c4dff,#e040fb,#ff0055)] animate-satrangi pointer-events-none"
          aria-hidden="true"
        />

        {/* Inner Purple Circular Pill with Left-to-Right Hover Sweep */}
        <span className="relative w-11 h-11 rounded-full bg-gradient-to-b from-[#3b0b5e] to-[#25053f] flex items-center justify-center overflow-hidden z-10">
          <span
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-out will-change-transform"
            aria-hidden="true"
          />
          <ArrowUp className="w-5 h-5 text-amber-300 group-hover:text-purple-950 relative z-10 transition-all duration-300 group-hover:-translate-y-0.5 stroke-[2.5]" />
        </span>
      </button>
    </div>
  );
}
