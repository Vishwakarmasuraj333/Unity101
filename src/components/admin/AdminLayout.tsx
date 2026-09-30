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
  History,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Database,
  Building,
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
  const [isCollapsed, setIsCollapsed] = useState(false);
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

    const savedCollapsed = localStorage.getItem('unity101_sidebar_collapsed');
    if (savedCollapsed === 'true') {
      setIsCollapsed(true);
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

  // Fetch live metrics for sidebar widget
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
        { name: 'Trash & Archival', href: '/admin/trash', icon: Trash2 },
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
              className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                isCollapsed ? 'px-2' : 'px-3 text-xs'
              }`}
              title="Add New Guest"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>+ Add New Guest</span>}
            </Link>
          </div>

          {/* Categorized Navigation links */}
          <nav className="p-2 space-y-4 flex-1">
            {navSections.map((section) => (
              <div key={section.heading} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-purple-300/50 uppercase tracking-widest">
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
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#5a1682] to-[#481268] text-white border border-amber-400/40 shadow-md font-bold'
                          : 'text-purple-200 hover:bg-white/10 hover:text-white'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-purple-300'}`} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!isCollapsed && item.badge !== undefined && (
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
                title="Export Verified Guest CSV"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Download className="w-4 h-4 text-amber-400 shrink-0" />
                  {!isCollapsed && <span>Export Guest CSV</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[9px] uppercase tracking-wider bg-amber-400/20 px-1.5 py-0.5 rounded font-mono font-bold">
                    LIVE
                  </span>
                )}
              </a>
            </div>
          </nav>

          {/* Venue Capacity Meter Widget */}
          {!isCollapsed && (
            <div className="m-3 p-3 rounded-xl bg-[#140420] border border-purple-900/50 text-xs">
              <div className="flex items-center justify-between text-purple-200 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                  <Building className="w-3 h-3 text-amber-400" />
                  <span>Venue Quota</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  {guestCount} / 500 ({capacityPct}%)
                </span>
              </div>
              <div className="w-full bg-purple-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, capacityPct)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-900/40 text-[10px] text-purple-300">
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-medium">99.8 FM On Air</span>
                </span>
                <span className="font-mono text-amber-300">{500 - guestCount} Remaining</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Collapse Toggle & User Profile Card */}
        <div className="p-3 border-t border-purple-900/60 bg-[#160624] shrink-0">
          {/* Desktop Collapse Toggle < > */}
          <div className="hidden md:flex justify-end mb-2">
            <button
              onClick={toggleCollapse}
              className="w-full py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-purple-800/40"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <>
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Collapse Menu</span>
                </>
              )}
            </button>
          </div>

          {!isCollapsed && (
            <div className="flex items-center space-x-2.5 mb-2.5 px-1 py-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center uppercase shrink-0 shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Administrator'}</p>
                <p className="text-[10px] text-purple-300 truncate">{currentUser?.email}</p>
              </div>
            </div>
          )}

          <div className={`grid gap-1.5 ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Link
              href="/register"
              target="_blank"
              title="Open Public Registration Form"
              className="inline-flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-200 hover:text-white text-[11px] font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              {!isCollapsed && <span>Public</span>}
            </Link>

            <button
              onClick={handleLogout}
              title="Secure Admin Logout"
              className="inline-flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-200 hover:text-white text-[11px] font-medium transition-colors cursor-pointer border border-red-800/40"
            >
              <LogOut className="w-3 h-3" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0d121f]/95 backdrop-blur border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs transition-colors">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-700 dark:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

          {/* Header Controls: Live status, Theme Toggle & Admin Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs flex items-center space-x-1.5 text-xs font-semibold"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            {/* Radio Station Pill */}
            <div className="hidden sm:flex items-center space-x-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-purple-900 dark:text-purple-200 px-3 py-1 rounded-full text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Unity 101 Radio 99.8 FM</span>
            </div>

            {/* System Status Pill */}
            <div className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Connected</span>
            </div>

            {/* Profile Avatar */}
            <Link
              href="/admin/profile"
              className="flex items-center space-x-2 p-1 pl-2 pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-xs font-semibold text-slate-800 dark:text-slate-100"
              title="Admin Profile & Security"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="hidden lg:inline-block max-w-[120px] truncate text-slate-700 dark:text-slate-200">
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
