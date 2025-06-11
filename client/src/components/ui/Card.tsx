import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'glass' | 'highlighted';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const Card = ({ 
  children, 
  title, 
  subtitle, 
  className = '',
  variant = 'glass',
  padding = 'md',
  hover = false,
  onClick
}: CardProps) => {
  const variantClasses = {
    default: 'bg-gray-900/50 border-gray-700/50',
    glass: 'bg-white/3 border-white/10 backdrop-blur-xl',
    highlighted: 'bg-gradient-to-r from-purple-500/10 to-green-500/10 border-purple-500/20'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <motion.div
      className={`rounded-2xl border ${variantClasses[variant]} ${paddingClasses[padding]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        boxShadow: variant === 'glass' 
          ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
          : undefined
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-semibold text-white mb-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-gray-400 text-sm">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default Card; 