import { motion } from 'framer-motion';
import type { BadgeVariant, BadgeSize } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
}

const Badge = ({ 
  children, 
  variant = 'neutral', 
  size = 'md', 
  icon,
  className = '' 
}: BadgeProps) => {
  const variantClasses = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <motion.span
      className={`inline-flex items-center space-x-1.5 rounded-full border font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {icon && (
        <span className={iconSizes[size]}>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </motion.span>
  );
};

export default Badge; 