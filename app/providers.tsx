'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Define testnet chains manually for compatibility
const optimismSepolia = {
  id: 11155420,
  name: 'Optimism Sepolia',
  network: 'optimism-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.optimism.io'] },
    public: { http: ['https://sepolia.optimism.io'] },
  },
  blockExplorers: {
    default: { name: 'Optimism', url: 'https://sepolia-optimism.etherscan.io' },
  },
  testnet: true,
} as const;

const arbitrumSepolia = {
  id: 421614,
  name: 'Arbitrum Sepolia',
  network: 'arbitrum-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
    public: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' },
  },
  testnet: true,
} as const;

const polygonAmoy = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'polygon-amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-amoy.polygon.technology'] },
    public: { http: ['https://rpc-amoy.polygon.technology'] },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://amoy.polygonscan.com' },
  },
  testnet: true,
} as const;

const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia-explorer.base.org' },
  },
  testnet: true,
} as const;

const config = createConfig({
  chains: [sepolia, optimismSepolia, arbitrumSepolia, polygonAmoy, baseSepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '' }),
  ],
  transports: {
    [sepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

