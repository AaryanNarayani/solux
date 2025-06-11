import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import DetailPageLayout from '../components/layout/DetailPageLayout';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import CopyButton from '../components/ui/CopyButton';
import AddressDisplay from '../components/common/AddressDisplay';
import StatusBadge from '../components/common/StatusBadge';
import TimestampDisplay from '../components/common/TimestampDisplay';
import { TransactionService } from '../services';
import { useNetwork } from '../contexts/NetworkContext';
import { useApiRequest } from '../hooks';
import type { BreadcrumbItem, TabItem } from '../types';

// Extended interface that matches the actual API response format
interface TransactionData {
  signature: string;
  status: 'success' | 'failure';
  confirmationStatus: string;
  blockTime: number;
  slot: number;
  block: number;
  fee: number;
  computeUnitsConsumed: number;
  recentBlockhash: string;
  transaction: {
    message: {
      accountKeys: Array<{
        pubkey: string;
        signer: boolean;
        writable: boolean;
        source: string;
      }>;
      instructions: Array<{
        programId: string;
        accounts: number[];
        data: string;
      }>;
      addressTableLookups: any[];
    };
    signatures: string[];
  };
  balanceChanges: Array<{
    account: string;
    before: number;
    after: number;
    change: number;
  }>;
  tokenTransfers: Array<{
    mint: string;
    source?: string;
    owner?: string;
    preAmount?: string;
    postAmount?: string;
    decimals: number;
  }>;
  logs: string[];
}

// Local interfaces for component use
interface BalanceChange {
  address: string;
  preAmount: number;
  postAmount: number;
}

interface TokenChange {
  address: string;
  mint: string;
  preAmount: string;
  postAmount: string;
  decimals: number;
}

interface ParsedInstruction {
  programId: string;
  accounts: (string | number)[];
  parsed?: {
    type: string;
    programName?: string;
  };
}

const TransactionDetailPage = () => {
  const { signature } = useParams<{ signature: string }>();
  const { network } = useNetwork();

  // Use our API hook for data fetching with loading/error states
  const {
    data: transaction,
    loading,
    error,
    execute: fetchTransaction
  } = useApiRequest<TransactionData, [string]>(
    async (sig: string) => {
      const response = await TransactionService.getTransaction(sig);
      // Return the full response to match ApiResponse<TransactionData> type
      return {
        success: response.success,
        data: response.data as unknown as TransactionData
      };
    },
    {
      onError: (err) => {
        toast.error(`Failed to load transaction: ${err.message}`);
      },
      dependencies: [network]
    }
  );

  // Fetch transaction data when signature or network changes
  useEffect(() => {
    if (signature) {
      fetchTransaction(signature);
    }
  }, [signature, network, fetchTransaction]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Transaction Details' }
  ];

  if (loading) {
    return (
      <DetailPageLayout 
        breadcrumbs={breadcrumbs}
        title="Transaction Details" 
        subtitle="Loading transaction data..."
      >
        <div className="space-y-8">
          <Card className="p-6">
            <Skeleton variant="text" lines={5} />
          </Card>
          <Card className="p-6">
            <Skeleton variant="text" lines={3} />
          </Card>
        </div>
      </DetailPageLayout>
    );
  }

  if (error || !transaction) {
    return (
      <DetailPageLayout breadcrumbs={breadcrumbs}>
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            {error ? 'Error Loading Transaction' : 'Transaction Not Found'}
          </h3>
          <p className="text-gray-400">
            {error 
              ? `There was an error loading this transaction: ${error.message}`
              : 'The transaction signature could not be found on the blockchain.'
            }
          </p>
          {error && (
            <button 
              onClick={() => signature && fetchTransaction(signature)}
              className="mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
        </Card>
      </DetailPageLayout>
    );
  }

  // Map API status to UI status
  const uiStatus = transaction.status === 'failure' ? 'failed' : 'success';
  
  // Extract instructions from the transaction
  const instructions = transaction.transaction?.message?.instructions || [];
  
  // Map balance changes to the expected format for rendering
  const solBalanceChanges: BalanceChange[] = transaction.balanceChanges?.map(change => ({
    address: change.account,
    preAmount: change.before / 1_000_000_000, // Convert lamports to SOL
    postAmount: change.after / 1_000_000_000  // Convert lamports to SOL
  })) || [];
  
  // Map token transfers to the expected format for rendering
  const tokenBalanceChanges: TokenChange[] = transaction.tokenTransfers?.map(transfer => ({
    address: transfer.owner || transfer.source || '',
    mint: transfer.mint || '',
    preAmount: transfer.preAmount || '0',
    postAmount: transfer.postAmount || '0',
    decimals: transfer.decimals || 9
  })) || [];
  
  // Format instructions for display
  const formattedInstructions: ParsedInstruction[] = instructions.map((instruction, index) => {
    // Try to extract program name from the logs or use a default
    const programId = instruction.programId || '';
    const accounts = instruction.accounts || [];
    
    return {
      programId,
      accounts,
      parsed: {
        type: `Instruction ${index + 1}`,
        programName: programId.substring(0, 6) + '...' + programId.substring(programId.length - 4)
      }
    };
  });

  const tabItems: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          {/* Transaction Overview */}
          <Card title="Transaction Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <StatusBadge status={uiStatus} />
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Signature</span>
                  <div className="flex items-center space-x-2">
                    <AddressDisplay 
                      address={transaction.signature}
                      truncate="middle"
                    />
                    <CopyButton text={transaction.signature} />
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Block</span>
                  <span className="text-white font-mono">
                    #{transaction.block?.toLocaleString() || 'Unknown'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Slot</span>
                  <span className="text-white font-mono">
                    {transaction.slot.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Timestamp</span>
                  <TimestampDisplay timestamp={transaction.blockTime} />
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Fee</span>
                  <span className="text-white">{transaction.fee / 1_000_000_000} SOL</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Recent Blockhash</span>
                  <span className="text-white font-mono text-xs truncate max-w-48">
                    {transaction.recentBlockhash}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Compute Units</span>
                  <Badge variant="success" size="sm">
                    {transaction.computeUnitsConsumed || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* SOL Balance Changes */}
          <Card title="SOL Balance Changes">
            <div className="space-y-4">
              {solBalanceChanges.map((change, index) => (
                <motion.div
                  key={`${change.address}-${index}`}
                  className="p-4 rounded-lg bg-white/2 border border-white/5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <AddressDisplay address={change.address} />
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${(change.postAmount - change.preAmount) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(change.postAmount - change.preAmount) > 0 ? '+' : ''}
                        {(change.postAmount - change.preAmount).toFixed(9)} SOL
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Before: </span>
                      <span className="text-white">{change.preAmount.toFixed(9)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">After: </span>
                      <span className="text-white">{change.postAmount.toFixed(9)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {solBalanceChanges.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No SOL balance changes in this transaction
                </div>
              )}
            </div>
          </Card>

          {/* Token Changes */}
          {tokenBalanceChanges && tokenBalanceChanges.length > 0 && (
            <Card title="Token Balance Changes">
              <div className="space-y-4">
                {tokenBalanceChanges.map((change, index) => {
                  // Calculate change amount
                  const preAmount = parseFloat(change.preAmount) / Math.pow(10, change.decimals);
                  const postAmount = parseFloat(change.postAmount) / Math.pow(10, change.decimals);
                  const changeAmount = postAmount - preAmount;
                  
                  return (
                    <motion.div
                      key={`${change.address}-${index}`}
                      className="p-4 rounded-lg bg-white/2 border border-white/5"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <AddressDisplay address={change.address} />
                          <Badge variant="neutral" size="sm" className="ml-2">
                            Unknown Token
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${changeAmount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {changeAmount > 0 ? '+' : ''}
                            {changeAmount.toFixed(change.decimals > 6 ? 6 : change.decimals)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Before: </span>
                          <span className="text-white">{preAmount.toFixed(change.decimals > 6 ? 6 : change.decimals)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">After: </span>
                          <span className="text-white">{postAmount.toFixed(change.decimals > 6 ? 6 : change.decimals)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Token: <AddressDisplay address={change.mint} truncate="middle" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'instructions',
      label: 'Instructions',
      content: (
        <div className="space-y-6">
          {formattedInstructions.map((instruction, index) => (
            <Card key={index} title={`Instruction ${index + 1}: ${instruction.parsed?.type || 'Unknown'}`}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 text-sm">Program</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <AddressDisplay address={instruction.programId} />
                      {instruction.parsed?.programName && (
                        <Badge variant="info" size="sm">{instruction.parsed.programName}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">Type</span>
                    <div className="mt-1">
                      <Badge variant="neutral">{instruction.parsed?.type || 'Unknown'}</Badge>
                    </div>
                  </div>
                </div>

                {instruction.accounts && instruction.accounts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Accounts</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {instruction.accounts.map((account, accIndex) => {
                        // Try to resolve account index to pubkey if it's a number
                        const accountPubkey = typeof account === 'number' && 
                          transaction.transaction?.message?.accountKeys?.[account]?.pubkey || account;
                        
                        return (
                          <div key={accIndex} className="text-sm bg-black/30 p-2 rounded">
                            <AddressDisplay address={accountPubkey.toString()} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {transaction.logs && transaction.logs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Logs</h4>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
                      {transaction.logs.slice(0, 20).map((log, logIndex) => (
                        <div key={logIndex} className="text-gray-300">
                          {log}
                        </div>
                      ))}
                      {transaction.logs.length > 20 && (
                        <div className="text-gray-400 text-center mt-2">
                          {transaction.logs.length - 20} more logs...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )
    },
    {
      id: 'raw',
      label: 'Raw Data',
      content: (
        <Card title="Raw Transaction Data">
          <div className="bg-black/50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300">
              {JSON.stringify(transaction, null, 2)}
            </pre>
          </div>
        </Card>
      )
    }
  ];

  return (
    <DetailPageLayout
      breadcrumbs={breadcrumbs}
      title="Transaction Details"
      subtitle={`Signature: ${signature}`}
      badges={[
        <Badge key="network" variant="info" size="sm">
          {network.toUpperCase()}
        </Badge>
      ]}
    >
      <Tabs items={tabItems} defaultTab="overview" onChange={() => {}} />
    </DetailPageLayout>
  );
};

export default TransactionDetailPage; 
