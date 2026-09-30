'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Trash2,
  Settings,
  UserCheck,
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
  FileSpreadsheet,
  History,
  Plus,
  Sparkles,
  Download,
} from 'lucide-react';

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
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [guestCount, setGuestCount] = useState<number>(4);

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

  // Fetch quick metrics for sidebar widget
  useEffect(() => {
    async function loadQuickStats() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          if (data.metrics && data.metrics.totalRegistrations !== undefined) {
            setGuestCount(data.metrics.totalRegistrations);
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadQuickStats();
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
        { name: 'Trash & Recovery', href: '/admin/trash', icon: Trash2 },
        { name: 'System Activity Logs', href: '/admin/profile', icon: History },
      ],
    },
    {
      heading: 'SYSTEM CONFIG',
      items: [
        { name: 'Gala & SMTP Settings', href: '/admin/settings', icon: Settings },
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

  return (
    <div className="min-h-screen bg-[#f7f5fa] dark:bg-[#0e0517] flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 sm:w-72 bg-[#260636] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-purple-900/50 shadow-2xl overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 flex flex-col">
          {/* Brand Header */}
          <div className="p-4 sm:p-5 border-b border-purple-900/60 bg-[#1e052c] flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 relative bg-amber-400/10 rounded-xl p-1.5 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/images/unity101-logo.png"
                  alt="Unity 101"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="font-serif-brand font-bold text-sm tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors">
                    UNITY 101
                  </h1>
                  <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    20Y
                  </span>
                </div>
                <p className="text-[10px] text-purple-200 tracking-wider uppercase font-semibold">
                  Community Radio Events
                </p>
              </div>
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
          <div className="px-4 pt-4 pb-2">
            <Link
              href="/admin/registrations"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Register New Guest</span>
            </Link>
          </div>

          {/* Categorized Navigation links */}
          <nav className="p-3 space-y-4 flex-1">
            {navSections.map((section) => (
              <div key={section.heading} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-purple-300/60 uppercase tracking-widest">
                  {section.heading}
                </p>
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
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#5a1682] to-[#481268] text-white border border-amber-400/40 shadow-md font-bold'
                          : 'text-purple-200 hover:bg-purple-900/40 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-purple-300'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded-full shadow-xs shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}

            {/* Quick Export Action */}
            <div className="pt-2">
              <a
                href="/api/admin/export"
                download
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Full CSV</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider bg-amber-400/20 px-1.5 py-0.5 rounded font-mono">
                  LIVE
                </span>
              </a>
            </div>
          </nav>

          {/* Mini Station Status Widget in Sidebar */}
          <div className="m-3 p-3 rounded-xl bg-[#1c0429] border border-purple-900/60 text-xs">
            <div className="flex items-center justify-between text-purple-300 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Venue Milestone</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">{guestCount} / 500</span>
            </div>
            <div className="w-full bg-purple-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(3, (guestCount / 500) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-900/40 text-[10px] text-purple-300">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-300 font-medium">101.1 FM Live</span>
              </span>
              <span className="text-slate-400">Aiven Cloud</span>
            </div>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3.5 border-t border-purple-900/60 bg-[#1e052c] shrink-0">
          <div className="flex items-center space-x-2.5 mb-2.5 px-1.5 py-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center uppercase shrink-0 shadow-xs">
              {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Administrator'}</p>
              <p className="text-[10px] text-purple-300 truncate">{currentUser?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href="/register"
              target="_blank"
              className="inline-flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-200 hover:text-white text-[11px] font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Public Form</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-200 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#170a24]/95 backdrop-blur border-b border-purple-100/80 dark:border-purple-900/60 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-purple-900 dark:text-purple-200 p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <span>{title}</span>
              </h2>
            </div>
          </div>

          {/* Quick status pill, Theme Toggle & User profile shortcut */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/60 text-purple-900 dark:text-amber-300 hover:bg-purple-100 dark:hover:bg-purple-800/80 border border-purple-200/80 dark:border-purple-700/80 transition-all cursor-pointer shadow-xs flex items-center space-x-1.5 text-xs font-semibold"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-purple-800" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center space-x-2 bg-purple-50 dark:bg-purple-950/80 border border-purple-200/70 dark:border-purple-800 text-purple-900 dark:text-purple-200 px-3 py-1 rounded-full text-xs font-medium">
              <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Unity 101 Radio 101.1 FM</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Aiven MySQL Live</span>
            </div>

            <Link
              href="/admin/profile"
              className="flex items-center space-x-2 p-1 pl-2 pr-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/40 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all text-xs font-semibold text-slate-800 dark:text-purple-100"
              title="Admin Profile & Settings"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="hidden lg:inline-block max-w-[120px] truncate text-slate-700 dark:text-purple-200">
                {currentUser?.name || 'Admin'}
              </span>
            </Link>
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
