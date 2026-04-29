import React from 'react';
import { Info } from 'lucide-react';
import { motion } from 'motion/react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', id }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    id={id}
    className={`bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-black/5 overflow-hidden flex flex-col ${className}`}
  >
    <div className="px-4 py-3 border-b border-black/5">
      <h3 className="text-[13px] font-bold text-navy flex items-center gap-1.5 uppercase tracking-tight">
        {title}
      </h3>
    </div>
    <div className="p-4 flex-1">
      {children}
    </div>
  </motion.div>
);

interface MetricBoxProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  colorClass?: string;
  tooltip?: string;
  bgColor?: string;
}

export const MetricBox: React.FC<MetricBoxProps> = ({ label, value, unit, colorClass = 'text-slate-900', tooltip, bgColor }) => (
  <div className={`p-3 rounded-lg text-center flex flex-col justify-center items-center gap-1 ${bgColor || 'bg-slate-50'}`}>
    <div className="flex items-center gap-1">
      <span className={`text-[10px] font-bold uppercase tracking-wider opacity-80 ${colorClass}`}>{label}</span>
      {tooltip && (
        <div className="group relative">
          <Info className="w-3 h-3 opacity-40 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-[20px] font-bold leading-tight ${colorClass}`}>{value}</span>
      {unit && <span className={`text-[11px] font-semibold opacity-70 ${colorClass}`}>{unit}</span>}
    </div>
  </div>
);
