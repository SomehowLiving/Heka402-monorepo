'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useChains, useSwitchChain } from 'wagmi';
import { PaymentForm } from './components/PaymentForm';
import { ChainSelector } from './components/ChainSelector';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const chains = useChains();
  const { switchChain } = useSwitchChain();
  const currentChain = chains.find(c => c.id === chainId);

  const [selectedChains, setSelectedChains] = useState<number[]>([
    11155111, // Sepolia
  ]);

  const supportedChains = [
    { id: 11155111, name: 'Sepolia' },
    { id: 11155420, name: 'Optimism Sepolia' },
    { id: 421614, name: 'Arbitrum Sepolia' },
    { id: 80002, name: 'Polygon Amoy' },
    { id: 84532, name: 'Base Sepolia' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-white">
      {/* Hero Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,123,56,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(255,123,56,0.08),transparent_50%)] pointer-events-none"></div>
      
      <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-5 py-2 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border-2 border-orange-200 mb-6 animate-pulse">
              <span>Cross-Chain Privacy Protocol</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Heka<span className="text-orange-500">402</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-700 mb-4 font-medium">
              Cross-chain Privacy Payments over x402
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500">
                  <path d="M2.5 16.88a1 1 0 0 1-.32-1.43l9-13.02a1 1 0 0 1 1.64 0l9 13.01a1 1 0 0 1-.32 1.44l-8.51 4.86a2 2 0 0 1-1.98 0Z"></path>
                </svg>
                Zero-knowledge proofs
              </span>
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500">
                  <rect width="18" height="11" x="3" y="11" rx="2"></rect>
                  <circle cx="12" cy="5" r="2"></circle>
                  <path d="M12 7v4"></path>
                </svg>
                Account Abstraction
              </span>
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
                Multi-chain
              </span>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-gray-200 shadow-xl">
            {!isConnected ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-orange-500">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Connect Your Wallet
                  </h2>
                  <p className="text-gray-600">Choose a wallet to get started with privacy payments</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => connect({ connector })}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      Connect {connector.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                    <p className="font-bold text-gray-900 text-lg">Connected</p>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded-xl inline-block mb-2 border-2 border-gray-200">
                    <p className="text-gray-900 text-sm font-mono font-semibold">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="6"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                    <span className="font-semibold">{currentChain?.name || 'Unknown'}</span>
                    <span className="text-gray-400">({currentChain?.id || chainId})</span>
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Chain Selector */}
          {isConnected && (
            <div className="mb-8">
              <ChainSelector
                chains={supportedChains}
                selectedChains={selectedChains}
                onChainsChange={setSelectedChains}
              />
            </div>
          )}

          {/* Payment Form */}
          {isConnected && (
            <div>
              <PaymentForm
                address={address!}
                selectedChains={selectedChains}
                currentChain={currentChain}
                onSwitchNetwork={(chainId) => chainId && switchChain({ chainId })}
              />
            </div>
          )}

          {/* Features */}
          <div className="mt-16">
            <h3 className="text-center font-bold text-3xl mb-10 text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Why Heka402?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-5 shadow-md">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-orange-500">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Zero-Knowledge
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Prove payment knowledge without revealing identity using zk-SNARKs
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-5 shadow-md">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-orange-500">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Multi-Chain
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Split payments across 2-5 EVM chains with automatic routing
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-5 shadow-md">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-orange-500">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  x402 Protocol
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  HTTP-native payment standard perfect for AI agents
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


// 'use client';

// import { useState } from 'react';
// import { useAccount, useConnect, useDisconnect, useChainId, useChains, useSwitchChain } from 'wagmi';
// import { PaymentForm } from './components/PaymentForm';
// import { ChainSelector } from './components/ChainSelector';

// export default function Home() {
//   const { address, isConnected } = useAccount();
//   const { connect, connectors } = useConnect();
//   const { disconnect } = useDisconnect();
//   const chainId = useChainId();
//   const chains = useChains();
//   const { switchChain } = useSwitchChain();
//   const currentChain = chains.find(c => c.id === chainId);

//   const [selectedChains, setSelectedChains] = useState<number[]>([
//     11155111, // Sepolia
//   ]);

//   const supportedChains = [
//     { id: 11155111, name: 'Sepolia' },
//     { id: 11155420, name: 'Optimism Sepolia' },
//     { id: 421614, name: 'Arbitrum Sepolia' },
//     { id: 80002, name: 'Polygon Amoy' },
//     { id: 84532, name: 'Base Sepolia' },
//   ];

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
//       <div className="container mx-auto px-4 py-16">
//         <div className="max-w-4xl mx-auto">
//           {/* Header */}
//           <div className="text-center mb-12">
//             <h1 className="text-5xl font-bold text-white mb-4">
//               Heka402
//             </h1>
//             <p className="text-xl text-blue-200 mb-2">
//               Cross-chain Privacy Payments over x402
//             </p>
//             <p className="text-sm text-blue-300">
//               Zero-knowledge proofs + Account Abstraction + Multi-chain
//             </p>
//           </div>

//           {/* Wallet Connection */}
//           <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
//             {!isConnected ? (
//               <div className="text-center">
//                 <p className="text-white mb-4">Connect your wallet to start</p>
//                 <div className="flex gap-4 justify-center">
//                   {connectors.map((connector) => (
//                     <button
//                       key={connector.id}
//                       onClick={() => connect({ connector })}
//                       className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
//                     >
//                       Connect {connector.name}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-white font-semibold">Connected</p>
//                   <p className="text-blue-200 text-sm font-mono">{address}</p>
//                   <p className="text-blue-300 text-xs mt-1">
//                     Chain: {currentChain?.name || 'Unknown'} ({currentChain?.id || chainId})
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => disconnect()}
//                   className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
//                 >
//                   Disconnect
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Chain Selector */}
//           {isConnected && (
//             <div className="mb-8">
//               <ChainSelector
//                 chains={supportedChains}
//                 selectedChains={selectedChains}
//                 onChainsChange={setSelectedChains}
//               />
//             </div>
//           )}

//           {/* Payment Form */}
//           {isConnected && (
//               <PaymentForm
//               address={address!}
//               selectedChains={selectedChains}
//               currentChain={currentChain}
//               onSwitchNetwork={(chainId) => chainId && switchChain({ chainId })}
//             />
//           )}

//           {/* Features */}
//           <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
//               <h3 className="text-white font-bold text-lg mb-2">🔐 Zero-Knowledge</h3>
//               <p className="text-blue-200 text-sm">
//                 Prove payment knowledge without revealing identity
//               </p>
//             </div>
//             <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
//               <h3 className="text-white font-bold text-lg mb-2">🔗 Multi-Chain</h3>
//               <p className="text-blue-200 text-sm">
//                 Split payments across multiple EVM chains
//               </p>
//             </div>
//             <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
//               <h3 className="text-white font-bold text-lg mb-2">🌐 x402 Protocol</h3>
//               <p className="text-blue-200 text-sm">
//                 HTTP-native payment standard for AI agents
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

