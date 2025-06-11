import { motion } from 'framer-motion';
import type { TokenHolding } from '../../types';

interface TokenBalanceProps {
  token: TokenHolding;
  showUsdValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const TokenBalance = ({ 
  token, 
  showUsdValue = true,
  size = 'md',
  className = '',
  onClick
}: TokenBalanceProps) => {
  const sizeClasses = {
    sm: {
      container: 'p-3',
      logo: 'w-8 h-8',
      text: 'text-sm',
      amount: 'text-base'
    },
    md: {
      container: 'p-4',
      logo: 'w-10 h-10',
      text: 'text-sm',
      amount: 'text-lg'
    },
    lg: {
      container: 'p-6',
      logo: 'w-12 h-12',
      text: 'text-base',
      amount: 'text-xl'
    }
  };

  const formatAmount = (amount: number, decimals: number): string => {
    const value = amount / Math.pow(10, decimals);
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    } else if (value >= 1) {
      return value.toFixed(4);
    } else {
      return value.toFixed(6);
    }
  };

  const formatUsdValue = (usd?: number): string => {
    if (!usd) return '$0.00';
    
    if (usd >= 1000000) {
      return `$${(usd / 1000000).toFixed(2)}M`;
    } else if (usd >= 1000) {
      return `$${(usd / 1000).toFixed(2)}K`;
    } else {
      return `$${usd.toFixed(2)}`;
    }
  };

  const currentSize = sizeClasses[size];
  const formattedAmount = formatAmount(token.amount, token.decimals);
  const formattedUsd = formatUsdValue(token.usdValue);

  return (
    <motion.div
      className={`flex items-center space-x-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all duration-200 ${currentSize.container} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02, y: -1 } : undefined}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Token Logo */}
      <div className={`${currentSize.logo} rounded-full bg-gradient-to-br from-purple-500/20 to-green-500/20 flex items-center justify-center border border-white/10`}>
        {token.logoUri ? (
          <img 
            src={token.logoUri} 
            alt={token.symbol}
            className={`${currentSize.logo} rounded-full`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<span class="text-white font-bold">${token.symbol.charAt(0)}</span>`;
              }
            }}
          />
        ) : (
          <span className="text-white font-bold text-sm">
            {token.symbol.charAt(0)}
          </span>
        )}
      </div>

      {/* Token Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium text-white ${currentSize.text}`}>
              {token.symbol}
            </h4>
            <p className={`text-gray-400 ${size === 'sm' ? 'text-xs' : 'text-sm'} truncate`}>
              {token.name}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`font-semibold text-white ${currentSize.amount}`}>
              {formattedAmount}
            </div>
            {showUsdValue && token.usdValue && (
              <div className={`text-gray-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
                {formattedUsd}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TokenBalance; 