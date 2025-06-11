import { motion } from 'framer-motion';
import { useState } from 'react';
import type { TabItem } from '../../types';

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
  variant?: 'default' | 'pills';
  onChange?: (tabId: string) => void;
}

const Tabs = ({ 
  items, 
  defaultTab, 
  className = '',
  variant = 'default',
  onChange
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const activeItem = items.find(item => item.id === activeTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const tabVariants = {
    default: {
      container: 'border-b border-white/10',
      tab: 'px-4 py-3 border-b-2 border-transparent text-gray-400 hover:text-white transition-colors duration-200',
      activeTab: 'border-purple-500 text-white',
      content: 'py-6'
    },
    pills: {
      container: 'bg-white/5 rounded-xl p-1',
      tab: 'px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-all duration-200 relative',
      activeTab: 'text-white',
      content: 'py-6'
    }
  };

  const currentVariant = tabVariants[variant];

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={`flex space-x-1 ${currentVariant.container}`}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && handleTabChange(item.id)}
            disabled={item.disabled}
            className={`
              ${currentVariant.tab}
              ${activeTab === item.id ? currentVariant.activeTab : ''}
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {variant === 'pills' && activeTab === item.id && (
              <motion.div
                className="absolute inset-0 bg-white/10 rounded-lg"
                layoutId="activeTab"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={currentVariant.content}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeItem?.content}
        </motion.div>
      </div>
    </div>
  );
};

export default Tabs; 