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

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Registrations', href: '/admin/registrations', icon: Users },
    { name: 'Trash & Recovery', href: '/admin/trash', icon: Trash2 },
    { name: 'Event Settings', href: '/admin/settings', icon: Settings },
    { name: 'Admin Profile', href: '/admin/profile', icon: UserCheck },
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
    <div className="min-h-screen bg-[#f7f5fa] flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#2b083e] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-purple-900/40 shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-purple-900/60 flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 relative bg-amber-400/10 rounded-lg p-1 border border-amber-400/30 flex items-center justify-center shrink-0">
                <Image
                  src="/images/unity101-logo.png"
                  alt="Unity 101"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="font-serif-brand font-bold text-sm tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors">
                  UNITY 101
                </h1>
                <p className="text-[10px] text-purple-200 tracking-wider uppercase font-semibold">
                  Event Management
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

          {/* Navigation links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-600/30'
                      : 'text-purple-200 hover:bg-purple-900/50 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-purple-300'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-purple-900/60 bg-[#220532]">
          <div className="flex items-center space-x-3 mb-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-purple-800 border border-purple-600 flex items-center justify-center text-amber-300 font-bold text-xs uppercase shrink-0">
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
              className="inline-flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white text-[11px] font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Public Form</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-200 text-[11px] font-medium transition-colors"
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
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-purple-100/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-purple-900 p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>{title}</span>
              </h2>
            </div>
          </div>

          {/* Quick status pill & User profile shortcut */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-purple-50 border border-purple-200/70 text-purple-900 px-3 py-1 rounded-full text-xs font-medium">
              <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Unity 101 Radio 99.8 FM</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>MySQL Live</span>
            </div>

            <Link
              href="/admin/profile"
              className="flex items-center space-x-2 p-1 pl-2 pr-2.5 rounded-xl hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-all text-xs font-semibold text-slate-800"
              title="Admin Profile & Settings"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="hidden lg:inline-block max-w-[120px] truncate text-slate-700">
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
