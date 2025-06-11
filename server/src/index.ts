import { Context, Hono, Next } from 'hono';
import { cors } from 'hono/cors';

// Import all route handlers
import networkRouter from './routes/network';
import searchRouter from './routes/search';
import transactionsRouter from './routes/transactions';
import blocksRouter from './routes/blocks';
import addressesRouter from './routes/addresses';

// Phase 2 route handlers
import addressTransactionsRouter from './routes/addressTransactions';
import addressTokensRouter from './routes/addressTokens';
import blockTransactionsRouter from './routes/blockTransactions';
import updatesRouter from './routes/updates';

// Phase 3 route handlers
import analyticsRouter from './routes/analytics';
import tokensRouter from './routes/tokens';
import addressNftsRouter from './routes/addressNfts';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// RPC URL configuration
const mainNet = `https://solana-mainnet.g.alchemy.com/v2/TXyG7YUobUcYv36DZd9C8Mr0IGTUcHG-`;
const devNet = `https://solana-devnet.g.alchemy.com/v2/TXyG7YUobUcYv36DZd9C8Mr0IGTUcHG-`;

// Middleware to set RPC URL based on network
async function MainnetMiddleware(c: Context, next: Next) {
  c.req.rpcUrl = mainNet;
  await next();
}

async function DevnetMiddleware(c: Context, next: Next) {
  c.req.rpcUrl = devNet;
  await next();
}

// Apply network middleware
app.use('/api/v1/mainnet/*', MainnetMiddleware);
app.use('/api/v1/devnet/*', DevnetMiddleware);

// Mount Phase 1 routers
app.route('/api/v1/mainnet/network', networkRouter);
app.route('/api/v1/mainnet/search', searchRouter);
app.route('/api/v1/mainnet/transactions', transactionsRouter);
app.route('/api/v1/mainnet/blocks', blocksRouter);
app.route('/api/v1/mainnet/addresses', addressesRouter);

app.route('/api/v1/devnet/network', networkRouter);
app.route('/api/v1/devnet/search', searchRouter);
app.route('/api/v1/devnet/transactions', transactionsRouter);
app.route('/api/v1/devnet/blocks', blocksRouter);
app.route('/api/v1/devnet/addresses', addressesRouter);

// Mount Phase 2 routers
app.route('/api/v1/mainnet/addresses', addressTransactionsRouter);
app.route('/api/v1/mainnet/addresses', addressTokensRouter);
app.route('/api/v1/mainnet/blocks', blockTransactionsRouter);
app.route('/api/v1/mainnet/updates', updatesRouter);

app.route('/api/v1/devnet/addresses', addressTransactionsRouter);
app.route('/api/v1/devnet/addresses', addressTokensRouter);
app.route('/api/v1/devnet/blocks', blockTransactionsRouter);
app.route('/api/v1/devnet/updates', updatesRouter);

// Mount Phase 3 routers
app.route('/api/v1/mainnet/analytics', analyticsRouter);
app.route('/api/v1/mainnet/tokens', tokensRouter);
app.route('/api/v1/mainnet/addresses', addressNftsRouter);

app.route('/api/v1/devnet/analytics', analyticsRouter);
app.route('/api/v1/devnet/tokens', tokensRouter);
app.route('/api/v1/devnet/addresses', addressNftsRouter);

// Legacy routes for backward compatibility (if needed)
app.get('/api/network/stats', async (c) => {
  c.req.rpcUrl = mainNet; // Default to mainnet for legacy routes
  return await networkRouter.fetch(c.req.raw, c.env);
});

app.get('/api/search', async (c) => {
  c.req.rpcUrl = mainNet;
  return await searchRouter.fetch(c.req.raw, c.env);
});

app.get('/api/transactions/:signature', async (c) => {
  c.req.rpcUrl = mainNet;
  return await transactionsRouter.fetch(c.req.raw, c.env);
});

app.get('/api/blocks/:slot', async (c) => {
  c.req.rpcUrl = mainNet;
  return await blocksRouter.fetch(c.req.raw, c.env);
});

app.get('/api/addresses/:address', async (c) => {
  c.req.rpcUrl = mainNet;
  return await addressesRouter.fetch(c.req.raw, c.env);
});

// Phase 2 legacy routes
app.get('/api/addresses/:address/transactions', async (c) => {
  c.req.rpcUrl = mainNet;
  return await addressTransactionsRouter.fetch(c.req.raw, c.env);
});

app.get('/api/addresses/:address/tokens', async (c) => {
  c.req.rpcUrl = mainNet;
  return await addressTokensRouter.fetch(c.req.raw, c.env);
});

app.get('/api/blocks/:slot/transactions', async (c) => {
  c.req.rpcUrl = mainNet;
  return await blockTransactionsRouter.fetch(c.req.raw, c.env);
});

app.get('/api/updates/latest', async (c) => {
  c.req.rpcUrl = mainNet;
  return await updatesRouter.fetch(c.req.raw, c.env);
});

app.get('/api/addresses/:address/updates', async (c) => {
  c.req.rpcUrl = mainNet;
  return await updatesRouter.fetch(c.req.raw, c.env);
});

// Phase 3 legacy routes
app.get('/api/analytics/*', async (c) => {
  c.req.rpcUrl = mainNet;
  return await analyticsRouter.fetch(c.req.raw, c.env);
});

app.get('/api/tokens/:mint', async (c) => {
  c.req.rpcUrl = mainNet;
  return await tokensRouter.fetch(c.req.raw, c.env);
});

app.get('/api/addresses/:address/nfts', async (c) => {
  c.req.rpcUrl = mainNet;
  return await addressNftsRouter.fetch(c.req.raw, c.env);
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: "Welcome to Solux API",
    version: "3.0.0",
    phases: {
      phase1: "Core APIs - Network stats, search, transactions, blocks, addresses",
      phase2: "Enhanced Features - Address transactions/tokens, block transactions, real-time updates",
      phase3: "Advanced Analytics - Network analytics, charts, token details, NFTs, program analytics, DeFi data"
    },
    endpoints: {
      mainnet: {
        // Phase 1 endpoints
        network: "/api/v1/mainnet/network/stats",
        search: "/api/v1/mainnet/search?q={query}&type={auto|transaction|block|address}",
        transaction: "/api/v1/mainnet/transactions/{signature}",
        block: "/api/v1/mainnet/blocks/{slot}",
        address: "/api/v1/mainnet/addresses/{address}",
        
        // Phase 2 endpoints
        addressTransactions: "/api/v1/mainnet/addresses/{address}/transactions?limit={50}&filter={all|sent|received|program}",
        addressTokens: "/api/v1/mainnet/addresses/{address}/tokens?includeNFTs={false}&includePrices={true}",
        blockTransactions: "/api/v1/mainnet/blocks/{slot}/transactions?limit={100}&status={all|success|failed}",
        latestUpdates: "/api/v1/mainnet/updates/latest?types={all|blocks,transactions,network}",
        addressUpdates: "/api/v1/mainnet/addresses/{address}/updates?since={ISO-timestamp}",
        
        // Phase 3 endpoints
        analyticsOverview: "/api/v1/mainnet/analytics/overview?timeframe={24h|7d|30d}&includeHistory={true}",
        tpsCharts: "/api/v1/mainnet/analytics/charts/tps?timeframe={1h|6h|24h|7d|30d}&granularity={minute|hour|day}",
        feesCharts: "/api/v1/mainnet/analytics/charts/fees?timeframe={1h|6h|24h|7d|30d}&metric={total|average|median}",
        validatorsCharts: "/api/v1/mainnet/analytics/charts/validators?timeframe={24h|7d|30d|90d}&metric={count|stake|performance}",
        programAnalytics: "/api/v1/mainnet/analytics/programs?timeframe={24h|7d|30d}&category={defi|nft|gaming|infrastructure|all}",
        defiAnalytics: "/api/v1/mainnet/analytics/defi?timeframe={24h|7d|30d}&includeHistorical={true}",
        tokenDetails: "/api/v1/mainnet/tokens/{mint}?includeHolders={false}&includeHistory={true}&timeframe={24h|7d|30d}",
        addressNfts: "/api/v1/mainnet/addresses/{address}/nfts?limit={100}&includeMetadata={true}&sortBy={name|collection|rarity|floorPrice}"
      },
      devnet: {
        // Phase 1 endpoints  
        network: "/api/v1/devnet/network/stats",
        search: "/api/v1/devnet/search?q={query}&type={auto|transaction|block|address}",
        transaction: "/api/v1/devnet/transactions/{signature}",
        block: "/api/v1/devnet/blocks/{slot}",
        address: "/api/v1/devnet/addresses/{address}",
        
        // Phase 2 endpoints
        addressTransactions: "/api/v1/devnet/addresses/{address}/transactions?limit={50}&filter={all|sent|received|program}",
        addressTokens: "/api/v1/devnet/addresses/{address}/tokens?includeNFTs={false}&includePrices={true}",
        blockTransactions: "/api/v1/devnet/blocks/{slot}/transactions?limit={100}&status={all|success|failed}",
        latestUpdates: "/api/v1/devnet/updates/latest?types={all|blocks,transactions,network}",
        addressUpdates: "/api/v1/devnet/addresses/{address}/updates?since={ISO-timestamp}",
        
        // Phase 3 endpoints
        analyticsOverview: "/api/v1/devnet/analytics/overview?timeframe={24h|7d|30d}&includeHistory={true}",
        tpsCharts: "/api/v1/devnet/analytics/charts/tps?timeframe={1h|6h|24h|7d|30d}&granularity={minute|hour|day}",
        feesCharts: "/api/v1/devnet/analytics/charts/fees?timeframe={1h|6h|24h|7d|30d}&metric={total|average|median}",
        validatorsCharts: "/api/v1/devnet/analytics/charts/validators?timeframe={24h|7d|30d|90d}&metric={count|stake|performance}",
        programAnalytics: "/api/v1/devnet/analytics/programs?timeframe={24h|7d|30d}&category={defi|nft|gaming|infrastructure|all}",
        defiAnalytics: "/api/v1/devnet/analytics/defi?timeframe={24h|7d|30d}&includeHistorical={true}",
        tokenDetails: "/api/v1/devnet/tokens/{mint}?includeHolders={false}&includeHistory={true}&timeframe={24h|7d|30d}",
        addressNfts: "/api/v1/devnet/addresses/{address}/nfts?limit={100}&includeMetadata={true}&sortBy={name|collection|rarity|floorPrice}"
      },
      legacy: {
        // Phase 1 legacy
        network: "/api/network/stats",
        search: "/api/search?q={query}&type={auto|transaction|block|address}",
        transaction: "/api/transactions/{signature}",
        block: "/api/blocks/{slot}",
        address: "/api/addresses/{address}",
        
        // Phase 2 legacy
        addressTransactions: "/api/addresses/{address}/transactions",
        addressTokens: "/api/addresses/{address}/tokens",
        blockTransactions: "/api/blocks/{slot}/transactions",
        latestUpdates: "/api/updates/latest",
        addressUpdates: "/api/addresses/{address}/updates",
        
        // Phase 3 legacy
        analyticsOverview: "/api/analytics/overview",
        tpsCharts: "/api/analytics/charts/tps",
        feesCharts: "/api/analytics/charts/fees",
        validatorsCharts: "/api/analytics/charts/validators",
        programAnalytics: "/api/analytics/programs",
        defiAnalytics: "/api/analytics/defi",
        tokenDetails: "/api/tokens/{mint}",
        addressNfts: "/api/addresses/{address}/nfts"
      }
    },
    features: {
      caching: "HTTP caching headers for optimal performance",
      rateLimiting: "Tiered rate limits based on endpoint complexity",
      validation: "Comprehensive Zod validation for all parameters",
      errorHandling: "Standardized error responses with detailed codes",
      realTimePolling: "HTTP polling for real-time-like updates"
    },
    documentation: "https://github.com/your-repo/solux-api#readme"
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      details: 'The requested endpoint does not exist'
    },
    timestamp: new Date().toISOString()
  }, 404 as any);
});

// Global error handler
app.onError((err, c) => {
  console.error('Global error:', err);
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      details: err.message
    },
    timestamp: new Date().toISOString()
  }, 500 as any);
});

export default app;
