import React from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
// Bridge/Buy are commented out and re-enabled as needed during manual testing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ApePortal, ApeProvider, Bridge, Buy } from '../lib';

export const ApePortalWrapper = () => {
  const { openConnectModal } = useConnectModal();
  const apeConfig = {
    openConnectModal: openConnectModal || (() => {}),
    useHashRouter: true,
    enableOnramp: true,
  };

  return (
    <ApeProvider config={apeConfig}>
      <ApePortal />
      {/* <Bridge showBranding={false} /> */}
      {/* <Buy showBranding={false} /> */}
    </ApeProvider>
  );
};
