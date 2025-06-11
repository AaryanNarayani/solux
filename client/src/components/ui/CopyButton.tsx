import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface CopyButtonProps {
  text: string;
  label?: string;
  showText?: boolean;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CopyButton = ({ 
  text, 
  label = 'Copy', 
  showText = false, 
  variant = 'icon',
  size = 'lg',
  className = '' 
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs p-1',
    md: 'w-5 h-5 text-sm p-1.5',
    lg: 'w-8 h-8 text-base p-2'
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied to clipboard!`, {
        duration: 2000,
        style: {
          background: 'rgba(20, 241, 149, 0.1)',
          border: '1px solid rgba(20, 241, 149, 0.3)',
          color: '#14F195',
        },
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard', {
        style: {
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          color: '#ff6b6b',
        },
      });
    }
  };

  if (variant === 'button') {
    return (
      <motion.button
        onClick={handleCopy}
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200 ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg
          className={sizeClasses[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {copied ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          )}
        </svg>
        {showText && (
          <span className="text-sm text-gray-300">
            {copied ? 'Copied!' : label}
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleCopy}
      className={`text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={`Copy ${label.toLowerCase()}`}
    >
      <svg
        className={sizeClasses[size]}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {copied ? (
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        )}
      </svg>
    </motion.button>
  );
};

export default CopyButton; 