export interface SearchResult {
  type: 'transaction' | 'block' | 'address' | 'token';
  value: string;
  description?: string;
}

export interface NetworkStats {
  tps: number;
  slot: number;
  epoch: number;
  blockHeight: number;
  totalSupply: string;
  activeValidators: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

export interface ButtonVariant {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  isQuerying?: boolean;
}

export interface WaveConfig {
  amplitude: number;
  frequency: number;
  speed: number;
  color: string;
  opacity: number;
}

export interface NetworkStatsData {
  tps: number;
  totalTransactions: string;
  averageBlockTime: number;
  currentSlot: number;
  validators: number;
  solPrice: number;
}

export interface TransactionStatus {
  status: 'success' | 'failed' | 'pending';
  confirmations: number;
  error?: string;
}

export interface TransactionOverview {
  signature: string;
  status: TransactionStatus;
  block: number;
  slot: number;
  timestamp: number;
  fee: number; // in SOL
  computeUnits: number;
  recentBlockhash: string;
}

export interface AccountChange {
  account: string;
  balanceBefore: number;
  balanceAfter: number;
  change: number;
  tokenMint?: string;
  tokenSymbol?: string;
}

export interface TransactionInstruction {
  programId: string;
  programName?: string;
  type: string;
  data: any;
  accounts: string[];
  logs?: string[];
}

export interface TransactionDetail {
  overview: TransactionOverview;
  accountChanges: AccountChange[];
  instructions: TransactionInstruction[];
  rawData: any;
}

export interface BlockOverview {
  slot: number;
  blockHash: string;
  previousBlockHash: string;
  timestamp: number;
  blockHeight: number;
  transactionCount: number;
  leader: string;
  parentSlot: number;
  totalFees: number;
}

export interface BlockTransaction {
  signature: string;
  status: 'success' | 'failed';
  fee: number;
  computeUnits: number;
  version: 'legacy' | 'versioned';
}

export interface BlockDetail {
  overview: BlockOverview;
  transactions: BlockTransaction[];
  hasMore: boolean;
  totalTransactions: number;
}

export interface TokenHolding {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  usdValue?: number;
  logoUri?: string;
}

export interface NFTHolding {
  mint: string;
  name: string;
  collection?: string;
  imageUri?: string;
  floorPrice?: number;
}

export interface AddressTransaction {
  signature: string;
  type: 'send' | 'receive' | 'swap' | 'other';
  status: 'success' | 'failed';
  timestamp: number;
  amount?: number;
  token?: string;
  counterparty?: string;
  fee: number;
}

export interface AddressOverview {
  address: string;
  type: 'wallet' | 'program' | 'token' | 'unknown';
  solBalance: number;
  isExecutable: boolean;
  owner?: string;
  lastActivity?: number;
  totalTransactions: number;
}

export interface AddressDetail {
  overview: AddressOverview;
  tokenHoldings: TokenHolding[];
  nftHoldings: NFTHolding[];
  recentTransactions: AddressTransaction[];
  associatedAccounts: string[];
  hasMoreTransactions: boolean;
}

export interface SearchFilters {
  type?: 'all' | 'transactions' | 'addresses' | 'blocks' | 'tokens';
  timeRange?: 'all' | '24h' | '7d' | '30d';
  status?: 'all' | 'success' | 'failed';
}

export interface SearchResults {
  query: string;
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  filters: SearchFilters;
}

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface ToastOptions {
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
} 