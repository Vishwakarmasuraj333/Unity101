'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Printer,
  Calendar,
  Share2,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Download,
  AlertCircle,
  Radio,
  QrCode,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { generateQrSvg } from '@/lib/qrcode';
import { downloadIcsFile } from '@/lib/calendar';

interface GuestPassData {
  id: number;
  reference: string;
  first_name: string;
  last_name: string;
  town: string;
  post_code: string;
  food_preference: string;
  status: string;
  checked_in_at: string | null;
  created_at: string;
}

export default function GuestPassPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [pass, setPass] = useState<GuestPassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPass() {
      try {
        setLoading(true);
        const res = await fetch(`/api/pass/${resolvedParams.id}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setPass(json.data);
        } else {
          setError(json.message || 'Unable to locate guest pass.');
        }
      } catch {
        setError('Network error connecting to verification service.');
      } finally {
        setLoading(false);
      }
    }
    loadPass();
  }, [resolvedParams.id]);

  const handlePrint = () => {
    window.print();
  };

  const calendarUrl = pass
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        'Unity 101 Community Radio - 21st Anniversary Awards & Achievement Celebrations'
      )}&dates=20270115T180000Z/20270115T223000Z&details=${encodeURIComponent(
        `Official VIP Pass: ${pass.first_name} ${pass.last_name}\nRef: ${pass.reference}\nCatering: ${pass.food_preference}\nVenue: Novotel Southampton, 1 West Quay Road, SO15 1RA`
      )}&location=${encodeURIComponent('Novotel Southampton, 1 West Quay Road, Southampton, SO15 1RA')}`
    : '#';

  const shareUrl = pass
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `🎉 Official VIP Entry Pass for Unity 101 21st Anniversary Celebrations!\nGuest: ${pass.first_name} ${pass.last_name}\nPass Ref: ${pass.reference}\n📅 Friday 15 Jan 2027 • 18:00 GMT\n📍 Novotel Southampton, UK\nView Pass: ${typeof window !== 'undefined' ? window.location.href : ''}`
      )}`
    : '#';

  const handleDownloadIcs = () => {
    if (!pass) return;
    downloadIcsFile({
      title: 'Unity 101 21st Anniversary Awards & Achievement Celebrations',
      description: `Official VIP Guest Invitation: ${pass.first_name} ${pass.last_name}\nPass Reference: ${pass.reference}\nMeal Choice: ${pass.food_preference}\nTimings: 6:00 PM to 10:30 PM`,
      location: 'Novotel Southampton, 1 West Quay Road, Southampton, SO15 1RA',
      startDate: '2027-01-15T18:00:00Z',
      endDate: '2027-01-15T22:30:00Z',
      fileName: `unity101-pass-${pass.reference}.ics`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0714] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-amber-300 font-serif-brand tracking-widest text-sm font-bold uppercase animate-pulse">
          Retrieving Official VIP Pass...
        </p>
      </div>
    );
  }

  if (error || !pass) {
    return (
      <div className="min-h-screen bg-[#0d0714] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#180827] border border-purple-800/60 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-serif-brand text-white mb-2">
            VIP Pass Verification Notice
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed mb-6">
            {error || 'The requested VIP pass could not be retrieved from the event database.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <span>Register Attendance</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/60 text-white text-xs font-semibold transition-colors"
            >
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const qrPayload = `UNITY101:21ST:${pass.reference}:${pass.first_name}+${pass.last_name}`;

  return (
    <div className="min-h-screen bg-[#0a0410] text-slate-100 selection:bg-amber-400 selection:text-purple-950 relative overflow-hidden font-sans py-8 sm:py-12 px-4 sm:px-6">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#5c1387]/30 via-[#3a0a55]/20 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Screen Header Controls (Hidden on Print) */}
      <div className="max-w-xl mx-auto mb-6 flex items-center justify-between no-print">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 px-3 py-1.5 rounded-xl border border-purple-800/50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        <div className="flex items-center space-x-2">
          <a
            href="https://unity101.org"
            target="_blank"
            rel="noopener noreferrer"
            title="Unity 101 Official Website (Opens in new tab)"
            className="inline-flex items-center space-x-1 text-xs text-amber-300/80 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1.5 rounded-xl border border-amber-400/30 transition-colors"
          >
            <Radio className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">101.1 FM</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-purple-950" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* The Printable VIP Pass Ticket Card */}
      <div
        id="vip-pass-card"
        className="max-w-xl mx-auto bg-gradient-to-b from-[#200735] via-[#1a052c] to-[#120320] border-2 border-amber-400/60 rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(245,196,81,0.25)] relative"
      >
        {/* Top Gold Hologram Trim */}
        <div className="h-2.5 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500" />

        {/* Pass Card Header */}
        <div className="p-6 sm:p-7 border-b border-purple-900/60 relative overflow-hidden bg-gradient-to-b from-purple-950/70 to-transparent">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-16 h-16 relative shrink-0 drop-shadow-[0_4px_12px_rgba(245,196,81,0.4)]">
                <Image
                  src="/images/unity101-21st-anniversary-logo-transparent.png"
                  alt="Unity 101"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 font-serif-brand flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  <span>21st Anniversary Official VIP Entry Pass</span>
                </span>
                <h1 className="text-lg sm:text-xl font-black text-white font-serif-brand tracking-tight mt-0.5">
                  Unity 101 Community Radio
                </h1>
                <p className="text-[11px] text-purple-200/90 font-medium">
                  Awards &amp; Achievement Celebrations
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                Serial No
              </span>
              <span className="font-mono text-sm sm:text-base font-black text-amber-300 tracking-wider">
                {pass.reference}
              </span>
            </div>
          </div>
        </div>

        {/* Guest VIP Badge Information */}
        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/50">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Distinguished Guest
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-serif-brand tracking-tight">
                {pass.first_name} {pass.last_name}
              </h2>
              <p className="text-xs text-purple-200 flex items-center space-x-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{pass.town}{pass.post_code ? `, ${pass.post_code}` : ''}</span>
              </p>
            </div>

            <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
              <span
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${
                  pass.food_preference === 'Veg Food'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                }`}
              >
                <span>{pass.food_preference === 'Veg Food' ? '🌱 Pure Veg Meal' : '🍗 Halal Non-Veg'}</span>
              </span>

              {pass.checked_in_at ? (
                <span className="inline-flex items-center space-x-1 text-[10.5px] text-emerald-400 font-mono font-bold">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Checked In</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
                  <span>Admit One VIP</span>
                </span>
              )}
            </div>
          </div>

          {/* Event Venue & Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#120320] border border-purple-900/60 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Event Date &amp; Time</span>
              </div>
              <p className="text-white font-bold text-xs sm:text-sm">
                Friday, 15 January 2027
              </p>
              <div className="flex items-center space-x-1 text-slate-300 text-[11px]">
                <Clock className="w-3 h-3 text-purple-400" />
                <span>18:00 – 22:30 GMT (Reception at 18:00)</span>
              </div>
            </div>

            <div className="bg-[#120320] border border-purple-900/60 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Grand Banquet Venue</span>
              </div>
              <p className="text-white font-bold text-xs sm:text-sm">
                Novotel Southampton
              </p>
              <p className="text-slate-300 text-[11px] leading-tight">
                1 West Quay Road, Southampton, SO15 1RA
              </p>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="relative my-2 flex items-center justify-between border-t-2 border-dashed border-purple-900/80">
            <div className="absolute -left-9 w-5 h-5 rounded-full bg-[#0a0410] border-r-2 border-amber-400/60" />
            <div className="absolute -right-9 w-5 h-5 rounded-full bg-[#0a0410] border-l-2 border-amber-400/60" />
          </div>

          {/* High-Resolution QR Code & Digital Security Seal */}
          <div className="bg-[#120320] border border-amber-400/30 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
            <div
              className="bg-white p-3 rounded-2xl shadow-xl border-2 border-amber-400 inline-block"
              dangerouslySetInnerHTML={{
                __html: generateQrSvg(qrPayload, {
                  size: 150,
                  color: '#240638',
                }),
              }}
            />

            <div className="mt-3">
              <span className="font-mono text-xs font-black tracking-widest text-amber-300 uppercase">
                ENTRY CODE: {pass.reference}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                Present this digital badge or printed card to the reception team at Novotel Southampton for priority entry verification.
              </p>
            </div>
          </div>

          {/* Barcode & Security Strip */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-purple-900/40">
            <div className="flex items-center space-x-1.5 text-amber-400/90 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>OFFICIAL VERIFIED ENTRY BADGE</span>
            </div>
            <span>ID #{String(pass.id).padStart(5, '0')} • UNITY101-GALA</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar (Hidden on Print) */}
      <div className="max-w-xl mx-auto mt-6 space-y-3 no-print">
        <div className="bg-[#150624] border border-purple-900/60 rounded-2xl p-4 shadow-xl">
          <span className="text-[10.5px] uppercase font-bold text-amber-400 tracking-wider block mb-2.5 text-center sm:text-left">
            Quick Actions &amp; External Links (Opens in New Tab)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Google Maps (New Tab) */}
            <a
              href="https://maps.google.com/?q=Novotel+Southampton+1+West+Quay+Road+SO15+1RA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-white transition-all text-center group"
              title="Open Novotel Southampton in Google Maps (Opens in new tab)"
            >
              <MapPin className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">Directions ↗</span>
            </a>

            {/* Google Calendar (New Tab) */}
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-white transition-all text-center group"
              title="Add event to Google Calendar (Opens in new tab)"
            >
              <Calendar className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">Google Cal ↗</span>
            </a>

            {/* Download Apple / Outlook .ics */}
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="inline-flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-white transition-all text-center group cursor-pointer"
              title="Download Outlook / Apple Calendar .ics file"
            >
              <Download className="w-4 h-4 text-purple-300 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">Apple/Outlook</span>
            </button>

            {/* WhatsApp Share (New Tab) */}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-200 transition-all text-center group"
              title="Share VIP pass confirmation on WhatsApp (Opens in new tab)"
            >
              <Share2 className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">WhatsApp ↗</span>
            </a>
          </div>

          <div className="mt-3 pt-3 border-t border-purple-950 flex flex-wrap items-center justify-between gap-2 text-xs">
            <Link
              href="/register"
              className="text-purple-300 hover:text-white transition-colors"
            >
              Register Another Guest
            </Link>

            <a
              href="/scanner"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-amber-300 hover:text-amber-200 transition-colors"
              title="Open Live Reception Pass Scanner in New Tab"
            >
              <QrCode className="w-3 h-3 text-amber-400" />
              <span>Reception Scanner ↗</span>
            </a>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center text-xs text-slate-500 pt-4">
          <p>© 2005–2027 Unity 101 Community Radio • Licensed by OFCOM</p>
          <div className="mt-1 flex items-center justify-center space-x-4">
            <a
              href="https://unity101.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              unity101.org ↗
            </a>
            <a
              href="/admin/login"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              Admin Portal ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
