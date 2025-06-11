import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import AddressDisplay from './AddressDisplay';
import TimestampDisplay from './TimestampDisplay';
import type { BlockTransaction, AddressTransaction } from '../../types';

interface TransactionRowProps {
  transaction: BlockTransaction | AddressTransaction | any;
  variant?: 'block' | 'address';
  index?: number;
}

const TransactionRow = ({ transaction, variant = 'block', index }: TransactionRowProps) => {
  // Handle API transactions which have a different shape
  const status = transaction.status?.toLowerCase?.() || 'unknown';
  const transactionSignature = transaction.signature;
  const fee = transaction.fee || 0;
  const timestamp = transaction.blockTime || transaction.timestamp;
  const computeUnits = transaction.computeUnits || (transaction.instructions?.count || 0) * 50000; // Estimate if not available
  
  return (
    <Link
      to={`/tx/${transactionSignature}`}
      className="block p-4 rounded-lg border border-gray-800 hover:border-purple-500 bg-black/30 hover:bg-black/50 transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        {/* Left section with index and status */}
        <div className="flex items-center gap-3 md:w-1/4">
          {index !== undefined && (
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400">
              {index + 1}
            </span>
          )}
          
          <div className="flex flex-col">
            <StatusBadge status={status} />
            {timestamp && (
              <div className="mt-1 text-xs text-gray-400">
                <TimestampDisplay timestamp={timestamp} />
              </div>
            )}
          </div>
        </div>
        
        {/* Middle section with signature */}
        <div className="md:flex-1">
          <AddressDisplay
            address={transactionSignature}
            truncate="middle"
            className="text-white"
          />
          
          {/* Show counterparty for address variant */}
          {variant === 'address' && (transaction as AddressTransaction).counterparty && (
            <div className="mt-1 text-xs text-gray-400">
              {(transaction as AddressTransaction).type === 'receive' ? 'From: ' : 'To: '}
              <AddressDisplay
                address={(transaction as AddressTransaction).counterparty!}
                truncate="middle"
                className="text-gray-300"
              />
            </div>
          )}
        </div>
        
        {/* Right section with transaction details */}
        <div className="flex items-center justify-between md:justify-end gap-4 md:w-1/4">
          {/* Fee information */}
          <div className="text-right">
            <div className="text-xs text-gray-400">Fee</div>
            <div className="text-sm text-white">{fee.toFixed(6)} SOL</div>
          </div>
          
          {/* Program/Amount information based on variant */}
          {variant === 'block' ? (
            <div className="text-right">
              <div className="text-xs text-gray-400">Compute</div>
              <div className="text-sm text-gray-300">{computeUnits.toLocaleString()}</div>
            </div>
          ) : (
            (transaction as AddressTransaction).amount && (
              <div className="text-right">
                <div className="text-xs text-gray-400">Amount</div>
                <div className="text-sm text-white">
                  {(transaction as AddressTransaction).amount?.toFixed(6)} 
                  {(transaction as AddressTransaction).token ? 
                    ` ${(transaction as AddressTransaction).token}` : 
                    ' SOL'}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </Link>
  );
};

export default TransactionRow; 