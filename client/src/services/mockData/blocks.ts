import type { BlockResponse, BlockTransactionsResponse } from '../../types/api';

/**
 * Mock Block Response
 * @param slot Block slot number to include in the response
 */
export const mockBlockResponse = (slot: number): BlockResponse => ({
  success: true,
  data: {
    slot: slot,
    blockhash: 'H7WyKB3Sgt9a9V3CQx7LQe8iBFa4Kj8W5X9P2Q1R3T6M8S4D',
    blockTime: Math.floor(Date.now() / 1000) - 180,
    blockHeight: slot,
    parentSlot: slot - 1,
    previousBlockhash: 'G6VxJA2Rft8a8U2BPw6MNd7iBEa3Hi7V4W8O1P9Q2R5L7K3J',
    transactionCount: 2847,
    leader: 'J1p3qzFB7vC8gP9w2q7YNz6LMb8A5Rj4QX9Tv8W6K2M9S5D',
    rewards: [
      {
        pubkey: 'J1p3qzFB7vC8gP9w2q7YNz6LMb8A5Rj4QX9Tv8W6K2M9S5D',
        lamports: 12345,
        postBalance: 9876543210,
        rewardType: 'Fee'
      }
    ],
    transactions: [
      {
        signature: '5j7VkPqY6K8ZQ9XN5rW7T3M8P1L4B9C6X2H5S8D3F7A2J9',
        fee: 0.000005,
        status: 'success',
        signer: 'DznpEHjgea8xZm2WpWYATHy1YEj9oKYGG5hHnLAj4Lh2',
        programIds: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4']
      },
      {
        signature: '2k8VjQ9XN5rW7T3M8P1L4B9C6X2H5S8D3F7A2J95j7Vp',
        fee: 0.000008,
        status: 'success',
        signer: 'DznpEHjgea8xZm2WpWYATHy1YEj9oKYGG5hHnLAj4Lh2',
        programIds: ['11111111111111111111111111111111']
      }
    ],
    previousSlot: slot - 1,
    nextSlot: slot + 1
  }
});

export const mockBlockTransactionsResponse: BlockTransactionsResponse = {
  success: true,
  data: {
    slot: 245678910,
    blockTime: Math.floor(Date.now() / 1000) - 180,
    transactions: [
      {
        signature: '5j7VkPqY6K8ZQ9XN5rW7T3M8P1L4B9C6X2H5S8D3F7A2J9',
        status: 'success',
        fee: 0.000005,
        signer: 'DznpEHjgea8xZm2WpWYATHy1YEj9oKYGG5hHnLAj4Lh2',
        programIds: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'],
        instructions: {
          count: 2,
          programs: [
            {
              programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
              count: 1
            }
          ]
        }
      },
      {
        signature: '2k8VjQ9XN5rW7T3M8P1L4B9C6X2H5S8D3F7A2J95j7Vp',
        status: 'success',
        fee: 0.000008,
        signer: 'DznpEHjgea8xZm2WpWYATHy1YEj9oKYGG5hHnLAj4Lh2',
        programIds: ['11111111111111111111111111111111'],
        instructions: {
          count: 1,
          programs: [
            {
              programId: '11111111111111111111111111111111',
              count: 1
            }
          ]
        }
      },
      {
        signature: '9L3MpR8T4K5W2Q7Y1N6X8V9B3C5F2H7J4M9S1D6A8P5R',
        status: 'failure',
        fee: 0.000005,
        signer: 'DznpEHjgea8xZm2WpWYATHy1YEj9oKYGG5hHnLAj4Lh2',
        programIds: ['11111111111111111111111111111111'],
        instructions: {
          count: 1,
          programs: [
            {
              programId: '11111111111111111111111111111111',
              count: 1
            }
          ]
        }
      }
    ],
    pagination: {
      limit: 10,
      offset: 0,
      total: 2847,
      hasNext: true,
      hasPrevious: false
    }
  }
}; 