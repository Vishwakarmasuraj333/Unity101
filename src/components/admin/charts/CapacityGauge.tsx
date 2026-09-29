'use client';

import React from 'react';
import { Award, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import { CapacityMetrics } from '@/types';

interface CapacityGaugeProps {
  capacity: CapacityMetrics;
  loading?: boolean;
}

export default function CapacityGauge({ capacity, loading }: CapacityGaugeProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs animate-pulse">
        <div className="h-5 w-48 bg-slate-200 rounded mb-3" />
        <div className="h-3 bg-slate-100 rounded mb-2" />
        <div className="h-4 w-32 bg-slate-100 rounded" />
      </div>
    );
  }

  const { target, registered, percentFilled, remaining } = capacity;
  const isNearlyFull = percentFilled >= 80;

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/30 to-amber-50/20 rounded-2xl border border-purple-100/80 p-5 shadow-xs hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#481268] flex items-center justify-center">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Venue Capacity & Milestones</h3>
            <p className="text-[11px] text-slate-500">20th Anniversary Gala hall quota</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-900 font-serif-brand">
            {registered} / {target} Seats
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isNearlyFull
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-purple-100 text-purple-900'
            }`}
          >
            {percentFilled}% Filled
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full bg-slate-200/80 h-3.5 rounded-full overflow-hidden p-0.5 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            percentFilled >= 90
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600'
              : 'bg-gradient-to-r from-[#481268] via-purple-600 to-amber-400'
          }`}
          style={{ width: `${Math.min(100, Math.max(3, percentFilled))}%` }}
        />
      </div>

      {/* Milestone checkpoints below track */}
      <div className="flex items-center justify-between mt-2.5 text-[11px]">
        <span className="flex items-center space-x-1 text-slate-500">
          <Users className="w-3 h-3 text-purple-600" />
          <span>{remaining} seats remaining</span>
        </span>

        {isNearlyFull ? (
          <span className="flex items-center space-x-1 text-amber-700 font-semibold">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>High demand — nearing venue limit</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Admissions open and welcoming</span>
          </span>
        )}
      </div>
    </div>
  );
}
