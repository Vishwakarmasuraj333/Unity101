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
  const [guestCount, setGuestCount] = useState<number>(4);
  const [recentNotifications, setRecentNotifications] = useState<Registration[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Helper for human-readable relative time
  const formatRelativeTime = (dateStr?: string | Date) => {
    if (!dateStr) return 'Recently';
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);
      if (diffSec < 45) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return past.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return 'Recently';
    }
  };

  // Header Dropdown States
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync theme with localStorage & system preference
  useEffect(() => {
    const saved = localStorage.getItem('unity101_admin_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    const savedCollapsed = localStorage.getItem('unity101_sidebar_collapsed');
    if (savedCollapsed === 'true') {
      setIsCollapsed(true);
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
        localStorage.setItem('unity101_admin_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
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
            setRecentNotifications(data.recentRegistrations.slice(0, 6));
            setUnreadCount(data.recentRegistrations.slice(0, 6).length);
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    loadQuickStats();

    // Auto-poll every 25 seconds for live notifications feed
    const pollTimer = setInterval(loadQuickStats, 25000);
    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [pathname]);

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
        { name: 'Dashboard & Analytics', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'All Registrations', href: '/admin/registrations', icon: Users, badge: guestCount },
        { name: 'Veg Catering Choice', href: '/admin/registrations?food=Veg+Food', icon: Salad },
        { name: 'Non-Veg Catering', href: '/admin/registrations?food=Non+Veg+Food', icon: Drumstick },
      ],
    },
    {
      heading: 'REPORTS & DATA',
      items: [
        { name: 'Trash & Archival', href: '/admin/trash', icon: Trash2 },
        { name: 'System Activity Logs', href: '/admin/profile', icon: History },
      ],
    },
    {
      heading: 'SYSTEM CONFIG',
      items: [
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
              <div className="w-9 h-9 relative bg-amber-400/10 rounded-xl p-1.5 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/images/unity101-logo.png"
                  alt="Unity 101"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <h1 className="font-serif-brand font-bold text-sm tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors">
                      UNITY 101
                    </h1>
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      GALA
                    </span>
                  </div>
                  <p className="text-[10px] text-purple-200 tracking-wider uppercase font-semibold">
                    Community Radio 99.8 FM
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
                      onClick={() => setSidebarOpen(false)}
                      title={item.name}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs tracking-wide transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#5a1682] to-[#481268] text-white border border-purple-400/50 shadow-md font-bold'
                          : 'text-slate-200 hover:bg-white/10 hover:text-white font-medium'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-300'}`} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!isCollapsed && item.badge !== undefined && (
                        <span className="text-[10px] bg-purple-900/90 text-purple-200 border border-purple-700/60 font-bold px-2 py-0.5 rounded-full shadow-xs shrink-0 font-mono">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}

            {/* Quick Export Hub */}
            <div className="pt-2">
              {!isCollapsed ? (
                <div className="p-2.5 rounded-xl bg-white/5 border border-purple-800/40 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-purple-200 uppercase tracking-wider px-1">
                    <span className="flex items-center space-x-1.5">
                      <Download className="w-3.5 h-3.5 text-purple-300" />
                      <span>Download Manifest</span>
                    </span>
                    <span className="bg-purple-900/80 text-purple-200 border border-purple-700/60 px-1.5 py-0.5 rounded text-[8px] font-mono">LIVE</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <a
                      href="/api/admin/export?format=excel"
                      download
                      title="Download Formatted Excel (.xlsx)"
                      className="py-1.5 px-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 text-purple-200 hover:text-white text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center space-x-0.5"
                    >
                      <span>.XLSX</span>
                    </a>
                    <a
                      href="/api/admin/export?format=pdf"
                      download
                      title="Download Official PDF (.pdf)"
                      className="py-1.5 px-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 text-purple-200 hover:text-white text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center space-x-0.5"
                    >
                      <span>.PDF</span>
                    </a>
                    <a
                      href="/api/admin/export?format=csv"
                      download
                      title="Download Universal CSV (.csv)"
                      className="py-1.5 px-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 text-purple-200 hover:text-white text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center space-x-0.5"
                    >
                      <span>.CSV</span>
                    </a>
                  </div>
                </div>
              ) : (
                <a
                  href="/api/admin/export?format=excel"
                  download
                  title="Export Excel Manifest"
                  className="flex items-center justify-center p-2 rounded-xl text-purple-200 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/50 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-purple-300" />
                </a>
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
            <Link
              href="/register"
              target="_blank"
              title="Open Public Registration Form"
              className="inline-flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-100 hover:text-white text-xs font-semibold transition-colors border border-slate-700/60"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              {!isCollapsed && <span>Public</span>}
            </Link>

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
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between shadow-xs transition-colors">
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-700 dark:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Left Header Title & Logo */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 relative rounded-xl bg-amber-400/10 border border-amber-400/30 p-1 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/images/unity101-logo.png"
                  alt="Unity 101"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-1.5">
                  <span>{title}</span>
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                  Unity 101 Community Radio Portal
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Controls: Notification Feed, Theme Switcher, Radio Badges, Profile & Sign Out */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Registration Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
                  notificationsOpen
                    ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-amber-400 border-purple-300 dark:border-purple-700 ring-2 ring-purple-400/30'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                }`}
                title="Registration Alerts & Live Activity"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-extrabold text-[9px] shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 sm:right-auto sm:left-auto mt-2 w-80 sm:w-96 bg-white dark:bg-[#111625] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {/* Dropdown Header */}
                  <div className="p-3.5 bg-gradient-to-r from-[#2f0846] to-[#481268] text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <h4 className="font-bold text-xs tracking-wide">Registration Notifications</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => setUnreadCount(0)}
                          className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <span className="text-[10px] bg-purple-900 text-purple-200 border border-purple-700/80 px-2 py-0.5 rounded-full font-mono font-bold">
                        Live
                      </span>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-84 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {recentNotifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">
                          No recent registration alerts
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          New guest submissions will appear here automatically
                        </p>
                      </div>
                    ) : (
                      recentNotifications.map((reg) => (
                        <Link
                          key={reg.id}
                          href={`/admin/registrations/${reg.id}`}
                          onClick={() => {
                            setNotificationsOpen(false);
                            setUnreadCount((c) => Math.max(0, c - 1));
                          }}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start space-x-2.5 block group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#481268] dark:text-purple-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-purple-200 dark:border-purple-800">
                            #{reg.id}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                {reg.first_name} {reg.last_name}
                              </p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 ml-1">
                                {formatRelativeTime(reg.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80"
                              >
                                {reg.food_preference}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {reg.town || 'No town'}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                              reg.status === 'confirmed'
                                ? 'bg-purple-900/60 text-purple-200 border border-purple-700'
                                : reg.status === 'cancelled'
                                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                : 'bg-purple-950 text-purple-300 border border-purple-800'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 bg-slate-50 dark:bg-[#0d121f] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Total: <strong className="text-slate-800 dark:text-slate-200">{guestCount}</strong> registered
                    </span>
                    <Link
                      href="/admin/registrations"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center space-x-1"
                    >
                      <span>View All Registrations</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Segmented Light / Dark Mode Toggle Switch (Clear active state) */}
            <div
              onClick={toggleTheme}
              className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs select-none"
              title={isDarkMode ? 'Active: Dark Mode (Click to switch to Light Mode)' : 'Active: Light Mode (Click to switch to Dark Mode)'}
            >
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isDarkMode
                    ? 'bg-white text-purple-950 shadow-xs border border-slate-200/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Light</span>
              </div>
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  isDarkMode
                    ? 'bg-[#161e31] text-amber-300 shadow-xs border border-slate-700/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Dark</span>
              </div>
            </div>

            {/* Radio Station Badge */}
            <div className="hidden xl:flex items-center space-x-2 bg-purple-950/40 border border-purple-800/60 text-purple-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs">
              <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Unity 101 Radio 99.8 FM</span>
            </div>

            {/* System Status Pill */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>System Connected</span>
            </div>

            {/* Profile Avatar & Header Dropdown Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center space-x-2 p-1 pl-1.5 pr-2 rounded-xl transition-all text-xs font-semibold cursor-pointer border ${
                  userDropdownOpen
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                }`}
                title="Admin Account Profile"
              >
                <div className="w-7 h-7 relative rounded-lg bg-amber-400/20 border border-amber-400/40 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                  <Image
                    src="/images/unity101-logo.png"
                    alt="Unity 101 Admin"
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight max-w-[120px]">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.name || 'Unity 101 Admin'}
                  </span>
                  <span className="text-[10px] text-purple-400 dark:text-purple-300 font-bold uppercase tracking-wider">
                    Super Admin
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-68 bg-white dark:bg-[#111625] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0d121f] flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-700/60 p-1 flex items-center justify-center shrink-0 shadow-xs">
                      <Image
                        src="/images/unity101-logo.png"
                        alt="Unity 101"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {currentUser?.name || 'Unity 101 Admin'}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                        {currentUser?.email || 'admin@unity101events.org'}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-purple-900/30 text-purple-300 border border-purple-700/50 font-bold text-[9px] uppercase">
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

                    <Link
                      href="/register"
                      target="_blank"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>Public Registration Form</span>
                    </Link>
                  </div>

                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0d121f]">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/40 transition-colors font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from Admin</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Header Sign Out Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-900/60 text-purple-200 hover:text-white border border-purple-700/50 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Sign Out from Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
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
