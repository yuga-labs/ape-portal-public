import { JSX, useEffect, useRef } from 'react';
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
  const waitingForWalletConnection = useRef(false);

  const isWalletConnected = !!address;
  const isOnApechain = isWalletConnected && walletChainId === apeChain.id;
  const handleAddNetwork = useCallback(() => {
    if (isWalletConnected) {
      switchChain({ chainId: apeChain.id });
    } else {
      openConnectModal();
      // Since openConnectModal is not a promise, we will finish adding the network via
      //  useEffect that relies on waitingForWalletConnection.current (below)
      waitingForWalletConnection.current = true;
    }
  }, [isWalletConnected, openConnectModal, switchChain]);

  useEffect(() => {
    /** This useEffect will fire after the user's wallet is connected, after
     *  being initially disconnected. Then, we can continue adding the network. */
    if (isWalletConnected && waitingForWalletConnection.current) {
      waitingForWalletConnection.current = false;
      switchChain({ chainId: apeChain.id });
    }
  }, [isWalletConnected, switchChain]);

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
