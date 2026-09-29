'use client';

import React, { useState } from 'react';
import { Salad, Drumstick, Utensils } from 'lucide-react';

interface FoodPieChartProps {
  vegCount: number;
  nonVegCount: number;
  loading?: boolean;
}

export default function FoodPieChart({ vegCount, nonVegCount, loading }: FoodPieChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<'veg' | 'non-veg' | null>(null);

  const total = vegCount + nonVegCount;
  const vegPercent = total > 0 ? Math.round((vegCount / total) * 100) : 0;
  const nonVegPercent = total > 0 ? 100 - vegPercent : 0;

  // Donut geometry (radius = 70, circumference = 2 * PI * 70 = 439.82)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const vegStrokeDash = (vegPercent / 100) * circumference;
  const nonVegStrokeDash = (nonVegPercent / 100) * circumference;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs flex flex-col justify-between h-full animate-pulse">
        <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
        <div className="w-48 h-48 rounded-full bg-slate-100 mx-auto" />
        <div className="h-10 bg-slate-100 rounded mt-4" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Utensils className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Meal Preferences</h3>
            <p className="text-[11px] text-slate-400">Live catering distribution</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#481268]">
          {total} Servings
        </span>
      </div>

      {/* SVG Donut Chart */}
      <div className="relative flex items-center justify-center my-3">
        <svg
          viewBox="0 0 200 200"
          className="w-48 h-48 transform -rotate-90 filter drop-shadow-sm transition-transform duration-300"
        >
          {/* Background Ring */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#f1f1f5"
            strokeWidth="24"
          />

          {total === 0 ? (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="24"
              strokeDasharray="4,4"
            />
          ) : (
            <>
              {/* Veg Segment (Amber / Gold) */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="url(#vegGradient)"
                strokeWidth={hoveredSegment === 'veg' ? 28 : 24}
                strokeDasharray={`${vegStrokeDash} ${circumference}`}
                strokeDashoffset="0"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('veg')}
                onMouseLeave={() => setHoveredSegment(null)}
              />

              {/* Non-Veg Segment (Orange / Coral) */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="url(#nonVegGradient)"
                strokeWidth={hoveredSegment === 'non-veg' ? 28 : 24}
                strokeDasharray={`${nonVegStrokeDash} ${circumference}`}
                strokeDashoffset={-vegStrokeDash}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment('non-veg')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            </>
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="vegGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="nonVegGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Text in Donut Hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {hoveredSegment === 'veg' ? (
            <div className="animate-in fade-in duration-200">
              <span className="text-[11px] font-bold text-amber-600 block uppercase tracking-wide">
                Veg Food
              </span>
              <span className="text-2xl font-extrabold text-slate-900 font-serif-brand">
                {vegPercent}%
              </span>
              <span className="text-[10px] text-slate-400 block">{vegCount} guests</span>
            </div>
          ) : hoveredSegment === 'non-veg' ? (
            <div className="animate-in fade-in duration-200">
              <span className="text-[11px] font-bold text-orange-600 block uppercase tracking-wide">
                Non-Veg
              </span>
              <span className="text-2xl font-extrabold text-slate-900 font-serif-brand">
                {nonVegPercent}%
              </span>
              <span className="text-[10px] text-slate-400 block">{nonVegCount} guests</span>
            </div>
          ) : (
            <div>
              <span className="text-2xl font-bold text-slate-900 font-serif-brand">
                {total}
              </span>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                Total Meals
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Legend with Stats */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
        <div
          onMouseEnter={() => setHoveredSegment('veg')}
          onMouseLeave={() => setHoveredSegment(null)}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            hoveredSegment === 'veg'
              ? 'bg-amber-50/80 border-amber-300 shadow-xs scale-[1.02]'
              : 'bg-slate-50 border-slate-200/80 hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center space-x-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-800">Veg Food</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-amber-700 font-serif-brand">{vegCount}</span>
            <span className="text-[11px] font-semibold text-slate-500">{vegPercent}%</span>
          </div>
        </div>

        <div
          onMouseEnter={() => setHoveredSegment('non-veg')}
          onMouseLeave={() => setHoveredSegment(null)}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            hoveredSegment === 'non-veg'
              ? 'bg-orange-50/80 border-orange-300 shadow-xs scale-[1.02]'
              : 'bg-slate-50 border-slate-200/80 hover:bg-orange-50/50'
          }`}
        >
          <div className="flex items-center space-x-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-800">Non Veg</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-orange-700 font-serif-brand">{nonVegCount}</span>
            <span className="text-[11px] font-semibold text-slate-500">{nonVegPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
