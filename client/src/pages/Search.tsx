import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DetailPageLayout from '../components/layout/DetailPageLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import AddressDisplay from '../components/common/AddressDisplay';
import type { SearchResults, SearchFilters, BreadcrumbItem } from '../types';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    timeRange: 'all',
    status: 'all'
  });

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, filters]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults: SearchResults = {
        query: searchQuery,
        total: 156,
        hasMore: true,
        filters,
        results: [
          {
            type: 'transaction',
            value: '5j7VkPqY6K8ZQ9XN5rW7T3M8P1L4B9C6X2H5S8D3F7A2J9',
            description: 'Token Transfer - 1000 USDC'
          },
          {
            type: 'address',
            value: 'So11111111111111111111111111111111111111112',
            description: 'Wrapped SOL Token Program'
          },
          {
            type: 'block',
            value: '245678912',
            description: 'Block #245,678,912 - 3 minutes ago'
          },
          {
            type: 'transaction',
            value: '2k8VjQ9XN5rW7T3M8P1L4B9C6X2H5S8D3F7A2J95j7Vp',
            description: 'Program Execution - Jupiter Swap'
          }
        ]
      };
      
      setResults(mockResults);
      setLoading(false);
    }, 1000);
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Search Results' }
  ];

  const handleResultClick = (result: any) => {
    switch (result.type) {
      case 'transaction':
        navigate(`/transaction/${result.value}`);
        break;
      case 'address':
        navigate(`/address/${result.value}`);
        break;
      case 'block':
        navigate(`/block/${result.value}`);
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return '📄';
      case 'address':
        return '👤';
      case 'block':
        return '🧱';
      case 'token':
        return '🪙';
      default:
        return '🔍';
    }
  };

  return (
    <DetailPageLayout
      breadcrumbs={breadcrumbs}
      title={`Search Results for "${query}"`}
      subtitle={results ? `Found ${results.total} results` : undefined}
    >
      <div className="space-y-8">
        {/* Filters */}
        <Card title="Filters" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Types</option>
                <option value="transactions">Transactions</option>
                <option value="addresses">Addresses</option>
                <option value="blocks">Blocks</option>
                <option value="tokens">Tokens</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div className="flex-1">
                    <Skeleton variant="text" width="60%" className="mb-2" />
                    <Skeleton variant="text" width="40%" />
                  </div>
                  <Skeleton variant="rectangular" width={80} height={24} />
                </div>
              </Card>
            ))
          ) : results && results.results.length > 0 ? (
            results.results.map((result, index) => (
              <motion.div
                key={`${result.type}-${result.value}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className="p-6 cursor-pointer hover:border-purple-500/30"
                  onClick={() => handleResultClick(result)}
                  hover
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">
                      {getResultIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant="info" size="sm">
                          {result.type}
                        </Badge>
                      </div>
                      
                      <AddressDisplay 
                        address={result.value}
                        truncate="middle"
                        showCopy={false}
                        className="text-purple-400 mb-1"
                      />
                      
                      {result.description && (
                        <p className="text-sm text-gray-400">
                          {result.description}
                        </p>
                      )}
                    </div>

                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                No results found
              </h3>
              <p className="text-gray-400">
                Try adjusting your search query or filters
              </p>
            </Card>
          )}
        </div>

        {/* Load More */}
        {results && results.hasMore && (
          <div className="text-center">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
              Load More Results
            </button>
          </div>
        )}
      </div>
    </DetailPageLayout>
  );
};

export default Search; 