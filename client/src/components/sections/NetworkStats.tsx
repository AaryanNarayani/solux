import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { NetworkService } from '../../services';
import { useNetwork } from '../../contexts/NetworkContext';
import type { NetworkStatsResponse } from '../../types/api';

const NetworkStats = () => {
  const { network } = useNetwork();
  const [stats, setStats] = useState<NetworkStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch network stats on mount and when network changes
  useEffect(() => {
    const fetchNetworkStats = async () => {
      try {
        setLoading(true);
        const response = await NetworkService.getNetworkStats();
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching network stats:', err);
        setError('Unable to fetch network statistics');
        // If there's an error, we'll fall back to mock data
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkStats();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchNetworkStats, 10000);
    return () => clearInterval(interval);
  }, [network]);

  // Generate stat cards data
  const getStatCards = () => {
    // Default mock data (fallback if API fails)
    const mockStats = {
      currentSlot: 287459123,
      epochInfo: {
        epoch: 612,
        slotIndex: 432000,
        slotsInEpoch: 432000,
        absoluteSlot: 287459123,
        blockHeight: 287459123,
      },
      performance: {
        tps: 2847,
        avgTps1m: 2750,
        avgTps5m: 2650,
      },
      validators: {
        total: 1912,
        active: 1842,
        delinquent: 70,
      },
      supply: {
        total: 584200000,
        circulating: 420000000,
        nonCirculating: 164200000,
      },
      health: 'healthy' as const,
    };

    // Use real data if available, otherwise fallback to mock data
    const data = stats || mockStats;

    // Format the total supply in millions with 1 decimal place
    const formatTotalSupply = (value: number) => {
      return `${(value / 1000000).toFixed(1)}M`;
    };

    return [
      {
        label: 'Transactions/sec',
        value: data.performance.tps.toLocaleString(),
        suffix: 'TPS',
        trend: `+${((data.performance.tps / data.performance.avgTps5m - 1) * 100).toFixed(1)}%`,
        icon: '⚡',
        gradient: 'from-purple-400/20 to-pink-400/20',
        border: 'border-purple-400/30'
      },
      {
        label: 'Current Slot',
        value: data.currentSlot.toLocaleString(),
        suffix: '',
        trend: '+0.12%',
        icon: '🔗',
        gradient: 'from-teal-400/20 to-blue-400/20',
        border: 'border-teal-400/30'
      },
      {
        label: 'Current Epoch',
        value: data.epochInfo.epoch.toString(),
        suffix: '',
        trend: `${((data.epochInfo.slotIndex / data.epochInfo.slotsInEpoch) * 100).toFixed(1)}%`,
        icon: '🌐',
        gradient: 'from-green-400/20 to-teal-400/20',
        border: 'border-green-400/30'
      },
      {
        label: 'Block Height',
        value: data.epochInfo.blockHeight.toLocaleString(),
        suffix: '',
        trend: '+0.12%',
        icon: '📦',
        gradient: 'from-blue-400/20 to-purple-400/20',
        border: 'border-blue-400/30'
      },
      {
        label: 'Total Supply',
        value: formatTotalSupply(data.supply.total),
        suffix: 'SOL',
        trend: '+0.01%',
        icon: '💎',
        gradient: 'from-yellow-400/20 to-orange-400/20',
        border: 'border-yellow-400/30'
      },
      {
        label: 'Active Validators',
        value: data.validators.active.toLocaleString(),
        suffix: '',
        trend: `${((data.validators.active / data.validators.total) * 100).toFixed(1)}%`,
        icon: '🛡️',
        gradient: 'from-indigo-400/20 to-purple-400/20',
        border: 'border-indigo-400/30'
      }
    ];
  };

  const statCards = getStatCards();

  return (
    <section id="network-stats" className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
            Live Network
            <span 
              className="bg-clip-text text-transparent font-normal ml-4"
              style={{ 
                background: 'linear-gradient(135deg, #DC1FFF, #00FFA3)',
                WebkitBackgroundClip: 'text'
              }}
            >
              Stats
            </span>
            <span className="text-sm ml-2 text-gray-400">({network})</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Real-time Solana network metrics and performance indicators
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {loading ? (
            // Loading skeleton
            Array(6).fill(0).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                className="relative p-6 rounded-xl backdrop-blur-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                  <div className="w-16 h-4 rounded-full bg-white/10 animate-pulse" />
                </div>
                <div className="w-24 h-4 mb-4 rounded-full bg-white/10 animate-pulse" />
                <div className="w-32 h-8 rounded-full bg-white/10 animate-pulse" />
                <div className="mt-4 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-white/10 animate-pulse mr-2" />
                  <div className="w-10 h-3 rounded-full bg-white/10 animate-pulse" />
                </div>
              </motion.div>
            ))
          ) : error ? (
            // Error state
            <motion.div
              className="col-span-1 md:col-span-2 lg:col-span-3 p-6 rounded-xl backdrop-blur-xl bg-red-400/10 border border-red-400/30 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-2xl mb-2">⚠️</div>
              <h3 className="text-red-400 font-medium mb-2">Error Loading Network Stats</h3>
              <p className="text-gray-400">{error}</p>
              <p className="text-gray-500 text-sm mt-2">Showing mock data instead</p>
            </motion.div>
          ) : (
            // Actual stats
            statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                className={`relative p-6 rounded-xl backdrop-blur-xl bg-gradient-to-br ${stat.gradient} border ${stat.border} group hover:scale-105 transition-all duration-300`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  {/* Icon and trend */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-green-400 text-sm font-medium">
                      {stat.trend}
                    </span>
                  </div>

                  {/* Label */}
                  <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">
                    {stat.label}
                  </h3>

                  {/* Value */}
                  <div className="flex items-baseline space-x-2">
                    <motion.span
                      className="text-2xl md:text-3xl font-light text-white"
                      key={stat.value}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {stat.value}
                    </motion.span>
                    {stat.suffix && (
                      <span className="text-gray-400 text-sm font-medium">
                        {stat.suffix}
                      </span>
                    )}
                  </div>

                  {/* Live indicator */}
                  <div className="flex items-center space-x-2 mt-4">
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-gray-500 text-xs">Live</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Network Health Indicator */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {stats ? (
            <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full ${
              stats.health === 'healthy' 
                ? 'bg-green-400/10 border border-green-400/30' 
                : stats.health === 'warning'
                ? 'bg-yellow-400/10 border border-yellow-400/30'
                : 'bg-red-400/10 border border-red-400/30'
            }`}>
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  stats.health === 'healthy' 
                    ? 'bg-green-400' 
                    : stats.health === 'warning'
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className={`font-medium ${
                stats.health === 'healthy' 
                  ? 'text-green-400' 
                  : stats.health === 'warning'
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}>
                {stats.health === 'healthy' 
                  ? 'Network Healthy' 
                  : stats.health === 'warning'
                  ? 'Network Warning'
                  : 'Network Critical'}
              </span>
              <span className="text-gray-400 text-sm">
                {stats.health === 'healthy' 
                  ? '• All systems operational' 
                  : stats.health === 'warning'
                  ? '• Some systems degraded'
                  : '• System performance issues'}
              </span>
            </div>
          ) : (
            // Default healthy state
            <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full bg-green-400/10 border border-green-400/30">
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-green-400 font-medium">Network Healthy</span>
              <span className="text-gray-400 text-sm">• All systems operational</span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default NetworkStats; 