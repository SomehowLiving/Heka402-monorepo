/**
 * Heka402 SDK
 * @notice TypeScript SDK for privacy-preserving cross-chain payments over x402
 * @dev Browser-safe SDK. Proofs are generated server-side.
 */

import { ethers } from 'ethers';

export interface PaymentConfig {
  recipient: string;
  amount: string;
  token?: string;
  chains: number[];
  secret?: string;
}

export interface PaymentProof {
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  publicSignals: [string, string]; // [commitment, amount]
}

export class Heka402SDK {
  private provider: ethers.Provider | ethers.BrowserProvider;
  private signer: ethers.Signer;
  private contractAddress: string;

  constructor(
    provider: ethers.Provider | ethers.BrowserProvider,
    signer: ethers.Signer,
    contractAddress: string
  ) {
    this.provider = provider;
    this.signer = signer;
    this.contractAddress = contractAddress;
  }

  /**
   * Generate commitment hash matching the circuit's algorithm
   * Circuit formula: temp1 = secret * 3 + recipientHash * 5
   *                  temp2 = temp1 + amount * 7
   *                  temp2Squared = temp2 * temp2
   *                  commitment = temp2 * 11 + temp2Squared
   */
  private generateCommitment(
    secret: string,
    recipient: string,
    amount: string
  ): string {
    // Convert to BigInt for circuit-compatible math
    const secretBN = BigInt(secret);
    const recipientHashBN = BigInt(
      ethers.solidityPackedKeccak256(['address'], [recipient])
    );
    const amountBN = BigInt(amount);

    // Match circuit's hash computation exactly
    const temp1 = secretBN * 3n + recipientHashBN * 5n;
    const temp2 = temp1 + amountBN * 7n;
    const temp2Squared = temp2 * temp2;
    const commitment = temp2 * 11n + temp2Squared;

    return commitment.toString();
  }

  /**
   * Execute a privacy-preserving payment (5-line flow)
   */
  async executePayment(config: PaymentConfig): Promise<string> {
    // Line 1: Secret
    const secret = config.secret || ethers.hexlify(ethers.randomBytes(32));

    // Generate commitment using circuit-compatible formula
    const commitment = this.generateCommitment(
      secret,
      config.recipient,
      config.amount
    );

    // Line 2: Request proof from server
    const res = await fetch('/api/prove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        recipient: config.recipient,
        amount: config.amount,
        commitment, // Pass pre-computed commitment for verification
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Proof generation failed');
    }

    const { proof, publicSignals } = (await res.json()) as PaymentProof;

    // Line 3: Split payment
    const amountPerChain = BigInt(config.amount) / BigInt(config.chains.length);
    const remainder = BigInt(config.amount) % BigInt(config.chains.length);

    // Line 4: Nonce
    const nonce = ethers.solidityPackedKeccak256(
      ['uint256', 'address', 'uint256'],
      [config.chains[0], await this.signer.getAddress(), Date.now()]
    );

    // Line 5: Execute on chains
    const txHashes: string[] = [];
    for (let i = 0; i < config.chains.length; i++) {
      const chainAmount =
        i === 0
          ? (amountPerChain + remainder).toString()
          : amountPerChain.toString();

      const txHash = await this.executePaymentOnChain(
        proof,
        publicSignals[0],
        config.recipient,
        chainAmount,
        config.token,
        nonce
      );

      txHashes.push(txHash);
    }

    return txHashes[0];
  }

  /**
   * Execute payment on-chain
   */
  private async executePaymentOnChain(
    proof: PaymentProof['proof'],
    commitment: string,
    recipient: string,
    amount: string,
    token: string | undefined,
    nonce: string
  ): Promise<string> {
    const abi = [
      'function executePayment(uint[2] a, uint[2][2] b, uint[2] c, bytes32 commitment, address recipient, uint256 amount, address token, uint256 nonce)',
    ];

    const contract = new ethers.Contract(
      this.contractAddress,
      abi,
      this.signer
    );

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

    return tx.hash;
  }

  /**
   * x402-compatible payment
   */
  async x402Payment(request: {
    url: string;
    amount: string;
    token?: string;
    chains?: number[];
  }): Promise<{ txHash: string; commitment: string }> {
    const recipient = await this.resolveX402Recipient(request.url);

    const chains =
      request.chains ??
      [Number((await this.provider.getNetwork()).chainId)];

    const secret = ethers.hexlify(ethers.randomBytes(32));
    const commitment = this.generateCommitment(
      secret,
      recipient,
      request.amount
    );

    const txHash = await this.executePayment({
      recipient,
      amount: request.amount,
      token: request.token,
      chains,
      secret,
    });

    return { txHash, commitment };
  }

  private async resolveX402Recipient(url: string): Promise<string> {
    const res = await fetch(url);
    const data = (await res.json()) as { recipient?: string };
    return data.recipient || ethers.ZeroAddress;
  }
}

/**
 * 5-line helper
 */
export async function quickPayment(
  sdk: Heka402SDK,
  recipient: string,
  amount: string,
  chains: number[] = [1]
): Promise<string> {
  return sdk.executePayment({ recipient, amount, chains });
}
