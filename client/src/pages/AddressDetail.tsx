import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DetailPageLayout from '../components/layout/DetailPageLayout';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import CopyButton from '../components/ui/CopyButton';
import AddressDisplay from '../components/common/AddressDisplay';
import TransactionRow from '../components/common/TransactionRow';
import type { BreadcrumbItem, TabItem } from '../types';
import { useNetwork } from '../contexts/NetworkContext';
import useApiRequest from '../hooks/useApiRequest';
import { apiClient, API_ENDPOINTS } from '../services/api';
import type { AddressResponse, AddressTransactionsResponse, AddressTokensResponse, AddressNftsResponse } from '../types/api';
import { Link } from 'react-router-dom';

const AddressDetailPage = () => {
  const { address } = useParams<{ address: string }>();
  const { network } = useNetwork();
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // API Requests
  const { data: addressData, loading: addressLoading, error: addressError, execute: fetchAddressData } = useApiRequest<any, [string]>(
    async (addressParam) => {
      const endpoint = `${API_ENDPOINTS[network].address}/${addressParam}`;
      return await apiClient.get<AddressResponse>(endpoint, undefined, 60000); // 1 minute cache
    },
    { 
      immediate: false, 
      dependencies: [address, network] 
    }
  );

  const { data: tokensData, loading: tokensLoading, execute: fetchTokensData } = useApiRequest<AddressTokensResponse['data'], [string]>(
    async (addressParam) => {
      try {
        const endpoint = `${API_ENDPOINTS[network].addressTokens}/${addressParam}/tokens`;
        const response = await apiClient.get<AddressTokensResponse>(endpoint, undefined, 60000);
        
        // If the API doesn't return tokens in the expected format,
        // use the tokens from the addressData instead
        if (!Array.isArray(response.data?.tokens) && addressData?.data?.tokens) {
          return {
            success: true,
            data: {
              address: addressParam,
              tokens: addressData.data.tokens || []
            },
            timestamp: new Date().toISOString()
          };
        }
        
        return response;
      } catch (error) {
        console.error('Error fetching tokens:', error);
        // Return a valid but empty response
        return {
          success: true,
          data: {
            address: addressParam,
            tokens: []
          },
          timestamp: new Date().toISOString()
        };
      }
    },
    { 
      immediate: false, 
      dependencies: [address, network, activeTab] 
    }
  );

  const { data: nftsData, loading: nftsLoading, execute: fetchNftsData } = useApiRequest<AddressNftsResponse['data'], [string]>(
    async (addressParam) => {
      const endpoint = `${API_ENDPOINTS[network].addressTokens}/${addressParam}/nfts`;
      return await apiClient.get<AddressNftsResponse>(endpoint, undefined, 60000);
    },
    { 
      immediate: false, 
      dependencies: [address, network, activeTab] 
    }
  );

  const { data: transactionsData, loading: transactionsLoading, error: transactionsError, execute: fetchTransactionsData } = useApiRequest<AddressTransactionsResponse['data'], [string]>(
    async (addressParam) => {
      try {
        const endpoint = `${API_ENDPOINTS[network].addressTransactions}/${addressParam}/transactions`;
        console.log('Fetching transactions from endpoint:', endpoint);
        const response = await apiClient.get<AddressTransactionsResponse>(endpoint);
        console.log('Transactions response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching transactions:', error);
        // Return a valid but empty response structure to prevent errors
        return {
          success: true,
          data: {
            address: addressParam,
            transactions: [],
            pagination: {
              hasNext: false,
              hasPrevious: false,
              total: 0
            },
            summary: {
              totalTransactions: 0,
              successfulTransactions: 0,
              failedTransactions: 0,
              totalFeePaid: 0,
              totalReceived: 0,
              totalSent: 0
            }
          }
        };
      }
    },
    { 
      immediate: false,
      onSuccess: () => console.log('Successfully loaded transactions data'),
      onError: (error) => console.error('Failed to load transactions data:', error)
    }
  );

  // Load initial address data
  useEffect(() => {
    if (address) {
      fetchAddressData(address);
    }
  }, [address, network, fetchAddressData]);

  // Load data when tab changes - only load if we don't already have the data
  useEffect(() => {
    if (!address) {
      console.log('No address available, skipping tab data load');
      return;
    }
    
    console.log(`Tab changed to ${activeTab}, checking if data needs to be loaded:`, {
      tokens: { loaded: !!tokensData, loading: tokensLoading },
      nfts: { loaded: !!nftsData, loading: nftsLoading },
      transactions: { loaded: !!transactionsData, loading: transactionsLoading }
    });
    
    if (activeTab === 'tokens' && !tokensData && !tokensLoading) {
      console.log('Loading tokens data');
      loadTokensData();
    } else if (activeTab === 'nfts' && !nftsData && !nftsLoading) {
      console.log('Loading NFTs data');
      loadNftsData();
    } else if (activeTab === 'transactions' && !transactionsData && !transactionsLoading) {
      console.log('Loading transactions data');
      loadTransactionsData();
    }
  }, [activeTab, address, tokensData, tokensLoading, nftsData, nftsLoading, transactionsData, transactionsLoading]);

  // Functions to load data for different tabs
  const loadTokensData = async () => {
    if (!address) return;
    try {
      await fetchTokensData(address);
    } catch (error) {
      console.error('Error loading tokens data:', error);
    }
  };

  const loadNftsData = async () => {
    if (!address) return;
    try {
      await fetchNftsData(address);
    } catch (error) {
      console.error('Error loading NFTs data:', error);
    }
  };

  const loadTransactionsData = async () => {
    if (!address) {
      console.log('No address available, skipping transactions data load');
      return;
    }
    
    console.log(`Loading transactions data for address: ${address}`);
    
    try {
      console.log('Calling fetchTransactionsData...');
      const result = await fetchTransactionsData(address);
      console.log('Transaction data loaded successfully:', result);
    } catch (error) {
      console.error('Error loading transactions data:', error);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Address Details' }
  ];

  const getAccountTypeIcon = (type: string | undefined) => {
    if (!type) return '❓';
    switch (type) {
      case 'wallet': return '👤';
      case 'program': return '⚙️';
      case 'token': return '🪙';
      default: return '❓';
    }
  };

  const getAccountTypeBadge = (type: string | undefined) => {
    if (!type) return { variant: 'neutral' as const, label: 'Unknown' };
    switch (type) {
      case 'wallet': return { variant: 'info' as const, label: 'Wallet' };
      case 'program': return { variant: 'warning' as const, label: 'Program' };
      case 'token': return { variant: 'success' as const, label: 'Token Account' };
      default: return { variant: 'neutral' as const, label: 'Unknown' };
    }
  };

  // Determine account type
  const determineAccountType = (addressData: any): string => {
    // Check if it's a program (executable)
    if (addressData.account?.executable) {
      return 'program';
    }
    
    // Check if it has tokens (likely a wallet)
    if (addressData.tokens && addressData.tokens.length > 0) {
      return 'wallet';
    }
    
    // Default to wallet if nothing specific is detected
    return 'wallet';
  };
  
  // Get the owner for wallet accounts
  // const getWalletOwner = (accountType: string, ownerFromData: string | undefined): string => {
  //   if (accountType === 'wallet') {
  //     return '11111111111111111111111111111111'; // System Program address
  //   }
  //   return ownerFromData || 'Unknown';
  // };

  if (addressLoading) {
    return (
      <DetailPageLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-8">
          <Card className="p-6">
            <Skeleton variant="text" lines={5} />
          </Card>
          <Card className="p-6">
            <Skeleton variant="text" lines={8} />
          </Card>
        </div>
      </DetailPageLayout>
    );
  }

  if (addressError || !addressData) {
    return (
      <DetailPageLayout breadcrumbs={breadcrumbs}>
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            Address Not Found
          </h3>
          <p className="text-gray-400">
            The requested address could not be found on the blockchain.
          </p>
        </Card>
      </DetailPageLayout>
    );
  }

  const accountType = addressData.type || determineAccountType(addressData);
  const typeConfig = getAccountTypeBadge(accountType);
  
  const tabItems: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          {/* Address Overview */}
          <Card title="Address Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Address</span>
                  <div className="flex items-center space-x-3">
                    <AddressDisplay 
                      address={addressData.address}
                      truncate="middle"
                    />
                    <CopyButton text={addressData.address} variant='icon' />
                    <button 
                      onClick={() => setShowQrModal(true)}
                      className="text-gray-400 hover:text-white"
                      title="Show QR Code"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Type</span>
                  <Badge variant={typeConfig.variant} size="md">
                    {typeConfig.label}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">SOL Balance</span>
                  <span className="text-white font-semibold">
                    {addressData.account?.lamports?.value 
                      ? (addressData.account.lamports.value / 1000000000).toFixed(6) 
                      : addressData.account?.lamports 
                        ? (typeof addressData.account.lamports === 'number' 
                           ? (addressData.account.lamports / 1000000000).toFixed(6)
                           : "0.000000")
                        : addressData.balance 
                          ? addressData.balance.toFixed(6) 
                          : "0.000000"} SOL
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Total Transactions</span>
                  <span className="text-white">
                    {addressData.stats?.transactionCount || addressData.transactions?.total || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Owner</span>
                  <div className="flex items-center space-x-2">
                    <AddressDisplay 
                      address={accountType === 'wallet' ? '11111111111111111111111111111111' : (addressData.account?.owner || addressData.owner || 'Unknown')}
                      truncate="none"
                    />
                    {accountType === 'wallet' && <span className="text-sm text-blue-400">(System Program)</span>}
                    {/* <CopyButton text={accountType === 'wallet' ? '11111111111111111111111111111111' : (addressData.account?.owner || addressData.owner || 'Unknown')} variant="icon" /> */}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Rent Epoch</span>
                  <span className="text-white">
                    {addressData.account?.rentEpoch || addressData.rentEpoch || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Executable</span>
                  <span className={
                    addressData.account?.executable || addressData.executable 
                      ? 'text-green-400 font-medium' 
                      : 'text-gray-400'
                  }>
                    {addressData.account?.executable || addressData.executable ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">NFT Count</span>
                  <span className="text-white">
                    {addressData.nfts?.length || addressData.nftCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card title="Recent Transactions">
            <div className="space-y-4">
              {addressData.transactions?.recent ? (
                <>
                  {addressData.transactions.recent.map((tx: any) => (
                    <TransactionRow
                      key={tx.signature}
                      transaction={{
                        signature: tx.signature,
                        blockTime: tx.blockTime,
                        status: tx.status,
                        fee: tx.fee,
                        type: tx.type
                      }}
                    />
                  ))}
                  {addressData.transactions.total > addressData.transactions.recent.length && (
                    <div className="pt-2 text-center">
                      <button 
                        onClick={() => setActiveTab('transactions')}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View all {addressData.transactions.total} transactions
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No recent transactions found
                </div>
              )}
            </div>
          </Card>

          {/* Tokens Overview */}
          {addressData.tokens && addressData.tokens.length > 0 && (
            <Card title="Token Holdings">
              <div className="space-y-4">
                {addressData.tokens.slice(0, 3).map((token: any) => (
                  <div 
                    key={token.mint}
                    className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={`https://pub-d75c4476cafd4ecca54e6cdc5e180150.r2.dev/solana.png`} 
                        alt={token.name || 'Token'} 
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://pub-d75c4476cafd4ecca54e6cdc5e180150.r2.dev/solana.png';
                        }}
                      />
                      <div>
                        <div className="font-medium text-white">{token.name || 'Unknown Token'}</div>
                        <div className="text-sm text-gray-400">{token.symbol || ''}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {token.uiAmount !== undefined ? 
                          token.uiAmount.toLocaleString() : 
                          (typeof token.amount === 'string' ? 
                            (parseInt(token.amount) / Math.pow(10, token.decimals)).toLocaleString() : 
                            (token.amount as number / Math.pow(10, token.decimals)).toLocaleString()
                          )
                        } {token.symbol || ''}
                      </div>
                      <div className="text-sm text-gray-400">
                        ${token.value?.toLocaleString() || '0.00'}
                      </div>
                    </div>
                  </div>
                ))}
                {addressData.tokens.length > 3 && (
                  <div className="pt-2 text-center">
                    <button 
                      onClick={() => setActiveTab('tokens')}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View all {addressData.tokens.length} tokens
                    </button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'tokens',
      label: 'Tokens',
      content: (
        <div className="space-y-6">
          <Card title="Token Holdings">
            {tokensLoading ? (
              <Skeleton variant="text" lines={5} />
            ) : tokensData ? (
              <div className="space-y-4">
                <div className="flex justify-between pb-4 border-b border-gray-800">
                  <span className="text-gray-400">Total Value</span>
                  <span className="text-white font-semibold">
                    ${tokensData.totalValue?.toLocaleString() || '0.00'}
                  </span>
                </div>
                
                {Array.isArray(tokensData.tokens) && tokensData.tokens.length > 0 ? tokensData.tokens.map((token: any) => (
                  <div 
                    key={token.mint}
                    className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={`https://pub-d75c4476cafd4ecca54e6cdc5e180150.r2.dev/solana.png`}
                        alt={token.name || 'Token'} 
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://pub-d75c4476cafd4ecca54e6cdc5e180150.r2.dev/solana.png?';
                        }}
                      />
                      <div>
                        <div className="font-medium text-white">{token.name || 'Unknown Token'}</div>
                        <div className="text-sm text-gray-400">{token.symbol || ''}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          <AddressDisplay address={token.mint} truncate="middle" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {token.uiAmount !== undefined ? 
                          token.uiAmount.toLocaleString() : 
                          (typeof token.amount === 'string' ? 
                            (parseInt(token.amount) / Math.pow(10, token.decimals)).toLocaleString() : 
                            (token.amount as number / Math.pow(10, token.decimals)).toLocaleString()
                          )
                        } {token.symbol || ''}
                      </div>
                      <div className="text-sm text-gray-400">
                        ${token.value?.toLocaleString() || '0.00'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {token.priceChangePercentage24h ? (
                          token.priceChangePercentage24h > 0 ? (
                            <span className="text-green-400">+{token.priceChangePercentage24h.toFixed(2)}%</span>
                          ) : (
                            <span className="text-red-400">{token.priceChangePercentage24h.toFixed(2)}%</span>
                          )
                        ) : (
                          <span className="text-gray-500">0.00%</span>
                        )}
                        <span className="text-gray-500"> (24h)</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-400">
                    No tokens found for this address
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No token holdings found for this address
              </div>
            )}
          </Card>
        </div>
      )
    },
    {
      id: 'nfts',
      label: 'NFTs',
      content: (
        <div className="space-y-6">
          <Card title="NFT Collection">
            {nftsLoading ? (
              <Skeleton variant="text" lines={5} />
            ) : nftsData && nftsData.nfts && nftsData.nfts.length > 0 ? (
              <div>
                <div className="flex justify-between pb-4 border-b border-gray-800 mb-6">
                  <div>
                    <div className="text-sm text-gray-400">Total NFTs</div>
                    <div className="text-xl font-semibold">{nftsData.nftsCount || nftsData.nfts.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Collections</div>
                    <div className="text-xl font-semibold">{nftsData.collectionsCount || '1'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Estimated Value</div>
                    <div className="text-xl font-semibold">{(nftsData.estimatedValue ?? 0).toFixed(2)} SOL</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nftsData.nfts.map((nft: any) => (
                    <div key={nft.mint} className="bg-gray-800 rounded-lg overflow-hidden">
                      <div className="aspect-square bg-gray-900">
                        <img 
                          src={nft.image || 'https://pub-d75c4476cafd4ecca54e6cdc5e180150.r2.dev/solana.png'}
                          alt={nft.name || 'NFT'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://pub-d75c4476cafd4ecca54e6cdc5e180150.r2.dev/solana.png';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white truncate">{nft.name || 'Unknown NFT'}</h3>
                        <p className="text-sm text-gray-400 mb-2">
                          {typeof nft.collection === 'object' && nft.collection ? 
                            nft.collection.name || 'Unknown Collection' : 
                            nft.collection || 'Unknown Collection'}
                        </p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Rank: #{nft.rarityRank || 'N/A'}</span>
                          <span>{nft.estimatedValue || 0} SOL</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {nftsData.pagination && nftsData.pagination.hasNext && (
                  <div className="text-center mt-6">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
                      Load More
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No NFTs found for this address
              </div>
            )}
          </Card>
        </div>
      )
    },
    {
      id: 'transactions',
      label: 'Transactions',
      content: (
        <div className="space-y-6">
          <Card title="Recent Transactions">
            {transactionsLoading ? (
              <Skeleton variant="text" lines={5} />
            ) : transactionsError ? (
              <div className="p-4 text-red-500">
                Error loading transactions. Please try again.
              </div>
            ) : transactionsData && Array.isArray(transactionsData.transactions) ? (
              <>
                {transactionsData.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 border-b border-gray-800">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Total Transactions</span>
                      <span className="text-white font-semibold">{transactionsData.summary.totalTransactions}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Success Rate</span>
                      <span className="text-white font-semibold">
                        {transactionsData.summary.totalTransactions > 0
                          ? `${Math.round((transactionsData.summary.successfulTransactions / transactionsData.summary.totalTransactions) * 100)}%`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Total Fees</span>
                      <span className="text-white font-semibold">{(transactionsData.summary.totalFeePaid / 1e9).toFixed(6)} SOL</span>
                    </div>
                  </div>
                )}

                {transactionsData.transactions.length === 0 ? (
                  <div className="p-4 text-gray-400">No transactions found for this address.</div>
                ) : (
                  <div className="space-y-4">
                    {transactionsData.transactions.map((tx) => (
                      <div key={tx.signature} className="p-4 border border-gray-800 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="flex justify-between mb-2">
                          <Link
                            to={`/tx/${tx.signature}`}
                            className="text-blue-500 hover:text-blue-400 font-mono text-sm truncate max-w-[12rem] md:max-w-xs"
                          >
                            {tx.signature}
                          </Link>
                          <span className={`text-xs px-2 py-1 rounded ${tx.status === 'success' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                            {tx.status}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-2">
                          <div className="text-gray-400">
                            {new Date(tx.blockTime * 1000).toLocaleString()}
                          </div>
                          <div className={`${tx.type === 'sent' ? 'text-red-400' : tx.type === 'received' ? 'text-green-400' : 'text-blue-400'}`}>
                            {tx.type === 'sent' ? 'Sent' : tx.type === 'received' ? 'Received' : 'Interaction'}
                          </div>
                        </div>
                        
                        {tx.balanceChange && (
                          <div className="text-sm text-gray-300 mb-2">
                            SOL Change: 
                            <span className={tx.balanceChange.change > 0 ? 'text-green-400 ml-1' : tx.balanceChange.change < 0 ? 'text-red-400 ml-1' : 'text-gray-400 ml-1'}>
                              {tx.balanceChange.change > 0 ? '+' : ''}{(tx.balanceChange.change / 1e9).toFixed(6)} SOL
                            </span>
                          </div>
                        )}
                        
                        {tx.programInteractions && tx.programInteractions.length > 0 && (
                          <div className="text-xs text-gray-400 mt-2">
                            Programs: {tx.programInteractions.map((p) => p.programName || p.programId).join(', ')}
                          </div>
                        )}
                        
                        {tx.memo && (
                          <div className="text-xs text-gray-400 mt-2 italic">
                            Memo: {tx.memo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {transactionsData.pagination && (
                  <div className="flex justify-between items-center mt-4 p-4 border-t border-gray-800">
                    <button 
                      className={`px-3 py-1 rounded border border-gray-700 ${!transactionsData.pagination.hasPrevious ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                      disabled={!transactionsData.pagination.hasPrevious}
                    >
                      Previous
                    </button>
                    <button 
                      className={`px-3 py-1 rounded border border-gray-700 ${!transactionsData.pagination.hasNext ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                      disabled={!transactionsData.pagination.hasNext}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-gray-400">No transaction data available.</div>
            )}
          </Card>
        </div>
      )
    }
  ];
  
  return (
    <DetailPageLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="text-5xl bg-gray-700 p-3 rounded-full">
              {getAccountTypeIcon(accountType)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">
                {accountType === 'wallet' ? 'Wallet Address' : 
                 accountType === 'program' ? 'Program Address' : 
                 accountType === 'token' ? 'Token Account' : 'Account Address'}
              </h1>
              <div className="flex items-center space-x-3">
                <AddressDisplay 
                  address={addressData.address}
                  truncate="none"
                />
                <CopyButton text={addressData.address} variant="icon" />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 md:self-start">
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Send</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
            
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Add Watch</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Tab Content */}
        <Tabs 
          items={tabItems}
          defaultTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* QR Code Modal */}
      <Modal 
        isOpen={showQrModal} 
        onClose={() => setShowQrModal(false)}
        title="Address QR Code"
      >
        <div className="flex flex-col items-center">
          <div className="bg-white p-6 rounded-lg mb-6">
            {/* QR Code would be here */}
            <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-black font-medium">QR Code Placeholder</span>
            </div>
          </div>
          <div className="text-center mb-4 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
            <AddressDisplay 
              address={addressData.address}
              truncate="none"
            />
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(addressData.address);
                // Optional: Add visual feedback for copy
                const notification = document.createElement('div');
                notification.textContent = 'Address copied!';
                notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50';
                document.body.appendChild(notification);
                setTimeout(() => {
                  notification.remove();
                }, 2000);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy</span>
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download</span>
            </button>
          </div>
        </div>
      </Modal>
    </DetailPageLayout>
  );
};

export default AddressDetailPage; 