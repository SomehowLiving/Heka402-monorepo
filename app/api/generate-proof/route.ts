/**
 * Serverless function for generating zk-SNARK proofs
 * @notice Deployed to Vercel as API route
 */

import { groth16 } from 'snarkjs';
import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export interface ProofRequest {
  secret: string;
  recipient: string;
  amount: string;
}

export interface ProofResponse {
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  publicSignals: [string, string];
  commitment: string;
}

export async function POST(req: NextRequest) {
  try {
    const { secret, recipient, amount }: ProofRequest = await req.json();

    if (!secret || !recipient || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate commitment
    const commitment = ethers.solidityPackedKeccak256(
      ['bytes32', 'address', 'uint256'],
      [secret, recipient, amount]
    );

    const recipientHash = ethers.solidityPackedKeccak256(['address'], [recipient]);

    // Load circuit files from CDN or environment
    const wasmUrl = process.env.CIRCUIT_WASM_URL || '/circuits/payment.wasm';
    const zkeyUrl = process.env.CIRCUIT_ZKEY_URL || '/circuits/payment.zkey';

    const wasmResponse = await fetch(wasmUrl);
    const zkeyResponse = await fetch(zkeyUrl);

    if (!wasmResponse.ok || !zkeyResponse.ok) {
      throw new Error('Circuit files not found');
    }

    const wasm = await wasmResponse.arrayBuffer();
    const zkey = await zkeyResponse.arrayBuffer();

    // Generate proof
    const input = {
      commitment,
      amount,
      secret,
      recipientHash,
    };

    const { proof, publicSignals } = await groth16.fullProve(input, wasm, zkey);

    const response: ProofResponse = {
      proof: {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [
          [proof.pi_b[0][1], proof.pi_b[0][0]],
          [proof.pi_b[1][1], proof.pi_b[1][0]],
        ],
        c: [proof.pi_c[0], proof.pi_c[1]],
      },
      publicSignals: [publicSignals[0], publicSignals[1]],
      commitment,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Proof generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Proof generation failed' },
      { status: 500 }
    );
  }
}

