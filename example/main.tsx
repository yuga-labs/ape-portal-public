import { createRoot } from 'react-dom/client';
import '@rainbow-me/rainbowkit/styles.css';

import { createConfig, http, WagmiProvider } from 'wagmi';
import { arbitrum, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectButton, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ApePortalWrapper } from './ApePortalWrapper';
import { apeChain } from 'viem/chains';

export const wagmiConfig = createConfig({
  chains: [apeChain, mainnet, arbitrum],
  transports: {
    [apeChain.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  },
});
const queryClient = new QueryClient();

/**
 * Mock Host Application. Library starts at ApePortalWrapper.
 */
const container = document.querySelector('#root');
if (container) {
  const root = createRoot(container);
  root.render(
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div
            className={'aw-mb-6 aw-mt-12 aw-flex aw-w-full aw-justify-center'}
          >
            <ConnectButton />
          </div>
          <div
            className={
              'aw-flex aw-size-full aw-h-screen aw-w-screen aw-flex-row aw-items-center aw-justify-center aw-gap-x-12 aw-p-14'
            }
          >
            <ApePortalWrapper />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>,
  );
}
