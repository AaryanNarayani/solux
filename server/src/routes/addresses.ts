import { Hono } from 'hono';
import { AddressParamsSchema, AddressQuerySchema } from '../schemas';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest } from '../utils/responses';

const addressesRouter = new Hono();

addressesRouter.get('/:address', async (c) => {
  try {
    // Validate path parameters
    const paramsValidation = AddressParamsSchema.safeParse({
      address: c.req.param('address')
    });

    if (!paramsValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_ADDRESS,
        'Invalid address format',
        paramsValidation.error.issues
      );
    }

    // Validate query parameters
    const queryParams = {
      commitment: c.req.query('commitment') || 'confirmed',
      includeTokens: c.req.query('includeTokens') || 'false',
      encoding: c.req.query('encoding') || 'base58'
    };

    const queryValidation = AddressQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { address } = paramsValidation.data;
    const { commitment, includeTokens, encoding } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    // Get account info
    const accountInfo = await makeRpcRequest(rpcUrl, 'getBalance', [
      address
    ]);

    // Also get account info for additional details
    const accountDetails = await makeRpcRequest(rpcUrl, 'getAccountInfo', [
      address,
      {
        encoding,
        commitment
      }
    ]);

    const exists = accountInfo !== null;
    let tokens: any[] = [];
    let nfts: any[] = [];

    // Get token accounts if requested
    if (includeTokens && exists) {
      try {
        const tokenAccounts = await makeRpcRequest(rpcUrl, 'getTokenAccountsByOwner', [
          address,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }, // SPL Token program
          { encoding: 'jsonParsed' }
        ]);

        if (tokenAccounts?.value) {
          for (const tokenAccount of tokenAccounts.value) {
            const tokenData = tokenAccount.account?.data?.parsed?.info;
            if (tokenData) {
              tokens.push({
                mint: tokenData.mint,
                account: tokenAccount.pubkey,
                amount: parseInt(tokenData.tokenAmount.amount),
                decimals: tokenData.tokenAmount.decimals,
                uiAmount: tokenData.tokenAmount.uiAmount
              });
            }
          }
        }

        // Get NFTs (simplified - would need Metaplex parsing for full NFT data)
        const nftAccounts = await makeRpcRequest(rpcUrl, 'getTokenAccountsByOwner', [
          address,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
          { encoding: 'jsonParsed' }
        ]);

        if (nftAccounts?.value) {
          for (const nftAccount of nftAccounts.value) {
            const nftData = nftAccount.account?.data?.parsed?.info;
            if (nftData && nftData.tokenAmount.amount === '1' && nftData.tokenAmount.decimals === 0) {
              // This is likely an NFT (amount = 1, decimals = 0)
              nfts.push({
                mint: nftData.mint,
                name: 'Unknown NFT', // Would need Metaplex metadata parsing
                symbol: '',
                image: undefined,
                collection: undefined,
                attributes: undefined
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
        // Continue without tokens if there's an error
      }
    }

    // Get transaction statistics (simplified)
    const stats = await getAddressStats(rpcUrl, address);

    // Check if it's a program
    const programInfo = exists && accountDetails?.executable ? await getProgramInfo(address) : undefined;

    const addressResponse = {
      address,
      exists,
      account: exists ? {
        // Use the value directly if accountInfo is a simple number, otherwise pass through the object
        lamports: typeof accountInfo === 'number' ? accountInfo : accountInfo,
        owner: accountDetails?.owner,
        executable: accountDetails?.executable,
        rentEpoch: accountDetails?.rentEpoch,
        data: {
          program: accountDetails?.owner,
          parsed: accountDetails?.data?.parsed || undefined,
          raw: encoding === 'base64' ? accountDetails?.data : undefined
        }
      } : null,
      tokens: includeTokens ? tokens : undefined,
      nfts: includeTokens ? nfts : undefined,
      stats,
      // Add a type field to explicitly identify the account type
      type: accountDetails?.executable ? 'program' : 'wallet',
      programInfo: exists && accountDetails?.executable ? await getProgramInfo(address) : undefined
    };

    return sendSuccess(c, addressResponse);

  } catch (error) {
    console.error('Address fetch error:', error);
    
    if (error instanceof Error && error.message.includes('Invalid param')) {
      return sendError(c, ERROR_CODES.INVALID_ADDRESS, 'Invalid address format');
    }
    
    return sendError(
      c,
      ERROR_CODES.RPC_ERROR,
      'Failed to fetch address information',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

async function getAddressStats(rpcUrl: string, address: string) {
  try {
    // Get recent transactions (simplified - real implementation would need more sophisticated querying)
    const signatures = await makeRpcRequest(rpcUrl, 'getSignaturesForAddress', [
      address,
      { limit: 100 }
    ]);

    let totalSent = 0;
    let totalReceived = 0;
    let firstTransaction: string | null = null;
    let lastTransaction: string | null = null;

    if (signatures && signatures.length > 0) {
      lastTransaction = new Date(signatures[0].blockTime * 1000).toISOString();
      firstTransaction = new Date(signatures[signatures.length - 1].blockTime * 1000).toISOString();

      // This is a simplified calculation - real implementation would need to parse transactions
      // to determine actual sent/received amounts
    }

    return {
      transactionCount: signatures?.length || 0,
      firstTransaction,
      lastTransaction,
      totalSent,
      totalReceived
    };
  } catch {
    return {
      transactionCount: 0,
      firstTransaction: null,
      lastTransaction: null,
      totalSent: 0,
      totalReceived: 0
    };
  }
}

async function getProgramInfo(address: string) {
  // This would typically query a program registry or metadata service
  // For now, return basic info for known programs
  const knownPrograms: Record<string, any> = {
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': {
      name: 'SPL Token Program',
      description: 'Solana Program Library Token Program',
      website: 'https://spl.solana.com/',
      github: 'https://github.com/solana-labs/solana-program-library',
      verified: true
    },
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': {
      name: 'Associated Token Account Program',
      description: 'Associated Token Account Program',
      website: 'https://spl.solana.com/',
      github: 'https://github.com/solana-labs/solana-program-library',
      verified: true
    }
  };

  return knownPrograms[address] || {
    name: 'Unknown Program',
    description: 'Custom program',
    verified: false
  };
}

export default addressesRouter; 