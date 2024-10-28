import { useApeContext } from '../providers/ape/apeProvider.context.ts';
import {
  InitialPortalType,
  PortalType,
  TabConfig,
} from '../utils/constants.ts';
import { useCallback, useRef, useState } from 'react';
import {
  defaultBridgeDestinationToken,
  defaultBridgeSourceToken,
  defaultSwapDestinationToken,
  defaultSwapSourceToken,
  usePortalStore,
} from '../store/usePortalStore.ts';
import { useErrorStore } from '../store/useErrorStore.ts';
import {
  getChainNextToken,
  NO_TOKENS_FOUND_ERROR,
} from '../utils/getNextToken.ts';
import { useHashPortalType } from './useHashPortalType.ts';
import { TokenTransactionData } from '../classes/TokenTransactionData.ts';
import { useChainId } from 'wagmi';

/**
 * This hook is used to handle a few of for tab state:
 * 1. The selected tab and setting the selected tab
 * 2. If hash routing is enabled, it will set the tab based on the hash
 * 3. Sync the selected tab with the source and destination tokens
 *
 *
 * It also removes the requirement of having empty tokens in the
 * store when switching between bridge and swap tabs.
 *
 * Switching to Swap
 * 1. If token chains are the same then use the same destination token
 * 2. If token chains are different then stash the destination token
 *  and set the destination token to the first token on the source chain
 *  that is not the same as the source token
 * 3. If no other token on the chain is found then we use a sensible
 * default token pair
 * Switching to Bridge
 * 1. If there is a stashed token then set the destination token to the stashed token
 * 2. If no stashed token then keep the destination token the same
 *
 * @param tabConfig
 * */
export const useTabManager = (
  tabConfig: TabConfig,
): {
  selectedPortalType: PortalType;
  selectedIndex: number;
  setPortalTypeWithSync: (portalType: PortalType) => void;
  tabs: Set<PortalType>;
} => {
  // Used to keep track of which tab the stashed token came from
  const stashedSourceRef = useRef<PortalType | undefined>();
  const {
    sourceToken,
    destinationToken,
    setDestinationToken,
    setSourceToken,
    setStashedToken,
    stashedToken,
    hasUserUpdatedTokens,
  } = usePortalStore((state) => ({
    sourceToken: state.sourceToken,
    destinationToken: state.destinationToken,
    setDestinationToken: state.setDestinationToken,
    setStashedToken: state.setStashedToken,
    stashedToken: state.stashedToken,
    setSourceToken: state.setSourceToken,
    hasUserUpdatedTokens: state.hasUserUpdatedTokens,
  }));
  const { setError } = useErrorStore((state) => ({
    setError: state.setError,
  }));
  const { enableOnramp } = useApeContext();
  const walletChainId = useChainId();

  const mapToPortalType = (tab: InitialPortalType | PortalType): PortalType => {
    if (tab === InitialPortalType.Bridge) {
      return PortalType.Bridge;
    }
    if (tab === InitialPortalType.Swap) {
      return PortalType.Swap;
    }
    if (tab === InitialPortalType.OnRamp) {
      return enableOnramp ? PortalType.OnRamp : PortalType.Bridge;
    }
    return tab;
  };
  const finalTabs = new Set<PortalType>(
    tabConfig.map((portalType) => mapToPortalType(portalType)),
  );

  let initialTab = PortalType.Bridge;
  for (const tab of tabConfig) {
    if (tab == InitialPortalType.Bridge) {
      initialTab = PortalType.Bridge;
      break;
    } else if (tab == InitialPortalType.Swap) {
      initialTab = PortalType.Swap;
      break;
    } else if (tab == InitialPortalType.OnRamp) {
      initialTab = enableOnramp ? PortalType.OnRamp : PortalType.Bridge;
      break;
    }
  }

  initialTab = finalTabs.has(initialTab)
    ? initialTab
    : finalTabs.values().next().value;

  if (!enableOnramp && initialTab === PortalType.OnRamp) {
    console.error('Cannot set initial tab to Onramp when Onramp is disabled');
  }
  const [selectedPortalType, setSelectedPortalType] = useState<PortalType>(
    <PortalType>initialTab,
  );
  useHashPortalType(setSelectedPortalType);

  const handleTokenError = useCallback(() => {
    setError(NO_TOKENS_FOUND_ERROR);
    setSourceToken(defaultSwapSourceToken);
    setDestinationToken(defaultSwapDestinationToken);
  }, [setError, setSourceToken, setDestinationToken]);

  const setPortalTypeWithSync = useCallback(
    (portalType: PortalType) => {
      if (portalType === selectedPortalType) return;
      if (portalType === PortalType.OnRamp) {
        if (selectedPortalType === PortalType.Bridge) {
          setStashedToken(new TokenTransactionData(destinationToken.token));
          stashedSourceRef.current = PortalType.Bridge;
        }
        if (selectedPortalType === PortalType.Swap) {
          setStashedToken(new TokenTransactionData(sourceToken.token));
          stashedSourceRef.current = PortalType.Swap;
        }
        setSelectedPortalType(portalType);
        return;
      }

      // Set our defaults if user is on Ethereum and hasnt updated tokens
      // Or if there is no chain id
      if (
        !walletChainId ||
        (!hasUserUpdatedTokens &&
          walletChainId == defaultBridgeSourceToken.chainId)
      ) {
        if (portalType === PortalType.Bridge) {
          setSourceToken(defaultBridgeSourceToken);
          setDestinationToken(defaultBridgeDestinationToken);
          setStashedToken(
            new TokenTransactionData(defaultSwapDestinationToken),
          );
          stashedSourceRef.current = PortalType.Swap;
        }
        if (portalType === PortalType.Swap) {
          setSourceToken(defaultSwapSourceToken);
          setDestinationToken(defaultSwapDestinationToken);
          setStashedToken(
            new TokenTransactionData(defaultBridgeDestinationToken),
          );
          stashedSourceRef.current = PortalType.Bridge;
        }
        setSelectedPortalType(portalType);
        return;
      }

      if (portalType === PortalType.Swap) {
        const isStashTokenValid: boolean =
          !!stashedToken &&
          stashedToken.token.chainId === sourceToken.token.chainId &&
          stashedToken.token.address !== sourceToken.token.address &&
          stashedSourceRef.current == PortalType.Swap;

        if (stashedToken && isStashTokenValid) {
          const tempDestToken = destinationToken;
          setDestinationToken(stashedToken.token);
          setStashedToken(tempDestToken);
          stashedSourceRef.current = PortalType.Bridge;
          setSelectedPortalType(portalType);
          return;
        }

        if (sourceToken.token.chainId === destinationToken.token.chainId) {
          // User was technically already doing a swap
          setSelectedPortalType(portalType);
          return;
        }

        const chainNextToken = getChainNextToken(sourceToken.token);
        if (chainNextToken) {
          setDestinationToken(chainNextToken);
        } else {
          // Default to a known pair
          handleTokenError();
        }
        setStashedToken(destinationToken);
        stashedSourceRef.current = PortalType.Bridge;
        setSelectedPortalType(portalType);
        return;
      }

      if (portalType === PortalType.Bridge) {
        const isStashTokenValid =
          !!stashedToken &&
          (stashedToken?.token.address !== sourceToken.token.address ||
            stashedToken?.token.chainId !== sourceToken.token.chainId) &&
          stashedSourceRef.current == PortalType.Bridge;

        if (stashedToken && isStashTokenValid) {
          const tempDestToken = destinationToken;
          setDestinationToken(stashedToken.token);
          setStashedToken(tempDestToken);
          stashedSourceRef.current = PortalType.Swap;
          setSelectedPortalType(portalType);
          return;
        }

        const chainNextToken = getChainNextToken(sourceToken.token);
        if (chainNextToken) {
          setStashedToken(destinationToken);
          stashedSourceRef.current = PortalType.Swap;
          setDestinationToken(chainNextToken);
        } else {
          // Default to a known pair
          handleTokenError();
        }
        setSelectedPortalType(portalType);
      }
    },
    // Disabling because we do not want to run this when
    // selectedPortalType changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      destinationToken,
      handleTokenError,
      hasUserUpdatedTokens,
      setDestinationToken,
      setSourceToken,
      setStashedToken,
      sourceToken.token,
      stashedToken,
      walletChainId,
    ],
  );

  const selectedIndex =
    selectedPortalType === PortalType.Bridge ||
    selectedPortalType === PortalType.Swap
      ? 0 // Bridge and Swap share the same tab, relying on a smooth animation to switch between displayed components
      : 1;

  return {
    selectedPortalType,
    setPortalTypeWithSync,
    selectedIndex,
    tabs: finalTabs,
  };
};
