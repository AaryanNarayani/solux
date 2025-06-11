import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { setNetwork } from '../services/api';

type NetworkType = 'mainnet' | 'devnet';

interface NetworkContextType {
  network: NetworkType;
  setActiveNetwork: (network: NetworkType) => void;
  isMainnet: boolean;
  isDevnet: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  network: 'mainnet',
  setActiveNetwork: () => {},
  isMainnet: true,
  isDevnet: false,
});

interface NetworkProviderProps {
  children: ReactNode;
  defaultNetwork?: NetworkType;
}

export const NetworkProvider = ({ 
  children, 
  defaultNetwork = 'mainnet' 
}: NetworkProviderProps) => {
  const [network, setNetworkState] = useState<NetworkType>(() => {
    // Try to get network from localStorage
    const savedNetwork = localStorage.getItem('solux-network');
    if (savedNetwork === 'mainnet' || savedNetwork === 'devnet') {
      return savedNetwork;
    }
    return defaultNetwork;
  });

  // Set active network
  const setActiveNetwork = useCallback((newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
    localStorage.setItem('solux-network', newNetwork);
    setNetwork(newNetwork);
  }, []);

  // Initialize network on first mount
  useEffect(() => {
    setNetwork(network);
  }, [network]);

  const value = {
    network,
    setActiveNetwork,
    isMainnet: network === 'mainnet',
    isDevnet: network === 'devnet',
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext); 