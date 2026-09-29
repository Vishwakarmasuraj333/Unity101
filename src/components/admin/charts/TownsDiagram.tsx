'use client';

import React from 'react';
import { MapPin, Users } from 'lucide-react';
import { TownDistributionItem } from '@/types';

interface TownsDiagramProps {
  towns: TownDistributionItem[];
  totalRegistrations: number;
  loading?: boolean;
}

export default function TownsDiagram({ towns, totalRegistrations, loading }: TownsDiagramProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs h-full animate-pulse flex flex-col justify-between">
        <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const defaultTowns: TownDistributionItem[] = towns.length > 0 ? towns : [
    { town: 'Southampton', count: 0, percentage: 0 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Geographic Reach</h3>
            <p className="text-[11px] text-slate-400">Top guest registration localities</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
          {towns.length} Localities
        </span>
      </div>

      {/* Towns Diagram List */}
      <div className="space-y-3 my-1">
        {defaultTowns.map((item, index) => {
          // Color coding for top towns
          const barColors = [
            'from-[#481268] to-[#7e22ce]', // 1st
            'from-amber-500 to-amber-600',   // 2nd
            'from-emerald-500 to-emerald-600', // 3rd
            'from-blue-500 to-blue-600',     // 4th
            'from-purple-400 to-purple-500', // 5th
          ];
          const colorClass = barColors[index % barColors.length];

          return (
            <div
              key={item.town}
              className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-purple-200 transition-all group"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 rounded-full bg-slate-200 group-hover:bg-[#481268] group-hover:text-white text-[9px] font-bold text-slate-600 flex items-center justify-center transition-colors">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-900 group-hover:text-[#481268] transition-colors">
                    {item.town}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {item.count} guests
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Diagram */}
              <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
                  style={{ width: `${Math.max(6, item.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
        <span className="flex items-center space-x-1">
          <Users className="w-3 h-3 text-slate-400" />
          <span>Active Hampshire postcodes</span>
        </span>
        <span className="font-semibold text-emerald-800">
          {totalRegistrations} total guests mapped
        </span>
      </div>
    </div>
  );
}
