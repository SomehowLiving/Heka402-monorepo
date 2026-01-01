'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
// import { Heka402SDK } from '@heka402/sdk'; // browser-safe SDK
// import { Heka402SDK } from '@heka402/sdk';
import { Heka402SDK } from '@heka402/sdk/src/index.ts';
// import { Heka402SDK } from '../../../sdk';

interface PaymentFormProps {
  address: string;
  selectedChains: number[];
  currentChain: any;
  onSwitchNetwork?: (chainId?: number) => void;
}

export function PaymentForm({
  address,
  selectedChains,
  currentChain,
}: PaymentFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle payment execution using the Heka402 SDK.
   * Proof generation happens server-side via /api/prove.
   */
  const handlePayment = async () => {
    // Basic input validation
    if (!recipient || !amount) {
      setError('Please fill in all fields.');
      return;
    }

    if (!ethers.isAddress(recipient)) {
      setError('Invalid recipient address.');
      return;
    }

    if (!selectedChains.length) {
      setError('No chains selected.');
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Initialize browser wallet provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Contract address (must be deployed on selected chains)
      const contractAddress =
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x...';

      // Initialize browser-safe SDK
      const sdk = new Heka402SDK(
        provider,
        signer,
        contractAddress
      );

      // Execute privacy-preserving payment
      const hash = await sdk.executePayment({
        recipient,
        amount: ethers.parseEther(amount).toString(),
        chains: selectedChains,
      });

      setTxHash(hash);
    } catch (err: any) {
      setError(err?.message || 'Payment failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8">
      <h2 className="text-2xl font-display font-bold mb-6 text-foreground">
        Privacy Payment
      </h2>

      <div className="space-y-5">
        {/* Recipient address */}
        <div>
          <label className="block font-medium mb-2 text-foreground">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="
              w-full px-4 py-3 rounded-lg
              bg-background border border-input
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring
            "
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block font-medium mb-2 text-foreground">
            Amount (ETH)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            step="0.001"
            min="0"
            className="
              w-full px-4 py-3 rounded-lg
              bg-background border border-input
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring
            "
          />
        </div>

        {/* Chain info */}
        <div className="text-sm">
          <p className="text-muted-foreground">
            Selected Chains: {selectedChains.join(', ') || 'None'}
          </p>
          <p className="text-muted-foreground">
            Payment will be split across {selectedChains.length} chain(s)
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Success message */}
        {txHash && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
            <p className="text-emerald-600 font-medium mb-2">
              Payment Successful
            </p>
            <a
              href={`${currentChain?.blockExplorers?.default?.url}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline text-sm"
            >
              View Transaction: {txHash.slice(0, 10)}...
            </a>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handlePayment}
          disabled={loading || !recipient || !amount}
          className="w-full button-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing…' : 'Execute Payment'}
        </button>
      </div>

      {/* Informational footer */}
      <div className="mt-6 p-4 rounded-lg border border-border bg-muted/40">
        <p className="text-muted-foreground text-xs leading-relaxed">
          This transaction uses zero-knowledge proofs generated server-side to
          preserve privacy. The payment is split across multiple chains to
          improve unlinkability.
        </p>
      </div>
    </div>
  );
}
