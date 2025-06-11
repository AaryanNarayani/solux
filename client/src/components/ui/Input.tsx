import { motion } from 'framer-motion';
import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', error = false, helperText, className = '', onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-6 py-4 text-lg"
    };

    const baseClasses = "w-full bg-transparent border-b-2 text-white placeholder-gray-500 focus:outline-none transition-all duration-500 font-light";
    
    const stateClasses = error
      ? "border-red-400"
      : isFocused
      ? "border-purple-400 placeholder-gray-400"
      : "border-gray-700 hover:border-gray-600";

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          className={`${baseClasses} ${sizeClasses[size]} ${stateClasses} ${className}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {/* Gradient line under input */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5"
          style={{ 
            background: error 
              ? 'linear-gradient(90deg, #DC2626, #EF4444)' 
              : 'linear-gradient(90deg, #DC1FFF, #00FFA3, #00D1FF, #DC1FFF)' 
          }}
          initial={{ width: 0 }}
          animate={{ 
            width: isFocused ? '100%' : '0%',
            opacity: isFocused ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Helper text */}
        {helperText && (
          <p className={`mt-2 text-sm ${error ? 'text-red-400' : 'text-gray-400'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 