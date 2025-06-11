import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DetailPageLayout from '../components/layout/DetailPageLayout';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import CopyButton from '../components/ui/CopyButton';
import AddressDisplay from '../components/common/AddressDisplay';
import TimestampDisplay from '../components/common/TimestampDisplay';
import type { BreadcrumbItem, TabItem } from '../types';
import { useNetwork } from '../contexts/NetworkContext';
import useApiRequest from '../hooks/useApiRequest';
import { TokenService } from '../services/tokenService';
import type { TokenResponse } from '../types/api';

const TokenDetailPage = () => {
  const { mint } = useParams<{ mint: string }>();
  const { network } = useNetwork();
  const [activeTab, setActiveTab] = useState('overview');

  // API Request
  const { data: tokenData, loading: tokenLoading, error: tokenError } = useApiRequest<TokenResponse['data'], [string]>(
    async (mintAddress) => TokenService.getToken(mintAddress),
    { immediate: !!mint, dependencies: [mint, network] }
  );

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Token Details' }
  ];

  if (tokenLoading) {
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

  if (tokenError || !tokenData) {
    return (
      <DetailPageLayout breadcrumbs={breadcrumbs}>
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🪙</div>
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            Token Not Found
          </h3>
          <p className="text-gray-400">
            The requested token could not be found on the blockchain.
          </p>
        </Card>
      </DetailPageLayout>
    );
  }

  // Token type badge
  const getTokenTypeBadge = (type: 'fungible' | 'nft') => {
    return type === 'fungible' 
      ? { variant: 'info' as const, label: 'Fungible Token' }
      : { variant: 'success' as const, label: 'NFT' };
  };

  const typeConfig = getTokenTypeBadge(tokenData.type);

  // Format market cap
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    } else if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    } else if (marketCap >= 1_000) {
      return `$${(marketCap / 1_000).toFixed(2)}K`;
    }
    return `$${marketCap.toFixed(2)}`;
  };

  const tabItems: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          {/* Token Information */}
          <Card title="Token Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Mint Address</span>
                  <div className="flex items-center space-x-2">
                    <AddressDisplay 
                      address={tokenData.mint}
                      truncate="middle"
                    />
                    <CopyButton text={tokenData.mint} />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Type</span>
                  <Badge variant={typeConfig.variant} size="sm">
                    {typeConfig.label}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Symbol</span>
                  <span className="text-white font-semibold">
                    {tokenData.symbol}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Decimals</span>
                  <span className="text-white">
                    {tokenData.decimals}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Supply</span>
                  <span className="text-white font-semibold">
                    {TokenService.formatTokenAmount(tokenData.totalSupply, tokenData.decimals, true, tokenData.symbol)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Holder Count</span>
                  <span className="text-white">
                    {tokenData.tokenHolders.count.toLocaleString()}
                  </span>
                </div>

                {tokenData.metadata.description && (
                  <div className="col-span-1 md:col-span-2 mt-4">
                    <h3 className="text-gray-400 mb-2">Description</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {tokenData.metadata.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Market Data */}
          {tokenData.marketData && (
            <Card title="Market Data">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Price</span>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {TokenService.formatTokenPrice(tokenData.marketData.price)}
                      </div>
                      <div className={`text-sm ${tokenData.marketData.priceChangePercentage24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {TokenService.formatPriceChange(tokenData.marketData.priceChangePercentage24h)} (24h)
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Market Cap</span>
                    <span className="text-white">
                      {formatMarketCap(tokenData.marketData.marketCap)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Volume</span>
                    <span className="text-white">
                      {formatMarketCap(tokenData.marketData.volume24h)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">All-Time High</span>
                    <div className="text-right">
                      <div className="text-white">
                        {TokenService.formatTokenPrice(tokenData.marketData.allTimeHigh)}
                      </div>
                      <div className="text-xs text-gray-400">
                        <TimestampDisplay timestamp={new Date(tokenData.marketData.allTimeHighDate).getTime() / 1000} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">All-Time Low</span>
                    <div className="text-right">
                      <div className="text-white">
                        {TokenService.formatTokenPrice(tokenData.marketData.allTimeLow)}
                      </div>
                      <div className="text-xs text-gray-400">
                        <TimestampDisplay timestamp={new Date(tokenData.marketData.allTimeLowDate).getTime() / 1000} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fully Diluted Valuation</span>
                    <span className="text-white">
                      {formatMarketCap(tokenData.marketData.fullyDilutedValuation)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Token Holders */}
          <Card title="Largest Token Holders">
            <div className="space-y-4">
              {tokenData.tokenHolders.largestHolders.map((holder, index) => (
                <div 
                  key={holder.address}
                  className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${index < 3 ? 'bg-blue-600' : 'bg-gray-700'}`}>
                      {index + 1}
                    </div>
                    <AddressDisplay address={holder.address} truncate="middle" />
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {TokenService.formatTokenAmount(holder.amount, tokenData.decimals, true, tokenData.symbol)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {holder.percentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Transfers */}
          <Card title="Recent Transfers">
            <div className="space-y-4">
              {tokenData.transferHistory.history.map((transfer) => (
                <div 
                  key={transfer.signature}
                  className="py-3 border-b border-gray-800 last:border-0"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-xs px-2 py-1 bg-gray-800 rounded">
                        <TimestampDisplay timestamp={transfer.blockTime} />
                      </div>
                      <a 
                        href={`/transaction/${transfer.signature}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <span className="md:hidden">
                          {transfer.signature.substring(0, 8)}...
                        </span>
                        <span className="hidden md:inline">
                          {transfer.signature.substring(0, 12)}...{transfer.signature.substring(transfer.signature.length - 12)}
                        </span>
                      </a>
                    </div>
                    <div className="font-medium">
                      {TokenService.formatTokenAmount(transfer.amount, transfer.decimals, true, tokenData.symbol)}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="space-y-1">
                      <div className="text-gray-400">From</div>
                      <AddressDisplay address={transfer.fromAddress} truncate="middle" />
                    </div>
                    <div className="hidden md:block text-gray-600">
                      →
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-gray-400">To</div>
                      <AddressDisplay address={transfer.toAddress} truncate="middle" />
                    </div>
                  </div>
                </div>
              ))}
              {tokenData.transferHistory.total > tokenData.transferHistory.history.length && (
                <div className="pt-2 text-center">
                  <button 
                    onClick={() => setActiveTab('transfers')}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View all {tokenData.transferHistory.total.toLocaleString()} transfers
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )
    },
    {
      id: 'transfers',
      label: 'Transfers',
      content: (
        <div className="space-y-6">
          <Card title="Transfer History">
            <div className="space-y-4">
              {tokenData.transferHistory.history.map((transfer) => (
                <div 
                  key={transfer.signature}
                  className="py-3 border-b border-gray-800 last:border-0"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-xs px-2 py-1 bg-gray-800 rounded">
                        <TimestampDisplay timestamp={transfer.blockTime} />
                      </div>
                      <a 
                        href={`/transaction/${transfer.signature}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <span className="md:hidden">
                          {transfer.signature.substring(0, 8)}...
                        </span>
                        <span className="hidden md:inline">
                          {transfer.signature.substring(0, 12)}...{transfer.signature.substring(transfer.signature.length - 12)}
                        </span>
                      </a>
                    </div>
                    <div className="font-medium">
                      {TokenService.formatTokenAmount(transfer.amount, transfer.decimals, true, tokenData.symbol)}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="space-y-1">
                      <div className="text-gray-400">From</div>
                      <AddressDisplay address={transfer.fromAddress} truncate="middle" />
                    </div>
                    <div className="hidden md:block text-gray-600">
                      →
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-gray-400">To</div>
                      <AddressDisplay address={transfer.toAddress} truncate="middle" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )
    },
    {
      id: 'holders',
      label: 'Holders',
      content: (
        <div className="space-y-6">
          <Card title="Token Holders">
            <div className="space-y-4">
              <div className="flex justify-between pb-4 border-b border-gray-800">
                <span className="text-gray-400">Total Holders</span>
                <span className="text-white font-semibold">
                  {tokenData.tokenHolders.count.toLocaleString()}
                </span>
              </div>
              
              {tokenData.tokenHolders.largestHolders.map((holder, index) => (
                <div 
                  key={holder.address}
                  className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${index < 3 ? 'bg-blue-600' : 'bg-gray-700'}`}>
                      {index + 1}
                    </div>
                    <AddressDisplay address={holder.address} truncate="middle" />
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {TokenService.formatTokenAmount(holder.amount, tokenData.decimals, true, tokenData.symbol)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {holder.percentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card title="Distribution by Holdings">
            <div className="space-y-4">
              {tokenData.tokenHolders.distributionChart.map((range) => (
                <div 
                  key={range.range}
                  className="space-y-1"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{range.range}</span>
                    <span className="text-white">{range.holderCount.toLocaleString()} holders ({range.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${range.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )
    }
  ];

  // Add NFT tab if the token is an NFT
  if (tokenData.type === 'nft' && tokenData.nftDetails) {
    tabItems.push({
      id: 'nft',
      label: 'NFT Details',
      content: (
        <div className="space-y-6">
          <Card title="NFT Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={tokenData.metadata.image || 'https://via.placeholder.com/400?text=No+Image'} 
                    alt={tokenData.name} 
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
                    }}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-white">{tokenData.name}</h3>
                  {tokenData.nftDetails.collection && (
                    <p className="text-gray-400">{tokenData.nftDetails.collection}</p>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Owner</span>
                  <AddressDisplay address={tokenData.nftDetails.owner} truncate="middle" />
                </div>

                {tokenData.nftDetails.rarityRank && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rarity Rank</span>
                    <span className="text-white">#{tokenData.nftDetails.rarityRank}</span>
                  </div>
                )}

                {tokenData.nftDetails.lastSalePrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Sale</span>
                    <div className="text-right">
                      <div className="text-white">{tokenData.nftDetails.lastSalePrice} SOL</div>
                      {tokenData.nftDetails.lastSaleDate && (
                        <div className="text-xs text-gray-400">
                          <TimestampDisplay timestamp={new Date(tokenData.nftDetails.lastSaleDate).getTime() / 1000} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attributes section */}
            {tokenData.nftDetails.attributes && tokenData.nftDetails.attributes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-4">Attributes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tokenData.nftDetails.attributes.map((attribute) => (
                    <div 
                      key={`${attribute.trait_type}-${attribute.value}`}
                      className="bg-gray-800 rounded-lg p-3"
                    >
                      <div className="text-gray-400 text-sm">{attribute.trait_type}</div>
                      <div className="text-white font-medium">{attribute.value}</div>
                      {attribute.rarity !== undefined && (
                        <div className="text-blue-400 text-xs mt-1">
                          {(attribute.rarity * 100).toFixed(1)}% have this trait
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )
    });
  }

  return (
    <DetailPageLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
              {tokenData.metadata.image ? (
                <img 
                  src={tokenData.metadata.image} 
                  alt={tokenData.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=?';
                  }}
                />
              ) : (
                <span className="text-2xl">🪙</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {tokenData.name}
              </h1>
              <div className="mt-1 flex items-center space-x-2">
                <Badge variant={typeConfig.variant} size="sm">
                  {typeConfig.label}
                </Badge>
                <span className="text-gray-400">{tokenData.symbol}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {tokenData.metadata.externalUrl && (
              <motion.a
                href={tokenData.metadata.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Website</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.a>
            )}
            
            <motion.button
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Add to Wallet</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
    </DetailPageLayout>
  );
};

export default TokenDetailPage; 