import React from 'react';
import { InspectionStatus } from '../types/vehicle';
import { CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: InspectionStatus;
  label: string;
  section: string;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  label, 
  size = 'md'
}) => {
  const getStatusConfig = (status: InspectionStatus) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-100',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          iconColor: 'text-emerald-600'
        };
      case 'pending':
        return {
          icon: Clock,
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'needs-attention':
        return {
          icon: AlertTriangle,
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          iconColor: 'text-red-600'
        };
      case 'not-started':
        return {
          icon: Circle,
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          border: 'border-gray-200',
          iconColor: 'text-gray-400'
        };
    }
  };

  const getStatusLabel = (status: InspectionStatus) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'In Progress';
      case 'needs-attention':
        return 'Needs Attention';
      case 'not-started':
        return 'Not Started';
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm',
    lg: 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3 sm:w-4 sm:h-4',
    lg: 'w-4 h-4 sm:w-5 sm:h-5'
  };

  return (
    <div className={`
      inline-flex items-center gap-1 sm:gap-1.5 rounded-full border font-medium
      ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}
    `}>
      <Icon className={`${config.iconColor} ${iconSizes[size]} flex-shrink-0`} />
      <span className="truncate">{label}</span>
    </div>
  );
};

export default StatusBadge;