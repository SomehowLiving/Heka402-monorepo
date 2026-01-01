'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
// import { Heka402SDK } from '@heka402/sdk';

import { Heka402SDK } from '@heka402/sdk/src/index.ts';

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

  const handlePayment = async () => {
    if (!recipient || !amount) {
      setError('Please fill in all fields.');
      return;
    }

    if (!ethers.isAddress(recipient)) {
      setError('Invalid recipient address.');
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const wasmResponse = await fetch('/circuits/payment.wasm');
      const zkeyResponse = await fetch('/circuits/payment.zkey');

      if (!wasmResponse.ok || !zkeyResponse.ok) {
        throw new Error('Circuit files not found.');
      }

      const wasm = await wasmResponse.arrayBuffer();
      const zkey = await zkeyResponse.arrayBuffer();

      const contractAddress =
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x...';

      const sdk = new Heka402SDK(
        provider,
        signer,
        contractAddress,
        wasm,
        zkey
      );

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
        {/* Recipient */}
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

        {/* Chain Info */}
        <div className="text-sm">
          <p className="text-muted-foreground">
            Selected Chains: {selectedChains.join(', ') || 'None'}
          </p>
          <p className="text-muted-foreground">
            Payment will be split across {selectedChains.length} chain(s)
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Success */}
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

        {/* Action Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !recipient || !amount}
          className="w-full button-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing…' : 'Execute Payment'}
        </button>
      </div>

      {/* Footer Notice */}
      <div className="mt-6 p-4 rounded-lg border border-border bg-muted/40">
        <p className="text-muted-foreground text-xs leading-relaxed">
          This transaction uses zero-knowledge proofs to preserve privacy. The
          payment is split across {selectedChains.length} chain(s) to enhance
          unlinkability.
        </p>
      </div>
    </div>
  );
}