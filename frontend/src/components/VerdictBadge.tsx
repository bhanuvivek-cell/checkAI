import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Scale, 
  AlertTriangle 
} from 'lucide-react';
import { VerdictType } from '../types';

interface VerdictBadgeProps {
  verdict: VerdictType;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export const VERDICT_CONFIG: Record<VerdictType, {
  label: string;
  icon: React.ElementType;
  bgClass: string;
  textClass: string;
  borderClass: string;
  description: string;
  badgeGlow: string;
}> = {
  'SUPPORTED': {
    label: 'Supported',
    icon: CheckCircle2,
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    description: 'Available empirical evidence or established logic corroborates the claim.',
    badgeGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  },
  'CONTRADICTED': {
    label: 'Contradicted',
    icon: XCircle,
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
    description: 'Reliable evidence or empirical consensus directly conflicts with the statement.',
    badgeGlow: 'shadow-[0_0_15px_rgba(244,63,94,0.2)]',
  },
  'INSUFFICIENT EVIDENCE': {
    label: 'Insufficient Evidence',
    icon: HelpCircle,
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    description: 'Information is incomplete, untestable, or lacks verifiable documentation.',
    badgeGlow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
  },
  'CONTEXT DEPENDENT': {
    label: 'Context Dependent',
    icon: Scale,
    bgClass: 'bg-indigo-500/10',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/30',
    description: 'Validity hinges on individual constraints, goals, trade-offs, or circumstances.',
    badgeGlow: 'shadow-[0_0_15px_rgba(99,102,241,0.2)]',
  },
  'POTENTIALLY RISKY': {
    label: 'Potentially Risky',
    icon: AlertTriangle,
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/30',
    description: 'Proposed action exposes the user or system to severe downside or irreversible cost.',
    badgeGlow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]',
  },
};

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ 
  verdict, 
  size = 'md', 
  showDescription = false 
}) => {
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG['CONTEXT DEPENDENT'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-xs sm:text-sm gap-1.5',
    lg: 'px-4 py-2 text-sm sm:text-base gap-2 font-medium',
  };

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 20,
  };

  return (
    <div className="inline-flex flex-col">
      <div 
        className={`inline-flex items-center rounded-full border ${config.bgClass} ${config.textClass} ${config.borderClass} ${config.badgeGlow} ${sizeClasses[size]} transition-all`}
      >
        <Icon size={iconSizes[size]} className="shrink-0" />
        <span className="font-semibold tracking-wide uppercase">{config.label}</span>
      </div>
      {showDescription && (
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
          {config.description}
        </p>
      )}
    </div>
  );
};
