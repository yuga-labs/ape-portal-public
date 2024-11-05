import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ApePortal, ApeProvider } from '../lib';

export const ApePortalWrapper = () => {
  const apeConfig = {
    openConnectModal: useConnectModal().openConnectModal,
    useHashRouter: true,
    enableOnramp: true,
  };

  return (
    <ApeProvider config={apeConfig}>
      <ApePortal />
    </ApeProvider>
  );
};
