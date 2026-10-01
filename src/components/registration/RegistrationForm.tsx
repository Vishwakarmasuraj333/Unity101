'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Check,
  Copy,
  Printer,
  Calendar,
  Share2,
  Mail,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { RegistrationSchema, RegistrationFormData } from '@/lib/validation';
import { generateQrSvg } from '@/lib/qrcode';
import { downloadIcsFile } from '@/lib/calendar';
import { sounds } from '@/lib/sound';

export default function RegistrationForm() {
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    id: number;
    reference?: string;
    first_name: string;
    last_name: string;
    email: string;
    food_preference: string;
    town?: string;
    post_code?: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      address: '',
      town: '',
      post_code: '',
      email: '',
      mobile: '',
      food_preference: undefined,
      gdpr_consent: false as unknown as true,
    },
    mode: 'onChange', // Instant real-time feedback
  });

  const selectedFood = watch('food_preference');
  const values = watch();

  // Gentle celebratory confetti effect on successful registration
  useEffect(() => {
    if (!submissionSuccess) return;
    try {
      const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = canvas.offsetWidth || 500;
      canvas.height = canvas.offsetHeight || 600;
      const colors = ['#f59e0b', '#fbbf24', '#7c3aed', '#ec4899', '#10b981', '#3b82f6'];
      const particles = Array.from({ length: 60 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        r: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 2,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 8,
      }));
      let animId: number;
      let ticks = 0;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.vr;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.5);
          ctx.restore();
        });
        ticks++;
        if (ticks < 180) {
          animId = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      animId = requestAnimationFrame(render);
      return () => cancelAnimationFrame(animId);
    } catch {}
  }, [submissionSuccess]);

  const onSubmit = async (data: RegistrationFormData) => {
    setServerError(null);

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setServerError(responseData.message || 'Registration failed. Please correct the highlighted errors.');
        return;
      }

      // Success
      setSubmissionSuccess({
        ...responseData.data,
        town: data.town,
        post_code: data.post_code,
      });
      sounds.playGoldenChime();
      reset();
    } catch (err) {
      console.error('Registration submission error:', err);
      setServerError('Unable to connect to the server. Please check your internet connection.');
    }
  };

  const handleResetForAnother = () => {
    setSubmissionSuccess(null);
    setServerError(null);
    setCopied(false);
    reset({
      first_name: '',
      last_name: '',
      address: '',
      town: '',
      post_code: '',
      email: '',
      mobile: '',
      food_preference: undefined,
      gdpr_consent: false as unknown as true,
    });
  };

  const refCode = submissionSuccess
    ? submissionSuccess.reference || `#U101-${submissionSuccess.id.toString().padStart(5, '0')}`
    : '';

  const handleCopyRef = () => {
    if (!refCode) return;
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calendarUrl = submissionSuccess
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        'Unity 101 Community Radio - 21st Anniversary Awards & Achievement Celebrations'
      )}&dates=20270115T180000Z/20270115T223000Z&details=${encodeURIComponent(
        `Official Guest Registration Confirmed: ${submissionSuccess.first_name} ${submissionSuccess.last_name}\nPass Ref: ${refCode}\nMeal Choice: ${submissionSuccess.food_preference}\nVenue: Novotel Southampton, 1 West Quay Road, Southampton, SO15 1RA`
      )}&location=${encodeURIComponent('Novotel Southampton, 1 West Quay Road, Southampton, SO15 1RA')}`
    : '#';

  const shareUrl = submissionSuccess
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `🎉 I have registered for the Unity 101 21st Anniversary Awards & Achievement Celebrations!\nGuest: ${submissionSuccess.first_name} ${submissionSuccess.last_name}\nPass Ref: ${refCode}\n📅 Friday 15 January 2027 • 6:00 PM – 10:30 PM\n📍 Novotel Southampton, UK\nRegister yours: https://unity101events.org/register`
      )}`
    : '#';

  const handleDownloadIcs = () => {
    if (!submissionSuccess) return;
    downloadIcsFile({
      title: 'Unity 101 21st Anniversary Awards & Achievement Celebrations',
      description: `Official VIP Guest Invitation: ${submissionSuccess.first_name} ${submissionSuccess.last_name}\nPass Reference: ${refCode}\nMeal Choice: ${submissionSuccess.food_preference}\nTimings: 6:00 PM to 10:30 PM`,
      location: 'Novotel Southampton, 1 West Quay Road, Southampton, SO15 1RA',
      startDate: '2027-01-15T18:00:00Z',
      endDate: '2027-01-15T22:30:00Z',
      fileName: `unity101-21st-anniversary-${refCode}.ics`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 sm:py-10">
      {/* Side Decorative Golden Flower (Mandala) Ornaments with Radiant Gold Glow */}
      <div className="pointer-events-none absolute -left-24 sm:-left-36 top-1/6 sm:top-1/4 w-64 sm:w-84 h-64 sm:h-84 opacity-80 sm:opacity-90 -z-10 select-none filter drop-shadow-[0_0_35px_rgba(245,196,81,0.7)] drop-shadow-[0_0_12px_rgba(255,243,176,0.85)] transition-all">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={336}
          height={336}
          className="w-full h-full rotate-45"
          priority
        />
      </div>
      <div className="pointer-events-none absolute -right-24 sm:-right-36 bottom-1/6 sm:bottom-1/4 w-72 sm:w-92 h-72 sm:h-92 opacity-80 sm:opacity-90 -z-10 select-none filter drop-shadow-[0_0_35px_rgba(245,196,81,0.7)] drop-shadow-[0_0_12px_rgba(255,243,176,0.85)] transition-all">
        <Image
          src="/images/mandala-pattern.svg"
          alt=""
          width={368}
          height={368}
          className="w-full h-full -rotate-12"
          priority
        />
      </div>

      {/* Main Registration Card */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-purple-950/15 border border-purple-100/70 overflow-hidden transition-all duration-300 relative">
        {/* Card Header with Unity 101 Logo & 21st Anniversary */}
        <div className="pt-8 sm:pt-10 pb-4 px-6 sm:px-10 text-center flex flex-col items-center">
          <div className="w-56 sm:w-64 h-auto relative mb-3">
            <Image
              src="/images/unity101-21st-anniversary-logo.png"
              alt="Unity 101 Community Radio - 21st Anniversary Awards & Achievement Celebrations"
              width={340}
              height={230}
              className="w-full h-auto object-contain drop-shadow-md"
              priority
            />
          </div>

          {/* Purple Pill "Register Below" */}
          <div className="mt-1 mb-2">
            <span className="inline-block bg-[#481268] text-white text-xs sm:text-sm font-semibold tracking-wide py-1.5 px-7 rounded-full shadow-sm">
              {submissionSuccess ? 'Confirmed Attendance' : 'Register Below'}
            </span>
          </div>

          {/* Cursive "Guest information" Script Heading */}
          <h2 className="font-script text-[#481268] text-3xl sm:text-4xl font-bold tracking-wide mt-1 select-none">
            {submissionSuccess ? 'Invitation Confirmation' : 'Guest information'}
          </h2>
        </div>

        {/* Content Area */}
        <div className="px-6 sm:px-10 pb-10">
          {/* Submission Success State with Luxury VIP Pass */}
          {submissionSuccess ? (
            <div className="py-2 text-center animate-in fade-in duration-300 relative">
              {/* Confetti Animation Canvas */}
              <canvas
                id="confetti-canvas"
                className="pointer-events-none absolute inset-0 w-full h-full z-20"
              />

              {/* Status Badge */}
              <div className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-300/80 px-3.5 py-1 rounded-full text-emerald-800 text-xs font-bold mb-3 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Registration Successfully Verified</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#481268] mb-1 font-serif-brand tracking-wide">
                YOU ARE REGISTERED!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6">
                Thank you, <strong className="text-slate-900 font-bold">{submissionSuccess.first_name} {submissionSuccess.last_name}</strong>. Your verified guest registration has been safely recorded in our database.
              </p>

              {/* Luxury VIP Commemorative Pass / Ticket */}
              <div
                id="vip-guest-pass"
                className="bg-gradient-to-r from-amber-400 via-purple-600 to-amber-400 p-[1.5px] rounded-2xl shadow-xl shadow-purple-950/15 max-w-md mx-auto mb-6 text-left overflow-hidden transition-transform duration-300"
              >
                <div className="bg-white rounded-[15px] p-5 relative overflow-hidden">
                  {/* Background Watermark */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 opacity-10 pointer-events-none select-none">
                    <Image
                      src="/images/unity101-logo.png"
                      alt=""
                      width={128}
                      height={128}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Ticket Header */}
                  <div className="flex items-center justify-between border-b border-purple-100 pb-3 mb-3">
                    <div>
                      <span className="text-[10px] tracking-widest font-black uppercase text-amber-600 block">
                        Official Event Pass
                      </span>
                      <h4 className="font-serif-brand font-black text-xs sm:text-sm text-[#481268] tracking-wider">
                        UNITY 101 • 21ST ANNIVERSARY AWARDS
                      </h4>
                    </div>
                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[9.5px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center space-x-1 shrink-0">
                      <Sparkles className="w-3 h-3 text-slate-950" />
                      <span>VIP INVITEE</span>
                    </span>
                  </div>

                  {/* Guest Name & Reference */}
                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Invited Guest
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif-brand">
                      {submissionSuccess.first_name} {submissionSuccess.last_name}
                    </p>
                  </div>

                  {/* Grid Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Pass Reference</p>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="font-mono font-black text-xs text-[#481268] bg-purple-100/80 px-1.5 py-0.5 rounded">
                          {refCode}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyRef}
                          className="p-1 text-slate-400 hover:text-purple-700 rounded transition-colors no-print cursor-pointer"
                          title="Copy Reference Number"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                      <div className="flex items-center space-x-1 text-emerald-700 font-bold text-[11px] mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Confirmed Received</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Meal Preference</p>
                      <p className="font-semibold text-slate-800 text-[11px] mt-0.5">
                        {submissionSuccess.food_preference === 'Veg Food'
                          ? '🌱 Veg Food'
                          : '🍗 Non Veg Food'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Registered Email</p>
                      <p
                        className="font-medium text-slate-700 text-[11px] truncate mt-0.5"
                        title={submissionSuccess.email}
                      >
                        {submissionSuccess.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Event Date</p>
                      <p className="font-semibold text-slate-800 text-[11px] mt-0.5">
                        Friday, 15 Jan 2027
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Venue & Time</p>
                      <p className="font-semibold text-slate-800 text-[11px] mt-0.5 truncate" title="Novotel Southampton">
                        Novotel Southampton • 6:00 PM – 10:30 PM
                      </p>
                    </div>
                  </div>

                  {/* Perforated Cutout Line */}
                  <div className="relative my-4 flex items-center justify-between border-t-2 border-dashed border-slate-200">
                    <div className="absolute -left-7 w-4 h-4 rounded-full bg-[#f7f5fa] border-r border-slate-200" />
                    <div className="absolute -right-7 w-4 h-4 rounded-full bg-[#f7f5fa] border-l border-slate-200" />
                  </div>

                  {/* Vector QR Code */}
                  <div className="flex flex-col items-center justify-center pt-1 text-center">
                    <div
                      className="bg-white p-2.5 rounded-xl shadow-xs border border-purple-100 flex items-center justify-center"
                      dangerouslySetInnerHTML={{
                        __html: generateQrSvg(
                          `UNITY101:21ST:${refCode}:${submissionSuccess.first_name}+${submissionSuccess.last_name}`,
                          { size: 125, color: '#320a4b' }
                        ),
                      }}
                    />
                    <p className="text-[10.5px] font-mono font-bold tracking-widest text-[#481268] mt-2 uppercase">
                      ENTRY PASS: {refCode}
                    </p>
                    <p className="text-[9.5px] text-slate-500 mt-0.5">
                      Present at Novotel Southampton reception desk for priority check-in
                    </p>
                  </div>
                </div>
              </div>

              {/* Postal Delivery Assurance Notice */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 max-w-md mx-auto mb-6 flex items-start text-left shadow-xs no-print">
                <Mail className="w-4 h-4 text-amber-600 mr-2.5 mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  <strong>Formal Postal Invitation:</strong> Once our event committee verifies guest capacities, we will send you a formal invitation card by post to your registered address.
                </p>
              </div>

              {/* Action Buttons Row (Print, Calendar, WhatsApp, Register Another) */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md mx-auto no-print">
                {/* Print / Save Pass */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center space-x-1.5 bg-[#481268] hover:bg-[#380952] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Print / Save Pass</span>
                </button>

                {/* Add to Calendar */}
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all border border-slate-300 active:scale-95 cursor-pointer"
                  title="Add to Google Calendar"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#481268]" />
                  <span>Google Cal</span>
                </a>

                {/* Download Apple / Outlook .ics */}
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="inline-flex items-center space-x-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all border border-purple-200 active:scale-95 cursor-pointer"
                  title="Download Apple / Outlook iCal Event"
                >
                  <Download className="w-3.5 h-3.5 text-purple-700" />
                  <span>Download .ics</span>
                </button>

                {/* Share on WhatsApp */}
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all border border-emerald-200 active:scale-95 cursor-pointer"
                  title="Share details via WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>

                {/* Register Another Guest */}
                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 px-3.5 rounded-xl transition-all border border-slate-200 active:scale-95 cursor-pointer w-full sm:w-auto justify-center mt-1"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Register Another Guest</span>
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Server-Side Error Alert */}
              {serverError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start space-x-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">{serverError}</p>
                </div>
              )}

              {/* First Name - No numbers or symbols allowed */}
              <div className="space-y-1">
                <input
                  type="text"
                  id="first_name"
                  placeholder="First Name"
                  maxLength={50}
                  value={values.first_name || ''}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                    setValue('first_name', sanitized, { shouldValidate: true });
                  }}
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.first_name
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.first_name && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.first_name.message}</span>
                  </p>
                )}
              </div>

              {/* Last Name - No numbers or symbols allowed */}
              <div className="space-y-1">
                <input
                  type="text"
                  id="last_name"
                  placeholder="Last Name"
                  maxLength={50}
                  value={values.last_name || ''}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                    setValue('last_name', sanitized, { shouldValidate: true });
                  }}
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.last_name
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.last_name && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.last_name.message}</span>
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <input
                  type="text"
                  id="address"
                  maxLength={120}
                  {...register('address')}
                  placeholder="Street Address (e.g. 12 High Street)"
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.address
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.address && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.address.message}</span>
                  </p>
                )}
              </div>

              {/* Town - No numbers allowed */}
              <div className="space-y-1">
                <input
                  type="text"
                  id="town"
                  placeholder="Town or City (e.g. Southampton)"
                  maxLength={50}
                  value={values.town || ''}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                    setValue('town', sanitized, { shouldValidate: true });
                  }}
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.town
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.town && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.town.message}</span>
                  </p>
                )}
              </div>

              {/* Post Code - Auto uppercase, UK format */}
              <div className="space-y-1">
                <input
                  type="text"
                  id="post_code"
                  placeholder="Postcode (e.g. SO14 0AY)"
                  maxLength={10}
                  value={values.post_code || ''}
                  onChange={(e) => {
                    const sanitized = e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
                    setValue('post_code', sanitized, { shouldValidate: true });
                  }}
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b uppercase transition-colors outline-none ${
                    errors.post_code
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.post_code && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.post_code.message}</span>
                  </p>
                )}
              </div>

              {/* Email - Strict validation & no spaces */}
              <div className="space-y-1">
                <input
                  type="email"
                  id="email"
                  maxLength={100}
                  autoComplete="email"
                  value={values.email || ''}
                  onChange={(e) => {
                    const sanitized = e.target.value.trim().toLowerCase();
                    setValue('email', sanitized, { shouldValidate: true });
                  }}
                  placeholder="Email Address (e.g. guest@example.com)"
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.email
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Mobile - 10 to 15 digits only */}
              <div className="space-y-1">
                <input
                  type="tel"
                  id="mobile"
                  placeholder="Mobile (e.g. 07700 900123)"
                  maxLength={16}
                  value={values.mobile || ''}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^0-9+\s]/g, '');
                    setValue('mobile', sanitized, { shouldValidate: true });
                  }}
                  className={`w-full px-1 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-b transition-colors outline-none ${
                    errors.mobile
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-slate-300 focus:border-[#481268]'
                  }`}
                />
                {errors.mobile && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.mobile.message}</span>
                  </p>
                )}
              </div>

              {/* Choose Food */}
              <div className="pt-2">
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm">
                  <span className="font-semibold text-[#481268]">Choose food:</span>
                  
                  {/* Veg Food Choice */}
                  <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="food_preference_radio"
                      value="Veg Food"
                      checked={selectedFood === 'Veg Food'}
                      onChange={() => setValue('food_preference', 'Veg Food', { shouldValidate: true })}
                      className="w-4 h-4 text-amber-500 border-slate-300 focus:ring-amber-400"
                    />
                    <span className="font-medium text-[#d97706] hover:text-[#b45309]">
                      Veg Food
                    </span>
                  </label>

                  {/* Non Veg Food Choice */}
                  <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="food_preference_radio"
                      value="Non Veg Food"
                      checked={selectedFood === 'Non Veg Food'}
                      onChange={() => setValue('food_preference', 'Non Veg Food', { shouldValidate: true })}
                      className="w-4 h-4 text-amber-500 border-slate-300 focus:ring-amber-400"
                    />
                    <span className="font-medium text-[#d97706] hover:text-[#b45309]">
                      Non Veg Food
                    </span>
                  </label>
                </div>
                {errors.food_preference && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.food_preference.message}</span>
                  </p>
                )}
              </div>

              {/* Postal Formal Invitation Note */}
              <div className="pt-1">
                <p className="text-[12.5px] leading-relaxed text-slate-600 font-normal">
                  Once you have registered and confirmed you are coming, we will send you a formal invitation by post.
                </p>
              </div>

              {/* GDPR Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="gdpr_consent"
                    {...register('gdpr_consent')}
                    className="w-4 h-4 mt-0.5 rounded text-[#481268] border-slate-300 focus:ring-purple-700 shrink-0"
                  />
                  <span className="text-[11.5px] sm:text-xs leading-snug text-slate-600 font-normal">
                    I agree to share my personal details with Unity101 and its marketing promotion via SMS, Email and Post under GDPR regulation.
                  </span>
                </label>
                {errors.gdpr_consent && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.gdpr_consent.message}</span>
                  </p>
                )}
              </div>

              {/* Two-Tone Submit Button as in Visual Reference */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex items-stretch shadow-md transition-all duration-200 active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none rounded overflow-hidden cursor-pointer"
                >
                  {/* Left Yellow/Gold Text Container */}
                  <div className="bg-[#f2b814] hover:bg-[#e0a708] px-5 sm:px-6 py-2.5 sm:py-3 text-slate-900 font-medium text-xs sm:text-sm tracking-normal flex items-center justify-center min-w-[200px] transition-colors">
                    {isSubmitting ? (
                      <div className="inline-flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <span>Submit your registration</span>
                    )}
                  </div>

                  {/* Right Purple Chevron Box */}
                  <div className="bg-[#481268] group-hover:bg-[#380952] px-3 sm:px-3.5 flex items-center justify-center text-white transition-colors">
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer Branding Credit */}
      <div className="mt-8 text-center text-xs text-slate-500">
        <p>© 2026 Unity 101 Community Radio. 20 Years of Broadcasting Excellence.</p>
        <div className="mt-2 flex justify-center space-x-4 text-slate-500">
          <a href="/admin/login" className="hover:text-purple-700 transition-colors">
            Admin Portal
          </a>
          <span>•</span>
          <span>Southampton, UK</span>
        </div>
      </div>
    </div>
  );
}
