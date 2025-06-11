import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DetailPageLayout from '../components/layout/DetailPageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import AddressDisplay from '../components/common/AddressDisplay';
import TransactionRow from '../components/common/TransactionRow';
import TimestampDisplay from '../components/common/TimestampDisplay';
import { BlockService } from '../services';
import { useApiRequest } from '../hooks';
import { useNetwork } from '../contexts/NetworkContext';
import type { BreadcrumbItem } from '../types';

// Custom interfaces to handle the actual API response format
interface BlockData {
  slot: number;
  blockhash: string;
  parentSlot: number;
  blockTime: number | null;
  blockHeight: number | null;
  previousBlockhash: string;
  transactions: any[];
  rewards: any[];
  navigation: {
    prevSlot: number | null;
    nextSlot: number | null;
  };
  metrics: {
    transactionCount: number;
    totalFees: number;
    computeUnitsTotal: number;
    successfulTransactions: number;
    failedTransactions: number;
  };
}

interface BlockTransactionsData {
  slot: number;
  blockhash: string;
  blockTime: number | null;
  blockHeight: number | null;
  transactions: Array<{
    signature: string;
    index: number;
    status: 'success' | 'failure';
    fee: number;
    computeUnitsConsumed: number;
    accountKeys: string[];
    balanceChanges: any[];
    tokenTransfers: any[];
    programInteractions: Array<{
      programId: string;
      programName?: string;
    }>;
    fullTransaction: any;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metrics: {
    successfulTransactions: number;
    failedTransactions: number;
    totalFees: number;
    totalComputeUnits: number;
    uniquePrograms: string[];
    topPrograms: Array<{
      programId: string;
      name: string;
      count: number;
      percentage: number;
    }>;
  };
}

const BlockDetailPage = () => {
  const { slot } = useParams<{ slot: string }>();
  const navigate = useNavigate();
  const { network } = useNetwork();
  const [transactions, setTransactions] = useState<BlockTransactionsData['transactions']>([]);
  const [pagination, setPagination] = useState<BlockTransactionsData['pagination'] | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Fetch block details using our API hook
  const { 
    data: blockData,
    loading: blockLoading,
    error: blockError,
    execute: fetchBlock
  } = useApiRequest<BlockData, [number]>(
    async (slotNumber: number) => {
      const response = await BlockService.getBlock(slotNumber);
      // Return API response data
      return {
        success: response.success,
        data: response.data as unknown as BlockData
      };
    },
    { immediate: false }
  );

  // Effect to fetch block data when slot changes or network changes
  useEffect(() => {
    if (slot) {
      const slotNumber = parseInt(slot);
      if (!isNaN(slotNumber)) {
        fetchBlock(slotNumber);
        fetchBlockTransactions(slotNumber);
      } else {
        toast.error('Invalid block slot number');
      }
    }
  }, [slot, network]);

  // Function to fetch block transactions
  const fetchBlockTransactions = async (slotNumber: number, offset = 0, limit = 10) => {
    try {
      setTransactionsLoading(true);
      const response = await BlockService.getBlockTransactions(slotNumber, { offset, limit });
      
      // Create properly formatted transaction objects with explicit typing
      const mappedTransactions = response.data.transactions.map(tx => {
        return {
          signature: tx.signature,
          index: 'index' in tx ? Number(tx.index) : 0,
          status: tx.status || 'unknown',
          fee: tx.fee || 0,
          computeUnitsConsumed: 'computeUnitsConsumed' in tx ? Number(tx.computeUnitsConsumed) : 0,
          accountKeys: 'accountKeys' in tx ? tx.accountKeys : [],
          balanceChanges: 'balanceChanges' in tx ? tx.balanceChanges : [],
          tokenTransfers: 'tokenTransfers' in tx ? tx.tokenTransfers : [],
          programInteractions: 'programInteractions' in tx ? tx.programInteractions : 
            (tx.programIds ? [{ programId: tx.programIds[0], programName: 'Unknown' }] : []),
          fullTransaction: 'fullTransaction' in tx ? tx.fullTransaction : null
        };
      }) as BlockTransactionsData['transactions'];
      
      setTransactions(mappedTransactions);
      
      // Create properly formatted pagination object with explicit typing
      const mappedPagination = {
        total: response.data.pagination.total,
        limit: response.data.pagination.limit,
        offset: response.data.pagination.offset,
        hasNext: response.data.pagination.hasNext,
        hasPrev: 'hasPrev' in response.data.pagination ? 
          Boolean(response.data.pagination.hasPrev) : 
          Boolean(response.data.pagination.hasPrevious)
      } as BlockTransactionsData['pagination'];
      
      setPagination(mappedPagination);
    } catch (error) {
      console.error('Error fetching block transactions:', error);
      toast.error('Failed to load block transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Load more transactions
  const handleLoadMore = () => {
    if (!blockData || !pagination) return;
    
    const nextOffset = pagination.offset + pagination.limit;
    fetchBlockTransactions(blockData.slot, nextOffset, pagination.limit);
  };

  const handlePreviousBlock = () => {
    if (blockData && blockData.navigation.prevSlot) {
      navigate(`/block/${blockData.navigation.prevSlot}`);
    } else if (blockData && blockData.parentSlot) {
      navigate(`/block/${blockData.parentSlot}`);
    }
  };

  const handleNextBlock = () => {
    if (blockData && blockData.navigation.nextSlot) {
      navigate(`/block/${blockData.navigation.nextSlot}`);
    } else if (blockData) {
      navigate(`/block/${blockData.slot + 1}`);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Block Details' }
  ];

  if (blockLoading) {
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

  if (blockError || !blockData) {
    return (
      <DetailPageLayout breadcrumbs={breadcrumbs}>
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🧱</div>
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            Block Not Found
          </h3>
          <p className="text-gray-400">
            {blockError?.message || "The requested block could not be found on the blockchain."}
          </p>
        </Card>
      </DetailPageLayout>
    );
  }

  return (
    <DetailPageLayout
      breadcrumbs={breadcrumbs}
      title="Block Details"
      subtitle={`Slot ${blockData.slot.toLocaleString()}`}
    >
      <div className="space-y-8">
        {/* Block Overview */}
        <Card title="Block Overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Slot</span>
                <span className="text-white font-mono">
                  {blockData.slot.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Block Hash</span>
                <AddressDisplay 
                  address={blockData.blockhash}
                  truncate="middle"
                />
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Parent Slot</span>
                <button
                  onClick={handlePreviousBlock}
                  className="text-purple-400 hover:text-purple-300 font-mono"
                >
                  {blockData.parentSlot.toLocaleString()}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp</span>
                {blockData.blockTime ? (
                  <TimestampDisplay timestamp={blockData.blockTime} />
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Block Height</span>
                <span className="text-white font-mono">
                  {blockData.blockHeight?.toLocaleString() || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Total Fees</span>
                <span className="text-white">
                  {blockData.metrics?.totalFees ? 
                    `${(blockData.metrics.totalFees / 1_000_000_000).toFixed(6)} SOL` : 
                    '0 SOL'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Transactions</span>
                <span className="text-white font-bold">
                  {blockData.metrics?.transactionCount.toLocaleString() || '0'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate</span>
                <span className="text-white">
                  {blockData.metrics?.transactionCount > 0 ? 
                    `${((blockData.metrics.successfulTransactions / blockData.metrics.transactionCount) * 100).toFixed(1)}%` : 
                    'N/A'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Compute Units</span>
                <span className="text-white">
                  {blockData.metrics?.computeUnitsTotal?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Block Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={handlePreviousBlock}
            className="flex items-center space-x-2"
            disabled={!blockData.navigation?.prevSlot && blockData.parentSlot === 0}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous Block</span>
          </Button>

          <div className="text-center">
            <div className="text-sm text-gray-400">Current Block</div>
            <div className="text-lg font-semibold text-white">
              #{blockData.slot.toLocaleString()}
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={handleNextBlock}
            className="flex items-center space-x-2"
          >
            <span>Next Block</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        {/* Transactions List */}
        <Card title={`Transactions (${pagination?.total || blockData.metrics?.transactionCount || 0})`}>
          <div className="space-y-4">
            {transactionsLoading && transactions.length === 0 ? (
              <div className="py-4">
                <Skeleton variant="text" lines={5} />
              </div>
            ) : transactions.length > 0 ? (
              <>
                {transactions.map((transaction, index) => (
                  <TransactionRow
                    key={transaction.signature}
                    transaction={transaction}
                    variant="block"
                    index={index}
                  />
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No transactions found in this block
              </div>
            )}

            {pagination && pagination.hasNext && (
              <div className="text-center pt-6">
                <Button 
                  variant="ghost"
                  onClick={handleLoadMore}
                  loading={transactionsLoading}
                >
                  Load More Transactions
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DetailPageLayout>
  );
};

export default BlockDetailPage; 