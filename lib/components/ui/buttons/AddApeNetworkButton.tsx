import { JSX } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useCallback } from 'react';
import { useApeContext } from '../../../providers/ape/apeProvider.context';
import { apeChain } from 'viem/chains';

export const AddApeNetworkButton = ({
  className,
  ...props
}: JSX.IntrinsicElements['button']) => {
  const { address } = useAccount();
  const { openConnectModal } = useApeContext();
  const { switchChain } = useSwitchChain();
  const walletChainId = useChainId();

  const isWalletConnected = !!address;
  const isOnApechain = walletChainId === apeChain.id;
  const handleAddNetwork = useCallback(() => {
    if (isWalletConnected) {
      switchChain({ chainId: apeChain.id });
    } else {
      openConnectModal();
    }
  }, [isWalletConnected, openConnectModal, switchChain]);

  return (
    <button
      className={className}
      title={
        isOnApechain
          ? 'You are connected to ApeChain'
          : 'Add the ApeChain Network to your wallet'
      }
      onClick={handleAddNetwork}
      disabled={isOnApechain}
      {...props}
    >
      Add Network
    </button>
  );
};
