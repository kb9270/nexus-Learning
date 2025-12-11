import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  onClick?: () => void;
  cta?: string; // Call to action text (optional)
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, colorClass, onClick, cta }) => {
  return (
    <div 
        onClick={onClick}
        className={`bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between shadow-lg transition-all ${onClick ? 'cursor-pointer hover:border-indigo-500 hover:shadow-indigo-500/10 group' : 'hover:border-slate-600'}`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full bg-opacity-20 transition-transform group-hover:scale-110 ${colorClass.replace('text-', 'bg-')}`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
        </div>
      </div>
      
      {cta && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded">
              {cta}
          </div>
      )}
    </div>
  );
};