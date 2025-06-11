import type { TransactionResponse } from '../../types/api';

/**
 * Mock Transaction Response
 * @param signature Transaction signature to include in the response
 */
export const mockTransactionResponse = (signature: string): TransactionResponse => ({
  success: true,
  data: {
    signature: signature,
    slot: 245678912,
    blockTime: Math.floor(Date.now() / 1000) - 300,
    blockHeight: 223456789,
    fee: 0.000005,
    status: 'success',
    recentBlockhash: 'H7WyKB3Sgt9a9V3CQx7LQe8iBFa4Kj8W5X9P2Q1R3T6M',
    confirmations: 32,
    instructions: [
      {
        programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        accounts: [
          'So11111111111111111111111111111111111111112',
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
        ],
        data: 'base64data',
        parsed: {
          type: 'Swap',
          programName: 'Jupiter Aggregator',
          data: { 
            inputMint: 'So11111111111111111111111111111111111111112', 
            outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' 
          }
        }
      }
    ],
    signer: 'DznpEHjgea8xZm2WpWYATHy1YEj9oKYGG5hHnLAj4Lh2',
    innerInstructions: [],
    logs: [
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 invoke [1]',
      'Program log: Instruction: Swap',
      'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]'
    ],
    accountsData: {},
    tokenBalanceChanges: [
      {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        owner: 'DznpEHjgea8xZm2WpWYATHy1YEj9oKYGG5hHnLAj4Lh2',
        preAmount: '0',
        postAmount: '1000000000',
        decimals: 6
      }
    ],
    solBalanceChanges: [
      {
        address: 'DznpEHjgea8xZm2WpWYATHy1YEj9oKYGG5hHnLAj4Lh2',
        preAmount: 1.5,
        postAmount: 0.5
      }
    ]
  }
}); 