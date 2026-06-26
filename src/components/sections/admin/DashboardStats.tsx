'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  stats: Record<string, number> | null;
  isLoading: boolean;
}

const STATUS_METRICS = [
  { status: 'SUBMITTED', label: 'Submitted', color: 'blue', icon: '📩' },
  { status: 'UNDER_REVIEW', label: 'Under Review', color: 'amber', icon: '🔍' },
  { status: 'DOCUMENTS_PENDING', label: 'Docs Pending', color: 'orange', icon: '📂' },
  { status: 'PAYMENT_PENDING', label: 'Payment Pending', color: 'indigo', icon: '💳' },
  { status: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed', color: 'violet', icon: '✅' },
  { status: 'APPROVED', label: 'Approved', color: 'emerald', icon: '✨' },
  { status: 'REJECTED', label: 'Rejected', color: 'red', icon: '❌' }
];

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const cardStyles = (color: string) => {
    switch (color) {
      case 'emerald': return 'border-emerald-200 bg-emerald-50/20 text-emerald-800';
      case 'amber': return 'border-amber-200 bg-amber-50/20 text-amber-800';
      case 'orange': return 'border-orange-200 bg-orange-50/20 text-orange-800';
      case 'blue': return 'border-blue-200 bg-blue-50/20 text-blue-800';
      case 'indigo': return 'border-indigo-200 bg-indigo-50/20 text-indigo-800';
      case 'violet': return 'border-violet-200 bg-violet-50/20 text-violet-800';
      case 'red': return 'border-red-200 bg-red-50/20 text-red-800';
      default: return 'border-outline-variant/30 bg-surface-container-lowest text-on-surface';
    }
  };

  const countBadgeStyles = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500 text-white';
      case 'amber': return 'bg-amber-500 text-white';
      case 'orange': return 'bg-orange-500 text-white';
      case 'blue': return 'bg-blue-500 text-white';
      case 'indigo': return 'bg-indigo-500 text-white';
      case 'violet': return 'bg-violet-500 text-white';
      case 'red': return 'bg-red-500 text-white';
      default: return 'bg-outline-variant text-on-surface';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 animate-fade-in">
      {STATUS_METRICS.map((metric) => {
        const count = stats ? (stats[metric.status] || 0) : 0;
        
        return (
          <div
            key={metric.status}
            className={cn(
              "border rounded-2xl p-4 flex flex-col items-center justify-between text-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md select-none",
              cardStyles(metric.color)
            )}
          >
            <div className="space-y-1">
              <span className="text-xl block">{metric.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-wider opacity-85 block">
                {metric.label}
              </span>
            </div>
            
            <div className="mt-1">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-outline-variant/30 animate-pulse mx-auto" />
              ) : (
                <span className={cn(
                  "inline-flex items-center justify-center w-8 h-8 rounded-full text-label-md font-black shadow-sm",
                  countBadgeStyles(metric.color)
                )}>
                  {count}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
