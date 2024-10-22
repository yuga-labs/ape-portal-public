import { useChainId, useSwitchChain } from 'wagmi';
import { useCallback, useMemo, useState } from 'react';
import { usePortalStore } from '../store/usePortalStore.ts';

export const useChainConfig = () => {
  const { sourceChain: desiredChainId } = usePortalStore((state) => ({
    sourceChain: state.sourceToken.token.chainId,
  }));
  const { chains: wagmiChains, switchChain } = useSwitchChain();
  const chains = [...new Set(wagmiChains.map((chain) => chain.id))];
  const walletChainId = useChainId();
  const [isWrongChain, setIsWrongChain] = useState<boolean>(false);

  useMemo(() => {
    if (desiredChainId !== walletChainId) {
      setIsWrongChain(true);
    } else if (isWrongChain) {
      setIsWrongChain(false);
    }
  }, [desiredChainId, walletChainId, isWrongChain]);

  const switchToDesiredChain = useCallback(() => {
    switchChain({ chainId: desiredChainId });
  }, [desiredChainId, switchChain]);

  const desiredChainName = useMemo(
    () => wagmiChains.find((chain) => chain.id === desiredChainId)?.name,
    [desiredChainId, wagmiChains],
  );

  return {
    isWrongChain,
    chains,
    switchToDesiredChain,
    desiredChainId,
    desiredChainName,
    wagmiChains,
  };
};
