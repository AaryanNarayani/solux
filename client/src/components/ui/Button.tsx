import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { ButtonVariant } from '../../types';

interface ButtonProps extends ButtonVariant {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  className = '',
  type = 'button'
}: ButtonProps) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-500 to-teal-400 text-black hover:from-purple-400 hover:to-teal-300 focus:ring-purple-500",
    secondary: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 focus:ring-white/50",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5 focus:ring-gray-400"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm", 
    lg: "px-8 py-3 text-base"
  };

  const disabledClasses = disabled || loading 
    ? "opacity-50 cursor-not-allowed" 
    : "";

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <motion.button
      className={classes}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button; 