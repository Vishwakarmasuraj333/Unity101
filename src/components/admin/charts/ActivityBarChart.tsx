'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { DailyActivityItem } from '@/types';

interface ActivityBarChartProps {
  data: DailyActivityItem[];
  loading?: boolean;
}

export default function ActivityBarChart({ data, loading }: ActivityBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (loading || !data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs h-full animate-pulse flex flex-col justify-between">
        <div className="h-5 w-48 bg-slate-200 rounded mb-4" />
        <div className="h-44 bg-slate-100 rounded" />
        <div className="h-6 w-full bg-slate-100 rounded mt-3" />
      </div>
    );
  }

  const counts = data.map((d) => d.count);
  const maxCount = Math.max(...counts, 5); // At least 5 for pleasant scale
  const totalInPeriod = counts.reduce((a, b) => a + b, 0);
  const todayCount = data[data.length - 1]?.count || 0;

  // Chart coordinate constants
  const chartHeight = 140;
  const chartWidth = 360;
  const barGap = 16;
  const totalBars = data.length;
  const barWidth = Math.max(16, (chartWidth - (totalBars - 1) * barGap) / totalBars);

  return (
    <div className="bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      {/* Header with Title and Summary Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#481268] flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Registration Velocity</h3>
            <p className="text-[11px] text-slate-400">7-Day signup trend diagram</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>Today: {todayCount}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-[#481268] font-semibold">
            7-Day Total: {totalInPeriod}
          </span>
        </div>
      </div>

      {/* SVG Bar Diagram */}
      <div className="relative w-full">
        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div
            className="absolute -top-10 z-20 transform -translate-x-1/2 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${((hoveredIndex + 0.5) / totalBars) * 100}%`,
            }}
          >
            <p className="font-bold text-amber-300">{data[hoveredIndex].count} Registrations</p>
            <p className="text-[10px] text-slate-300">{data[hoveredIndex].dayLabel}</p>
          </div>
        )}

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
          className="w-full h-44 overflow-visible"
        >
          <defs>
            {/* Active Bar Gradient */}
            <linearGradient id="barGradientActive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#481268" />
            </linearGradient>

            {/* Normal Bar Gradient */}
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>
          </defs>

          {/* Grid horizontal lines */}
          <line
            x1="0"
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={chartHeight / 2}
            x2={chartWidth}
            y2={chartHeight / 2}
            stroke="#f1f5f9"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <line
            x1="0"
            y1="10"
            x2={chartWidth}
            y2="10"
            stroke="#f1f5f9"
            strokeWidth="1"
            strokeDasharray="4,4"
          />

          {/* Bars */}
          {data.map((item, index) => {
            const barH = item.count > 0 ? Math.max(10, (item.count / maxCount) * (chartHeight - 20)) : 4;
            const x = index * (barWidth + barGap);
            const y = chartHeight - barH;
            const isHovered = hoveredIndex === index;

            return (
              <g
                key={item.date}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Background Hover Highlight Column */}
                <rect
                  x={x - barGap / 2}
                  y="0"
                  width={barWidth + barGap}
                  height={chartHeight}
                  fill="transparent"
                  className="hover:fill-purple-50/50 transition-colors"
                />

                {/* Actual Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="6"
                  ry="6"
                  fill={isHovered ? 'url(#barGradientActive)' : 'url(#barGradient)'}
                  className="transition-all duration-300"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 4px 10px rgba(126, 34, 206, 0.4))' : undefined,
                  }}
                />

                {/* Value on top of bar */}
                {item.count > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-700"
                  >
                    {item.count}
                  </text>
                )}

                {/* Bottom X-Axis Date Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 18}
                  textAnchor="middle"
                  className={`text-[9px] font-medium transition-colors ${
                    isHovered ? 'fill-[#481268] font-bold' : 'fill-slate-400'
                  }`}
                >
                  {item.dayLabel.split(' ')[0]}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 29}
                  textAnchor="middle"
                  className={`text-[8px] transition-colors ${
                    isHovered ? 'fill-slate-700 font-semibold' : 'fill-slate-300'
                  }`}
                >
                  {item.dayLabel.split(' ')[1] || ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
        <span className="flex items-center space-x-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>Timeline: Last 7 Days</span>
        </span>
        <span className="font-semibold text-purple-900">
          Peak: {Math.max(...counts)} on peak day
        </span>
      </div>
    </div>
  );
}
