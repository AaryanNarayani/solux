import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchBarProps } from '../../types';
import Button from './Button';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search address · tx · block", 
  autoFocus = false,
  isQuerying = false 
}: SearchBarProps) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchResult, setSearchResult] = useState<{type: string, value: string, isValid: boolean} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Global keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isFocused && inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Validate search input
  const validateSearch = (value: string): {type: string, value: string, isValid: boolean} => {
    const trimmed = value.trim();
    
    // Solana address (base58, typically 32-44 characters)
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
      return { type: 'address', value: trimmed, isValid: true };
    }
    
    // Transaction signature (base58, typically 64-88 characters)
    if (/^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(trimmed)) {
      return { type: 'transaction', value: trimmed, isValid: true };
    }
    
    // Block/slot number (numeric)
    if (/^\d+$/.test(trimmed)) {
      return { type: 'block', value: trimmed, isValid: true };
    }
    
    return { type: 'address', value: trimmed, isValid: false };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (value.trim()) {
      const result = validateSearch(value);
      setSearchResult(result);
    } else {
      setSearchResult(null);
    }
  };

  const handleSearch = () => {
    if (searchValue.trim() && searchResult?.isValid) {
      const value = searchValue.trim();
      const type = searchResult.type;
      
      // Navigate to the appropriate detail page based on detected type
      switch (type) {
        case 'address':
          navigate(`/address/${value}`);
          break;
        case 'transaction':
          navigate(`/transaction/${value}`);
          break;
        case 'block':
          navigate(`/block/${value}`);
          break;
        default:
          // Fallback to search page
          navigate(`/search?q=${encodeURIComponent(value)}`);
      }
      
      // Also call the onSearch callback if provided (for Hero animation)
      if (onSearch) {
        onSearch(value);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isValid = searchResult?.isValid ?? true;
  const hasValue = searchValue.trim().length > 0;

  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isQuerying}
          className={`w-full px-6 py-6 bg-transparent border-b-2 text-white placeholder-gray-500 focus:outline-none transition-all duration-500 text-lg font-light cursor-text ${
            !isValid && hasValue
              ? 'border-red-400 placeholder-red-300'
              : isFocused || hasValue
              ? 'border-purple-400 placeholder-gray-400' 
              : 'border-gray-700 hover:border-gray-600'
          } ${isQuerying ? 'animate-pulse cursor-not-allowed' : ''}`}
        />
        
        {/* Gradient line under input */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5"
          style={{ 
            background: !isValid && hasValue
              ? 'linear-gradient(90deg, #DC2626, #EF4444)'
              : 'linear-gradient(90deg, #DC1FFF, #00FFA3, #00D1FF, #DC1FFF)' 
          }}
          initial={{ width: 0 }}
          animate={{ 
            width: isFocused || hasValue ? '100%' : '0%',
            opacity: isFocused || hasValue ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        
        {/* Search button */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: hasValue ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearch}
            disabled={isQuerying || !isValid || !hasValue}
            loading={isQuerying}
          >
            {isQuerying ? '' : 'Search'}
          </Button>
        </motion.div>
      </div>

      {/* Search type indicator */}
      {searchResult && hasValue && (
        <motion.div
          className="flex items-center justify-between mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isValid ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className={`text-sm ${
              isValid ? 'text-green-400' : 'text-red-400'
            }`}>
              {isValid 
                ? `${searchResult.type.charAt(0).toUpperCase() + searchResult.type.slice(1)} detected`
                : 'Invalid format'
              }
            </span>
          </div>
          
          {/* Keyboard shortcut hint */}
          <div className="text-xs text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs">Enter</kbd> to search
          </div>
        </motion.div>
      )}

      {/* Keyboard shortcut hint when empty */}
      {!hasValue && !isFocused && (
        <motion.p
          className="text-center mt-4 text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs">/</kbd> to focus search
        </motion.p>
      )}

      {/* Querying status */}
      {isQuerying && (
        <motion.p
          className="text-center mt-4 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Querying Solana blockchain...
        </motion.p>
      )}
    </motion.div>
  );
};

export default SearchBar; 