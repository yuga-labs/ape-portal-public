import React from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
// Bridge/Buy are commented out and re-enabled as needed during manual testing
import { ApePortal, ApeProvider } from '../lib';

export const ApePortalWrapper = () => {
  const { openConnectModal } = useConnectModal();
  const apeConfig = {
    openConnectModal: openConnectModal || (() => {}),
    useHashRouter: true,
    enableOnramp: true,
    enableSolanaRedirect: true,
    solanaRedirectUrl: 'https://apechain.com/solana-bridge',
  };

  return (
    <ApeProvider config={apeConfig}>
      <ApePortal />
      {/* <Bridge showBranding={false} /> */}
      {/* <Buy showBranding={false} /> */}
    </ApeProvider>
  );
};
