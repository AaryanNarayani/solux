import { motion } from 'framer-motion';
import { useState } from 'react';

interface TimestampDisplayProps {
  timestamp: number; // Unix timestamp in seconds
  className?: string;
  showRelative?: boolean;
  showAbsolute?: boolean;
}

const TimestampDisplay = ({ 
  timestamp, 
  className = '',
  showRelative = true,
  showAbsolute = true
}: TimestampDisplayProps) => {
  const [showFullDate, setShowFullDate] = useState(false);

  const getRelativeTime = (timestamp: number): string => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
    return `${Math.floor(diff / 31536000)}y ago`;
  };

  const getAbsoluteTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    if (showFullDate) {
      return date.toLocaleString();
    }
    return date.toLocaleDateString();
  };

  const relativeTime = getRelativeTime(timestamp);
  const absoluteTime = getAbsoluteTime(timestamp);

  if (showRelative && showAbsolute) {
    return (
      <motion.div
        className={`inline-flex flex-col text-sm ${className}`}
        onHoverStart={() => setShowFullDate(true)}
        onHoverEnd={() => setShowFullDate(false)}
      >
        <span className="text-gray-300">{relativeTime}</span>
        <span className="text-gray-500 text-xs">{absoluteTime}</span>
      </motion.div>
    );
  }

  if (showRelative) {
    return (
      <motion.span
        className={`text-sm text-gray-300 ${className}`}
        title={absoluteTime}
        whileHover={{ scale: 1.05 }}
      >
        {relativeTime}
      </motion.span>
    );
  }

  return (
    <motion.span
      className={`text-sm text-gray-300 ${className}`}
      onHoverStart={() => setShowFullDate(true)}
      onHoverEnd={() => setShowFullDate(false)}
      whileHover={{ scale: 1.05 }}
    >
      {absoluteTime}
    </motion.span>
  );
};

export default TimestampDisplay; 