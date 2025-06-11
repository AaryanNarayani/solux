import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Logo from '../ui/Logo';

type Network = 'mainnet' | 'devnet';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('mainnet');

  const networks = [
    { 
      id: 'mainnet' as Network, 
      name: 'Mainnet', 
      description: 'Production network',
      dot: 'bg-green-400'
    },
    { 
      id: 'devnet' as Network, 
      name: 'Devnet', 
      description: 'Development network',
      dot: 'bg-orange-400'
    }
  ];

  const currentNetwork = networks.find(n => n.id === selectedNetwork);

  const handleNetworkChange = (network: Network) => {
    setSelectedNetwork(network);
    setIsNetworkDropdownOpen(false);
    // You can add network switching logic here
    console.log(`Switched to ${network}`);
  };

  return (
    <motion.header
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Desktop Navbar */}
      <motion.nav
        className="hidden md:flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo */}
        <Logo size="sm" />

        {/* GitHub Link */}
        <div className="flex items-center space-x-8 mx-8">
          <motion.a
            href="https://github.com/solux"
            className="text-gray-300 hover:text-white transition-colors duration-300 font-medium text-sm cursor-pointer flex items-center space-x-2"
            whileHover={{ y: -1 }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </motion.a>
        </div>

        {/* Network Switcher */}
        <div className="relative">
          <motion.button
            className="flex items-center cursor-pointer space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
            onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`w-2 h-2 rounded-full ${currentNetwork?.dot}`} />
            <span className="text-white text-sm font-medium">{currentNetwork?.name}</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isNetworkDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>

          {/* Network Dropdown */}
          <AnimatePresence>
            {isNetworkDropdownOpen && (
              <motion.div
                className="absolute top-full right-0 mt-2 w-56 rounded-xl backdrop-blur-xl bg-black/80 border border-white/10 shadow-2xl overflow-hidden"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                {networks.map((network) => (
                  <motion.button
                    key={network.id}
                    className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-white/5 transition-colors duration-200 cursor-pointer ${
                      selectedNetwork === network.id ? 'bg-white/5' : ''
                    }`}
                    onClick={() => handleNetworkChange(network.id)}
                    whileHover={{ x: 2 }}
                  >
                    <div className={`w-2 h-2 rounded-full ${network.dot}`} />
                    <div className="flex-1 text-left">
                      <div className="text-white text-sm font-medium">{network.name}</div>
                      <div className="text-gray-400 text-xs">{network.description}</div>
                    </div>
                    {selectedNetwork === network.id && (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Mobile Navbar */}
      <motion.nav
        className="md:hidden flex items-center justify-between px-4 py-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Logo */}
        <Logo size="sm" />

        {/* Mobile Menu Button */}
        <motion.button
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-full"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </motion.button>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 mt-2"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div 
              className="px-6 py-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="space-y-4">
                {/* GitHub Link */}
                <motion.a
                  href="https://github.com/AaryanNarayani/solux"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300 font-medium cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 4 }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </motion.a>

                {/* Mobile Network Switcher */}
                <div className="pt-2 border-t border-white/10">
                  <div className="text-xs text-gray-400 mb-2">Network</div>
                  {networks.map((network) => (
                    <motion.button
                      key={network.id}
                      className={`w-full px-3 py-2 flex items-center space-x-3 rounded-lg hover:bg-white/5 transition-colors duration-200 ${
                        selectedNetwork === network.id ? 'bg-white/5' : ''
                      }`}
                      onClick={() => {
                        handleNetworkChange(network.id);
                        setIsMobileMenuOpen(false);
                      }}
                      whileHover={{ x: 2 }}
                    >
                      <div className={`w-2 h-2 rounded-full ${network.dot}`} />
                      <div className="flex-1 text-left">
                        <div className="text-white text-sm font-medium">{network.name}</div>
                        <div className="text-gray-400 text-xs">{network.description}</div>
                      </div>
                      {selectedNetwork === network.id && (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdowns */}
      {(isNetworkDropdownOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 -z-10" 
          onClick={() => {
            setIsNetworkDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </motion.header>
  );
};

export default Header; 