/**
 * Relayer function for executing payments on behalf of users
 * @notice Implements ERC-4337 bundler functionality
 */

import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export interface RelayerRequest {
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  commitment: string;
  recipient: string;
  amount: string;
  token?: string;
  nonce: string;
  chainId: number;
  userOperation?: any;
}

export async function POST(req: NextRequest) {
  try {
    const {
      proof,
      commitment,
      recipient,
      amount,
      token,
      nonce,
      chainId,
      userOperation,
    }: RelayerRequest = await req.json();

    // Get RPC URL for the chain
    const rpcUrls: Record<number, string> = {
      11155111: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY',
      11155420: process.env.OPTIMISM_SEPOLIA_RPC_URL || 'https://sepolia.optimism.io',
      421614: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
      80002: process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
      84532: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    };

    const rpcUrl = rpcUrls[chainId];
    if (!rpcUrl) {
      return NextResponse.json(
        { error: 'Unsupported chain ID' },
        { status: 400 }
      );
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY || '', provider);

    // Contract ABI
    const abi = [
      'function executePayment(uint[2] a, uint[2][2] b, uint[2] c, bytes32 commitment, address recipient, uint256 amount, address token, uint256 nonce)',
    ];

    const contractAddress = process.env.CONTRACT_ADDRESS || '';
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    // Execute payment
    const tx = await contract.executePayment(
      proof.a,
      proof.b,
      proof.c,
      commitment,
      recipient,
      amount,
      token || ethers.ZeroAddress,
      nonce,
      { value: token ? 0 : amount }
    );

    const receipt = await tx.wait();

    return NextResponse.json({
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      chainId,
    });
  } catch (error: any) {
    console.error('Relayer error:', error);
    return NextResponse.json(
      { error: error.message || 'Relayer failed' },
      { status: 500 }
    );
  }
}

