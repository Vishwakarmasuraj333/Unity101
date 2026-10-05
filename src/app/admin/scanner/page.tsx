'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Image from 'next/image';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  CameraOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Users,
  Salad,
  Drumstick,
  Clock,
  Upload,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Zap,
  ExternalLink,
} from 'lucide-react';

interface GuestResult {
  id: number;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  food_preference: string;
  status: string;
  notes?: string | null;
  checked_in_at?: string | null;
}

interface ScanStats {
  total: number;
  attended: number;
  remaining: number;
  percentage: number;
  vegAttended: number;
  nonVegAttended: number;
  vegTotal: number;
  nonVegTotal: number;
}

export default function ReceptionScannerPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Scan result state
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'warning' | 'error';
    message: string;
    guest?: GuestResult;
  } | null>(null);

  // Live Stats & Recent Check-ins
  const [stats, setStats] = useState<ScanStats>({
    total: 0,
    attended: 0,
    remaining: 0,
    percentage: 0,
    vegAttended: 0,
    nonVegAttended: 0,
    vegTotal: 0,
    nonVegTotal: 0,
  });
  const [recentCheckins, setRecentCheckins] = useState<GuestResult[]>([]);

  // Video and Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastScannedCodeRef = useRef<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Audio chimes using Web Audio API
  const playSound = useCallback((type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'success') {
        // High luxury chime
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.18);
        osc2.frequency.setValueAtTime(1320, now);
        osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.18);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
      } else if (type === 'warning') {
        // Double alert buzz
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(220, now + 0.15);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        // Error low double beep
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      }

      // Haptic feedback if supported on mobile
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        if (type === 'success') navigator.vibrate([80, 40, 80]);
        else navigator.vibrate([200, 100, 200]);
      }
    } catch {
      // Audio playback fallback
    }
  }, [soundEnabled]);

  // Load Live Stats from API
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/check-in/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recentCheckins) setRecentCheckins(data.recentCheckins);
      }
    } catch (e) {
      console.error('Failed to load check-in stats:', e);
    }
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, [loadStats]);

  // Process Check-In API Request
  const processCheckIn = useCallback(async (codeToProcess: string, action: 'check-in' | 'verify' | 'undo' = 'check-in') => {
    if (!codeToProcess || isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/admin/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToProcess, action }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (action === 'undo') {
          setScanResult({
            status: 'warning',
            message: data.message || 'Check-in reverted.',
            guest: data.guest,
          });
          playSound('warning');
        } else {
          setScanResult({
            status: 'success',
            message: data.message || 'Guest checked in successfully!',
            guest: data.guest,
          });
          playSound('success');
        }
        loadStats();
      } else if (data.alreadyCheckedIn) {
        setScanResult({
          status: 'warning',
          message: data.message || 'Warning: Guest was already checked in earlier!',
          guest: data.guest,
        });
        playSound('warning');
      } else {
        setScanResult({
          status: 'error',
          message: data.message || 'No matching guest registration found.',
        });
        playSound('error');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setScanResult({
        status: 'error',
        message: 'Network error communicating with check-in server.',
      });
      playSound('error');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, loadStats, playSound]);

  // Frame processing loop for QR decoding
  const tick = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) {
      animFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      const now = Date.now();
      // Debounce same QR code scan by 4 seconds
      if (code.data !== lastScannedCodeRef.current || now - lastScanTimeRef.current > 4000) {
        lastScannedCodeRef.current = code.data;
        lastScanTimeRef.current = now;
        processCheckIn(code.data);
      }
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [processCheckIn]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        animFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err: unknown) {
      const errorName = (err as { name?: string })?.name;
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setCameraError(
          'Camera permission was not granted. Please allow camera access in your browser site permissions (click the lock/tune icon in the address bar), or use the Manual Pass Entry or Image Upload options below.'
        );
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setCameraError(
          'No camera device detected on this system. You can verify guests using the Manual Pass Reference Entry or Image Upload below.'
        );
      } else {
        setCameraError(
          'Unable to access camera. Please check camera availability or use Manual Pass Entry below.'
        );
      }
      setCameraActive(false);
    }
  }, [facingMode, tick]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle manual code form submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processCheckIn(manualCode.trim());
    setManualCode('');
  };

  // Handle Image File Upload for QR Scan
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            processCheckIn(code.data);
          } else {
            setScanResult({
              status: 'error',
              message: 'Could not detect a valid QR code in the uploaded image. Please try another image or enter the code manually.',
            });
            playSound('error');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <AdminLayout title="VIP Pass Scanner &amp; Check-In">
      <div className="space-y-6">
        {/* Top Reception Header Banner */}
        <div className="bg-gradient-to-r from-[#24083a] via-[#350a55] to-[#1c062c] rounded-2xl p-5 sm:p-7 border border-amber-400/30 shadow-xl relative overflow-hidden text-white">
          <div className="absolute right-0 top-0 w-80 h-80 opacity-15 pointer-events-none select-none">
            <Image
              src="/images/mandala-pattern.svg"
              alt=""
              width={320}
              height={320}
              className="w-full h-full rotate-45"
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Live Reception Desk
                  </span>
                  <span className="inline-flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    <span>Real-time Sync</span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black font-serif-brand text-white mt-1">
                  VIP Guest Pass Scanner &amp; Check-In
                </h1>
                <p className="text-xs text-purple-200/80">
                  Scan guest QR codes from phone screens, printed passes, or search by Reference ID
                </p>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 hover:bg-amber-400/25'
                    : 'bg-white/5 border-purple-800 text-slate-400 hover:bg-white/10'
                }`}
                title={soundEnabled ? 'Mute sound effects' : 'Enable audio feedback'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{soundEnabled ? 'Sound ON' : 'Muted'}</span>
              </button>

              <button
                type="button"
                onClick={loadStats}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-purple-800 text-purple-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Refresh attendance stats"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Attendance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Checked In */}
          <div className="bg-white dark:bg-[#111625] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Total Checked In</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.attended}
              </span>
              <span className="text-xs text-slate-500">/ {stats.total}</span>
              <span className="text-xs font-bold text-emerald-600 ml-auto">
                {stats.percentage}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Pending Attendance */}
          <div className="bg-white dark:bg-[#111625] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Awaiting Arrival</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.remaining}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Guests pending arrival</p>
          </div>

          {/* Veg Catered */}
          <div className="bg-white dark:bg-[#111625] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>🌱 Veg Checked In</span>
              <Salad className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-emerald-600">
                {stats.vegAttended}
              </span>
              <span className="text-xs text-slate-400">/ {stats.vegTotal} total</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Pure Vegetarian meals</p>
          </div>

          {/* Non-Veg Catered */}
          <div className="bg-white dark:bg-[#111625] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>🍗 Non-Veg Checked In</span>
              <Drumstick className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-amber-600">
                {stats.nonVegAttended}
              </span>
              <span className="text-xs text-slate-400">/ {stats.nonVegTotal} total</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Halal Non-Veg feast</p>
          </div>
        </div>

        {/* Main Scanner Workstation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Camera Scanner & Viewfinder (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111625] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-purple-700 dark:text-purple-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Live Camera Scanner
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                {cameraActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
                      startCamera();
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                    title="Flip camera"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={cameraActive ? stopCamera : startCamera}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ${
                    cameraActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-[#481268] hover:bg-[#380952] text-white'
                  }`}
                >
                  {cameraActive ? (
                    <>
                      <CameraOff className="w-3.5 h-3.5" />
                      <span>Stop Camera</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>Start Camera</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Camera Viewport / Placeholder */}
            <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Inactive State Prompt */}
              {!cameraActive && (
                <div className="p-6 text-center text-slate-400 max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 mx-auto mb-3">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1">
                    Camera is currently paused
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Click &ldquo;Start Camera&rdquo; to use your laptop or mobile camera for instant QR scanning.
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    Launch Camera Scanner
                  </button>
                </div>
              )}

              {/* Viewfinder Target & Laser Animation when Active */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Outer Dim Overlay */}
                  <div className="w-64 h-64 sm:w-72 sm:h-72 border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                    {/* Glowing Viewfinder Corner Accents */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                    {/* Animated Laser Scanning Line */}
                    <div
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_10px_#ef4444]"
                      style={{
                        animation: 'scannerLaser 2.2s ease-in-out infinite alternate',
                      }}
                    />

                    {/* Subtle Crosshair in Center */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <div className="w-8 h-8 border border-white/60 rounded-full" />
                    </div>
                  </div>

                  <div className="absolute bottom-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-amber-300 font-medium">
                    Align guest QR code inside the frame
                  </div>
                </div>
              )}

              {/* Processing Overlay Indicator */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-20">
                  <div className="bg-[#1c082b] border border-amber-400/40 p-4 rounded-2xl text-center space-y-2 shadow-2xl">
                    <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-amber-300">Verifying guest pass...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Error Alert */}
            {cameraError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Photo / Screenshot Upload Alternative */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Guest has a pass on another phone or printed PDF?</span>
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload QR Screenshot</span>
              </button>
            </div>
          </div>

          {/* Right Column: Scan Result & Manual Verification (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Scanned Guest Card Result Display */}
            {scanResult ? (
              <div
                className={`rounded-2xl p-5 border shadow-lg transition-all animate-in fade-in duration-300 ${
                  scanResult.status === 'success'
                    ? 'bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 dark:from-emerald-950/30 dark:via-[#111625] dark:to-emerald-950/10 border-emerald-400/80 shadow-emerald-500/10'
                    : scanResult.status === 'warning'
                    ? 'bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/30 dark:via-[#111625] dark:to-amber-950/10 border-amber-400/80 shadow-amber-500/10'
                    : 'bg-gradient-to-br from-red-500/10 via-white to-red-500/5 dark:from-red-950/30 dark:via-[#111625] dark:to-red-950/10 border-red-400/80 shadow-red-500/10'
                }`}
              >
                {/* Result Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 mb-3">
                  <div className="flex items-center space-x-2">
                    {scanResult.status === 'success' && (
                      <span className="inline-flex items-center space-x-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>CHECKED IN SUCCESSFULLY</span>
                      </span>
                    )}
                    {scanResult.status === 'warning' && (
                      <span className="inline-flex items-center space-x-1.5 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-xs">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>ALREADY CHECKED IN</span>
                      </span>
                    )}
                    {scanResult.status === 'error' && (
                      <span className="inline-flex items-center space-x-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>PASS NOT FOUND</span>
                      </span>
                    )}
                  </div>

                  {scanResult.guest && (
                    <span className="font-mono font-bold text-xs bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-300 dark:border-purple-800">
                      {scanResult.guest.reference}
                    </span>
                  )}
                </div>

                {/* Guest Details if Found */}
                {scanResult.guest ? (
                  <div className="space-y-3.5">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Invited VIP Guest
                      </p>
                      <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif-brand">
                        {scanResult.guest.first_name} {scanResult.guest.last_name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {scanResult.guest.email} • {scanResult.guest.mobile}
                      </p>
                    </div>

                    {/* Meal Preference Badge & Table */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Catering Selection
                        </span>
                        <span
                          className={`inline-block font-bold text-xs mt-1 ${
                            scanResult.guest.food_preference === 'Veg Food'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {scanResult.guest.food_preference === 'Veg Food'
                            ? '🌱 Pure Vegetarian'
                            : '🍗 Halal Non-Veg'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Check-In Time
                        </span>
                        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1 block">
                          {scanResult.guest.checked_in_at
                            ? new Date(scanResult.guest.checked_in_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })
                            : 'Just Now'}
                        </span>
                      </div>
                    </div>

                    {scanResult.guest.notes && (
                      <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-300">
                        <strong>Notes:</strong> {scanResult.guest.notes}
                      </div>
                    )}

                    {/* Quick New Tab Links for Receptionist */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <a
                        href={`/pass/${scanResult.guest.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-bold transition-all shadow-xs"
                        title="Open Official VIP Pass Ticket in New Tab"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>VIP Pass ↗</span>
                      </a>

                      <a
                        href={`/admin/registrations/${scanResult.guest.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700"
                        title="Open Full Registration Record in Directory (New Tab)"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Directory Details ↗</span>
                      </a>
                    </div>

                    {/* Actions: Undo Check-in & Dismiss */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          processCheckIn(scanResult.guest?.reference || '', 'undo')
                        }
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Undo Check-In</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setScanResult(null)}
                        className="px-4 py-1.5 rounded-lg bg-[#481268] hover:bg-[#380952] text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <span>Scan Next Guest</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Error text if not found */
                  <div className="space-y-3">
                    <p className="text-xs text-red-700 dark:text-red-300">
                      {scanResult.message}
                    </p>
                    <button
                      type="button"
                      onClick={() => setScanResult(null)}
                      className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      Clear &amp; Try Again
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Awaiting Scan State */
              <div className="bg-slate-50 dark:bg-[#111625] rounded-2xl p-6 border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 space-y-2">
                <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  Ready to scan guest passes
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Aim camera at guest ticket or type reference code below to complete entry check-in.
                </p>
              </div>
            )}

            {/* Manual Code / Reference / Email Entry Box */}
            <div className="bg-white dark:bg-[#111625] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Manual Entry / ID Lookup
                </h4>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter Ref (e.g. U101-00001) or Email"
                    className="w-full pl-3 pr-20 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !manualCode.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#481268] hover:bg-[#380952] disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <span>Verify</span>
                  </button>
                </div>
              </form>

              {/* Quick Demo Pre-filled Seeded Guest Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  Quick Reception Shortcuts
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => processCheckIn('U101-00001')}
                    className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-300 font-mono text-[11px] font-bold border border-purple-200 dark:border-purple-800 cursor-pointer"
                  >
                    Guest #1 (U101-00001)
                  </button>
                  <button
                    type="button"
                    onClick={() => processCheckIn('U101-00002')}
                    className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-300 font-mono text-[11px] font-bold border border-purple-200 dark:border-purple-800 cursor-pointer"
                  >
                    Guest #2 (U101-00002)
                  </button>
                  <button
                    type="button"
                    onClick={() => processCheckIn('U101-00003')}
                    className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-300 font-mono text-[11px] font-bold border border-purple-200 dark:border-purple-800 cursor-pointer"
                  >
                    Guest #3 (U101-00003)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Recent Check-Ins Table */}
        <div className="bg-white dark:bg-[#111625] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Live Check-In Activity Stream
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Showing last {recentCheckins.length} verified guests
            </span>
          </div>

          {recentCheckins.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No guests checked in yet this evening. As guests arrive and scan passes, they will appear here in real-time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Pass Ref</th>
                    <th className="py-2.5 px-3">Guest Name</th>
                    <th className="py-2.5 px-3">Catering</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Check-In Time</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentCheckins.map((guest) => (
                    <tr
                      key={guest.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-900 dark:text-amber-300">
                        {guest.reference}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {guest.first_name} {guest.last_name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            guest.food_preference === 'Veg Food'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}
                        >
                          {guest.food_preference}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Attended</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {guest.checked_in_at
                          ? new Date(guest.checked_in_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })
                          : 'Recent'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <a
                            href={`/pass/${guest.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded transition-colors"
                            title="Open VIP Pass in New Tab"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={`/admin/registrations/${guest.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Open Registration Details in New Tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => processCheckIn(guest.reference, 'undo')}
                            className="text-[11px] text-slate-400 hover:text-red-600 transition-colors font-semibold cursor-pointer ml-1"
                          >
                            Undo
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
