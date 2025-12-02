'use client';

interface Chain {
  id: number;
  name: string;
}

interface ChainSelectorProps {
  chains: Chain[];
  selectedChains: number[];
  onChainsChange: (chains: number[]) => void;
}

export function ChainSelector({
  chains,
  selectedChains,
  onChainsChange,
}: ChainSelectorProps) {
  const toggleChain = (chainId: number) => {
    if (selectedChains.includes(chainId)) {
      onChainsChange(selectedChains.filter((id) => id !== chainId));
    } else {
      onChainsChange([...selectedChains, chainId]);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-orange-500">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
        </div>
        <h3 className="font-bold text-2xl text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Select Chains for Split Payment
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {chains.map((chain) => {
          const isSelected = selectedChains.includes(chain.id);

          return (
            <button
              key={chain.id}
              onClick={() => toggleChain(chain.id)}
              className={`
                relative px-4 py-3 rounded-xl font-semibold transition-all duration-300
                border-2 text-sm overflow-hidden
                ${isSelected
                  ? 'bg-orange-500 text-white border-orange-600 shadow-lg scale-105'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 hover:scale-105'}
              `}
            >
              {chain.name}
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Selected: <span className="font-bold text-gray-900">{selectedChains.length}</span> chain{selectedChains.length !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-600">
            Payment will be split equally
          </span>
        </div>
      </div>
    </div>
  );
}