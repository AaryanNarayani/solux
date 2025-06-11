import { motion } from 'framer-motion';

interface AddressDisplayProps {
  address: string;
  label?: string;
  truncate?: 'start' | 'middle' | 'end' | 'none';
  showCopy?: boolean;
  className?: string;
  onClick?: () => void;
}

const AddressDisplay = ({ 
  address, 
  label,
  truncate = 'none',
  className = '',
  onClick
}: AddressDisplayProps) => {
  const truncateAddress = (addr: string, type: typeof truncate): string => {
    if (type === 'none') return addr;
    if (addr.length <= 16) return addr;

    switch (type) {
      case 'start':
        return `...${addr.slice(-8)}`;
      case 'end':
        return `${addr.slice(0, 8)}...`;
      case 'middle':
      default:
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
  };

  const displayAddress = truncateAddress(address, truncate);

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      {label && (
        <span className="text-gray-400 text-sm">
          {label}:
        </span>
      )}
      
      <motion.span
        className={`font-mono text-sm ${onClick ? 'cursor-pointer hover:text-purple-400' : 'text-gray-300'} transition-colors duration-200`}
        onClick={onClick}
        whileHover={onClick ? { scale: 1.02 } : undefined}
        title={address}
      >
        {displayAddress}
      </motion.span>

      {/* {showCopy && (
        <CopyButton 
          text={address} 
          label={label || 'Address'}
          size="sm"
        />
      )} */}
    </div>
  );
};

export default AddressDisplay; 