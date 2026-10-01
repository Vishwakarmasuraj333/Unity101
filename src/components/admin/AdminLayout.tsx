'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Trash2,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Radio,
  Sun,
  Moon,
  Salad,
  Drumstick,
  History,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Building,
  Bell,
  CheckCircle,
  Clock,
  User,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  FileDown,
  Mail,
  Check,
  CheckCheck,
  Volume2,
  VolumeX,
  MapPin,
  Sparkles,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { Registration } from '@/types';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<Registration[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<number[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const prevUnreadRef = useRef<number>(0);

  // Safe date parser handling MySQL DATETIME strings and ISO dates accurately with UTC alignment
  const parseSafeDate = (dateStr?: string | Date): Date | null => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
    try {
      let s = String(dateStr).trim();
      if (s.includes(' ') && !s.includes('T')) {
        s = s.replace(' ', 'T');
      }
      // If there's no timezone offset (no 'Z' and no +HH:MM / -HH:MM), append 'Z' because MySQL server stores UTC!
      if (!s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
        s += 'Z';
      }
      const d = new Date(s);
      return isNaN(d.getTime()) ? new Date(dateStr) : d;
    } catch {
      return null;
    }
  };

  // Helper for real hour time (e.g. 04:15 PM) and dynamic relative time
  const formatNotificationTime = (dateStr?: string | Date) => {
    const d = parseSafeDate(dateStr);
    if (!d) {
      return {
        hourTime: '—',
        relativeTime: 'Recently',
        fullDate: 'Recently',
      };
    }

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    // Exact Hour & Minute in 12-hour format e.g. "04:19 PM"
    const hourTime = d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).toUpperCase();

    // Full Date & Time for tooltip
    const fullDate = d.toLocaleString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let relativeTime = 'Just now';
    if (diffSec < 45) {
      relativeTime = 'Just now';
    } else if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      relativeTime = `${mins}m ago`;
    } else if (diffSec < 86400) {
      const hrs = Math.floor(diffSec / 3600);
      relativeTime = `${hrs}h ago`;
    } else if (diffSec < 172800) {
      relativeTime = 'Yesterday';
    } else if (diffSec < 604800) {
      const days = Math.floor(diffSec / 86400);
      relativeTime = `${days}d ago`;
    } else {
      relativeTime = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }

    return { hourTime, relativeTime, fullDate };
  };

  // Pleasant gentle chime using browser Web Audio API
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay restriction fallback
    }
  };

  // Header Dropdown States
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync theme with localStorage & system preference
  useEffect(() => {
    const saved = localStorage.getItem('unity101_admin_theme');
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    const savedCollapsed = localStorage.getItem('unity101_sidebar_collapsed');
    if (savedCollapsed === 'true') {
      setIsCollapsed(true);
    }

    // Load persisted read notifications & sound setting
    try {
      const savedRead = localStorage.getItem('unity101_read_notifications');
      if (savedRead) {
        setReadNotificationIds(JSON.parse(savedRead));
      }
      const savedSound = localStorage.getItem('unity101_notification_sound');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }
    } catch {
      // Ignore
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('unity101_admin_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('unity101_admin_theme', 'light');
      }
      return next;
    });
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('unity101_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('unity101_notification_sound', String(next));
  };

  const markAllAsRead = () => {
    const allIds = Array.from(new Set([...readNotificationIds, ...recentNotifications.map((r) => r.id)]));
    setReadNotificationIds(allIds);
    setUnreadCount(0);
    try {
      localStorage.setItem('unity101_read_notifications', JSON.stringify(allIds));
    } catch {}
  };

  const markSingleAsRead = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = Array.from(new Set([...readNotificationIds, id]));
    setReadNotificationIds(updated);
    const remainingUnread = recentNotifications.filter((r) => !updated.includes(r.id)).length;
    setUnreadCount(remainingUnread);
    try {
      localStorage.setItem('unity101_read_notifications', JSON.stringify(updated));
    } catch {}
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/me');
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        setCurrentUser(data.admin);
      } catch {
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // Fetch live metrics and recent notifications with polling
  useEffect(() => {
    let isMounted = true;

    async function loadQuickStats() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.metrics && data.metrics.totalRegistrations !== undefined) {
            setGuestCount(data.metrics.totalRegistrations);
          }
          if (data.recentRegistrations) {
            const list: Registration[] = data.recentRegistrations.slice(0, 8);
            setRecentNotifications(list);

            // Read latest read IDs from localStorage
            let storedReadIds: number[] = [];
            try {
              const saved = localStorage.getItem('unity101_read_notifications');
              if (saved) storedReadIds = JSON.parse(saved);
            } catch {}

            // If user is currently on /admin/registrations, auto mark all current as read ("seen krne pe hatt jaye")
            if (pathname === '/admin/registrations') {
              const allIds = Array.from(new Set([...storedReadIds, ...list.map((r) => r.id)]));
              localStorage.setItem('unity101_read_notifications', JSON.stringify(allIds));
              setReadNotificationIds(allIds);
              setUnreadCount(0);
              prevUnreadRef.current = 0;
            } else {
              const unreadItems = list.filter((r) => !storedReadIds.includes(r.id));
              const count = unreadItems.length;
              setUnreadCount(count);

              // Play chime if new registration arrived while admin is active
              if (prevUnreadRef.current > 0 && count > prevUnreadRef.current) {
                playNotificationSound();
              }
              prevUnreadRef.current = count;
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    loadQuickStats();

    // Auto-poll every 20 seconds for live notifications feed
    const pollTimer = setInterval(loadQuickStats, 20000);
    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [pathname, soundEnabled]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const navSections = [
    {
      heading: 'CORE OPERATIONS',
      items: [
        {
          name: 'VIP Pass Scanner',
          href: '/admin/scanner',
          icon: QrCode,
          badge: 'Live',
        },
        {
          name: 'All Registrations',
          href: '/admin/registrations',
          icon: Users,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { name: 'Dashboard & Analytics', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Veg Catering Choice', href: '/admin/registrations?food=Veg+Food', icon: Salad },
        { name: 'Non-Veg Catering', href: '/admin/registrations?food=Non+Veg+Food', icon: Drumstick },
      ],
    },
    {
      heading: 'REPORTS & DATA',
      items: [
        { name: 'Exports & Manifests', href: '/admin/exports', icon: Download },
        { name: 'Archived Directory', href: '/admin/trash', icon: Trash2 },
        { name: 'System Activity Logs', href: '/admin/audit-logs', icon: History },
      ],
    },
    {
      heading: 'SYSTEM CONFIG',
      items: [
        { name: 'Email Delivery & Logs', href: '/admin/email', icon: Mail },
        { name: 'System & Mail Configuration', href: '/admin/settings', icon: Settings },
        { name: 'Admin Security Profile', href: '/admin/profile', icon: ShieldCheck },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-300">Loading Unity 101 Admin Portal...</p>
      </div>
    );
  }

  const capacityPct = Math.min(100, Math.round((guestCount / 500) * 100));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-[#1c082b] text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-purple-900/60 dark:border-slate-800 shadow-2xl overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-68'}`}
      >
        <div className="flex-1 flex flex-col">
          {/* Brand Header */}
          <div className="p-4 border-b border-purple-900/60 bg-[#160624] flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center space-x-3 group overflow-hidden">
              <div className="w-11 h-11 relative bg-gradient-to-br from-amber-400/25 via-purple-900/50 to-black/70 rounded-2xl p-1.5 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center justify-center shrink-0">
                <Image
                  src="/images/unity101-logo.png"
                  alt="Unity 101"
                  width={38}
                  height={38}
                  className="object-contain drop-shadow-md"
                />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <h1 className="font-serif-brand font-black text-base tracking-widest text-amber-300 group-hover:text-amber-200 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    UNITY 101
                  </h1>
                  <p className="text-[11px] text-amber-200/90 tracking-widest uppercase font-extrabold drop-shadow-xs">
                    Community Radio
                  </p>
                </div>
              )}
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-purple-300 hover:text-white p-1"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button: Add New Guest */}
          <div className="p-3">
            <Link
              href="/admin/registrations"
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#6b1b9a] to-[#481268] hover:from-[#7b1fa2] hover:to-[#581c87] text-white font-bold py-2.5 rounded-xl border border-purple-400/40 shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                isCollapsed ? 'px-2' : 'px-3 text-xs'
              }`}
              title="Add New Guest"
            >
              <Plus className="w-4 h-4 shrink-0 text-amber-300" />
              {!isCollapsed && <span>Add New Guest</span>}
            </Link>
          </div>

          {/* Categorized Navigation links */}
          <nav className="p-2 space-y-4 flex-1">
            {navSections.map((section) => (
              <div key={section.heading} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-3 text-[10.5px] font-bold text-purple-300/80 uppercase tracking-widest">
                    {section.heading}
                  </p>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin/dashboard' && pathname.startsWith(item.href) && !item.href.includes('?'));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        setSidebarOpen(false);
                        if (item.href === '/admin/registrations' || item.href.startsWith('/admin/registrations?')) {
                          markAllAsRead();
                        }
                      }}
                      title={item.name}
                      className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs tracking-wide transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#5a1682] to-[#481268] text-white border border-purple-400/50 shadow-md font-bold'
                          : 'text-slate-200 hover:bg-white/10 hover:text-white font-medium'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-300'}`} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!isCollapsed && item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                        <span className="inline-flex items-center space-x-1 text-[10px] bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)] shrink-0 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping mr-0.5" />
                          <span>{typeof item.badge === 'number' ? `${item.badge} New` : item.badge}</span>
                        </span>
                      )}
                      {isCollapsed && item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#1c082b] animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}

            {/* Quick Export Manifest Dropdown */}
            <div className="pt-2">
              {!isCollapsed ? (
                <div className="rounded-xl border border-purple-800/60 bg-[#160624]/90 overflow-hidden shadow-md">
                  <button
                    onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                    type="button"
                    className="w-full flex items-center justify-between p-2.5 text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold tracking-wide">Download Manifest</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                        LIVE
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-purple-200 transition-transform duration-200 ${
                          exportDropdownOpen ? 'rotate-180 text-amber-400' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {exportDropdownOpen && (
                    <div className="p-2 border-t border-purple-900/60 bg-black/25 space-y-1.5 animate-in fade-in duration-150">
                      <a
                        href="/api/admin/export?format=excel"
                        download
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-100 hover:text-white border border-purple-800/40 text-xs font-semibold transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="text-left">
                            <p className="font-bold text-white text-[11px] group-hover:text-amber-300 transition-colors">
                              Excel Manifest
                            </p>
                            <p className="text-[9.5px] text-purple-200">Table & food summary</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                          .XLSX
                        </span>
                      </a>

                      <a
                        href="/api/admin/export?format=pdf"
                        download
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-100 hover:text-white border border-purple-800/40 text-xs font-semibold transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                          <div className="text-left">
                            <p className="font-bold text-white text-[11px] group-hover:text-amber-300 transition-colors">
                              Official PDF
                            </p>
                            <p className="text-[9.5px] text-purple-200">Printable guest list</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700/60">
                          .PDF
                        </span>
                      </a>

                      <a
                        href="/api/admin/export?format=csv"
                        download
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-100 hover:text-white border border-purple-800/40 text-xs font-semibold transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2">
                          <FileDown className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="text-left">
                            <p className="font-bold text-white text-[11px] group-hover:text-amber-300 transition-colors">
                              Universal CSV
                            </p>
                            <p className="text-[9.5px] text-purple-200">Raw database rows</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/60">
                          .CSV
                        </span>
                      </a>

                      <a
                        href="/api/admin/export?format=xml"
                        download
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-100 hover:text-white border border-purple-800/40 text-xs font-semibold transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div className="text-left">
                            <p className="font-bold text-white text-[11px] group-hover:text-amber-300 transition-colors">
                              XML Manifest
                            </p>
                            <p className="text-[9.5px] text-purple-200">Structured RFC data</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
                          .XML
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                    type="button"
                    title="Export Manifests"
                    className="w-full flex items-center justify-center p-2 rounded-xl text-purple-200 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/50 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                  </button>
                  {exportDropdownOpen && (
                    <div className="absolute left-full ml-2 bottom-0 w-44 bg-[#160624] border border-purple-800/80 rounded-xl p-1.5 shadow-2xl z-50 space-y-1">
                      <a
                        href="/api/admin/export?format=excel"
                        download
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-white hover:bg-white/10 text-xs font-bold"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Excel (.xlsx)</span>
                      </a>
                      <a
                        href="/api/admin/export?format=pdf"
                        download
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-white hover:bg-white/10 text-xs font-bold"
                      >
                        <FileText className="w-3.5 h-3.5 text-rose-400" />
                        <span>PDF (.pdf)</span>
                      </a>
                      <a
                        href="/api/admin/export?format=csv"
                        download
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-white hover:bg-white/10 text-xs font-bold"
                      >
                        <FileDown className="w-3.5 h-3.5 text-amber-400" />
                        <span>CSV (.csv)</span>
                      </a>
                      <a
                        href="/api/admin/export?format=xml"
                        download
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-white hover:bg-white/10 text-xs font-bold"
                      >
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>XML (.xml)</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Sidebar Collapse Toggle & Bottom Card */}
        <div className="p-3 border-t border-purple-900/60 bg-[#160624] shrink-0">
          {/* Desktop Collapse Toggle < > */}
          <div className="hidden md:flex justify-end mb-2">
            <button
              onClick={toggleCollapse}
              className="w-full py-2 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-white/20"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-amber-400" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-amber-400" />
                  <span>Collapse Menu</span>
                </>
              )}
            </button>
          </div>

          <div className={`grid gap-2 ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <a
              href="/register"
              target="_blank"
              rel="noopener noreferrer"
              title="Open Public Registration Form in New Tab"
              className="inline-flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-100 hover:text-white text-xs font-semibold transition-colors border border-slate-700/60"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              {!isCollapsed && <span>Public ↗</span>}
            </a>

            <button
              onClick={handleLogout}
              title="Secure Admin Logout"
              className="inline-flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-red-700/60"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-[#0d121f] border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-xs transition-colors">
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-800 dark:text-slate-100 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-slate-800 dark:text-slate-100" />
            </button>

            {/* Left Header Title & Logo */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 relative rounded-xl bg-[#200533] border-2 border-amber-400 p-1 flex items-center justify-center shrink-0 shadow-md">
                <Image
                  src="/images/unity101-logo.png"
                  alt="Unity 101"
                  width={26}
                  height={26}
                  className="object-contain drop-shadow-xs"
                />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-950 dark:text-white tracking-tight">
                  {title}
                </h2>
                <p className="text-[11px] text-purple-900 dark:text-amber-400 hidden sm:block font-bold">
                  Unity 101 Community Radio
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Controls: Quick Launch, Notification Feed, Theme Switcher, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Launch: Public Site & VIP Scanner in New Tab */}
            <div className="hidden lg:flex items-center space-x-1.5 mr-1">
              <a
                href="/register"
                target="_blank"
                rel="noopener noreferrer"
                title="Open Public Registration Form in New Tab"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-900 dark:text-amber-300 border border-purple-200/80 dark:border-purple-800 text-xs font-bold transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                <span>Public Form ↗</span>
              </a>

              <a
                href="/admin/scanner"
                target="_blank"
                rel="noopener noreferrer"
                title="Open VIP Pass Scanner in New Tab"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-purple-600 dark:text-amber-400" />
                <span>Scanner ↗</span>
              </a>
            </div>

            {/* Live Registration Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
                  notificationsOpen
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-amber-400 border-purple-300 dark:border-purple-700 ring-2 ring-purple-400/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700'
                }`}
                title="Registration Alerts & Live Activity"
                aria-label="Notifications"
              >
                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-amber-500 animate-[wiggle_1s_ease-in-out_infinite]' : 'text-slate-800 dark:text-slate-100'}`} />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 rounded-full bg-amber-400 animate-ping opacity-60 pointer-events-none" />
                  </>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-84 sm:w-104 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#111625] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {/* Dropdown Header */}
                  <div className="p-3.5 bg-gradient-to-r from-[#2f0846] via-[#3d0b5b] to-[#481268] text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
                      <div>
                        <h4 className="font-bold text-xs tracking-wide">Registration Notifications</h4>
                        <p className="text-[10px] text-amber-200/80 font-mono">
                          {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {/* Audio chime toggle */}
                      <button
                        onClick={toggleSound}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          soundEnabled
                            ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                            : 'bg-white/10 text-slate-400 hover:bg-white/20'
                        }`}
                        title={soundEnabled ? 'Chime sound: Enabled' : 'Chime sound: Muted'}
                      >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </button>

                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="flex items-center space-x-1 text-[10.5px] bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer border border-white/20"
                          title="Mark all notifications as read"
                        >
                          <CheckCheck className="w-3 h-3 text-amber-300" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Tabs & Live Status */}
                  <div className="px-3 py-2 bg-slate-50 dark:bg-[#161e31] border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 bg-slate-200/70 dark:bg-slate-800/80 p-0.5 rounded-lg">
                      <button
                        onClick={() => setActiveTab('all')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          activeTab === 'all'
                            ? 'bg-white dark:bg-[#111625] text-purple-900 dark:text-amber-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        All ({recentNotifications.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('unread')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          activeTab === 'unread'
                            ? 'bg-white dark:bg-[#111625] text-purple-900 dark:text-amber-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Unread ({unreadCount})
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10.5px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Sync</span>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-92 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {(() => {
                      const displayed =
                        activeTab === 'unread'
                          ? recentNotifications.filter((r) => !readNotificationIds.includes(r.id))
                          : recentNotifications;

                      if (displayed.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-400">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                            <p className="font-semibold text-xs text-slate-700 dark:text-slate-200">
                              {activeTab === 'unread'
                                ? 'All notifications are marked as seen!'
                                : 'No registration alerts yet'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {activeTab === 'unread'
                                ? 'New guest registrations will appear here in real-time.'
                                : 'Incoming guests will be listed with exact hours & timestamps.'}
                            </p>
                          </div>
                        );
                      }

                      return displayed.map((reg) => {
                        const isUnread = !readNotificationIds.includes(reg.id);
                        const timeInfo = formatNotificationTime(reg.created_at);

                        return (
                          <div
                            key={reg.id}
                            onClick={() => {
                              markSingleAsRead(reg.id);
                              setNotificationsOpen(false);
                              router.push(`/admin/registrations/${reg.id}`);
                            }}
                            className={`p-3 transition-colors flex items-start space-x-3 cursor-pointer group relative ${
                              isUnread
                                ? 'bg-purple-50/60 dark:bg-purple-950/25 hover:bg-purple-100/70 dark:hover:bg-purple-900/35 border-l-4 border-amber-400'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-l-4 border-transparent'
                            }`}
                          >
                            {/* Guest Avatar / Badge */}
                            <div
                              className={`w-9 h-9 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                                isUnread
                                  ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-400/40 shadow-xs'
                                  : 'bg-purple-100 dark:bg-purple-950/80 text-[#481268] dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              }`}
                            >
                              #{reg.id}
                            </div>

                            {/* Info Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <div className="truncate">
                                  <div className="flex items-center space-x-1.5">
                                    <p className="font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-amber-300 transition-colors">
                                      {reg.first_name} {reg.last_name}
                                    </p>
                                    {isUnread && (
                                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-pulse shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                    <span className="truncate">
                                      {reg.town || 'No town'} {reg.post_code ? `(${reg.post_code})` : ''}
                                    </span>
                                  </div>
                                </div>

                                {/* REAL HOUR TIME + RELATIVE TIME */}
                                <div className="flex flex-col items-end shrink-0 ml-2" title={timeInfo.fullDate}>
                                  <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-amber-300 flex items-center space-x-1">
                                    <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                    <span>{timeInfo.hourTime}</span>
                                  </span>
                                  <span className="text-[9.5px] font-semibold text-purple-700 dark:text-purple-300 font-mono mt-0.5">
                                    {timeInfo.relativeTime}
                                  </span>
                                </div>
                              </div>

                              {/* Chips row & Quick Mark as Read */}
                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/40">
                                <div className="flex items-center space-x-1.5">
                                  <span
                                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border ${
                                      reg.food_preference === 'Veg Food'
                                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800'
                                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300/80 dark:border-amber-800'
                                    }`}
                                  >
                                    {reg.food_preference === 'Veg Food' ? '🌱 Veg' : '🍗 Non-Veg'}
                                  </span>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                      reg.status === 'confirmed'
                                        ? 'bg-purple-900/40 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700'
                                        : reg.status === 'cancelled'
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                                        : 'bg-amber-100 dark:bg-purple-950 text-amber-900 dark:text-purple-300 border border-amber-300 dark:border-purple-800'
                                    }`}
                                  >
                                    {reg.status}
                                  </span>
                                </div>

                                {isUnread && (
                                  <button
                                    onClick={(e) => markSingleAsRead(reg.id, e)}
                                    className="text-[10px] text-purple-700 dark:text-amber-400 hover:underline font-semibold flex items-center space-x-0.5 px-1.5 py-0.5 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                    title="Mark this notification as read"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Seen</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-3 bg-slate-50 dark:bg-[#0d121f] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Total: <strong className="text-slate-800 dark:text-slate-200 font-bold">{guestCount}</strong> registered
                    </span>
                    <Link
                      href="/admin/registrations"
                      onClick={() => {
                        markAllAsRead();
                        setNotificationsOpen(false);
                      }}
                      className="text-xs font-bold text-purple-700 dark:text-amber-400 hover:underline flex items-center space-x-1"
                    >
                      <span>View All Registrations</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Minimalist Icon-Only Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-purple-900" />
              )}
            </button>

            {/* Profile Avatar & Header Dropdown Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center space-x-1.5 p-1.5 rounded-xl transition-all text-xs font-semibold cursor-pointer border ${
                  userDropdownOpen
                    ? 'bg-slate-100 dark:bg-slate-800 border-purple-500 dark:border-purple-600 ring-2 ring-purple-400/20'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700'
                }`}
                title="Admin Account Profile"
              >
                <div className="w-8 h-8 relative rounded-xl bg-[#200533] border-2 border-amber-400 p-1 flex items-center justify-center shrink-0 shadow-xs">
                  <Image
                    src="/images/unity101-logo.png"
                    alt="Unity 101 Admin"
                    width={22}
                    height={22}
                    className="object-contain drop-shadow-xs"
                  />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-68 bg-white dark:bg-[#111625] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0d121f] flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-[#200533] border-2 border-amber-400 p-1.5 flex items-center justify-center shrink-0 shadow-md">
                      <Image
                        src="/images/unity101-logo.png"
                        alt="Unity 101"
                        width={36}
                        height={36}
                        className="object-contain drop-shadow-xs"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {currentUser?.name || 'Unity 101 Admin'}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                        {currentUser?.email || 'admin@unity101events.org'}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-400/50 font-bold text-[9px] uppercase">
                        Super Administrator
                      </span>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      href="/admin/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Security & Profile</span>
                    </Link>

                    <Link
                      href="/admin/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                      <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>System Settings</span>
                    </Link>

                    <a
                      href="/register"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-xs"
                      title="Open Public Registration Form in New Tab"
                    >
                      <ExternalLink className="w-4 h-4 text-amber-500" />
                      <span>Public Registration Form ↗</span>
                    </a>

                    <a
                      href="/admin/scanner"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-xs"
                      title="Open Live Scanner Console in New Tab"
                    >
                      <QrCode className="w-4 h-4 text-purple-500" />
                      <span>VIP Scanner Console ↗</span>
                    </a>

                    <a
                      href="https://unity101.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-xs"
                      title="Unity 101 Official Website in New Tab"
                    >
                      <Radio className="w-4 h-4 text-amber-500" />
                      <span>Unity 101 Official Site ↗</span>
                    </a>
                  </div>

                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0d121f]">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-rose-700 dark:text-rose-300 bg-rose-50/90 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-800/60 transition-all font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300 tracking-wide">Sign Out from Admin</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
