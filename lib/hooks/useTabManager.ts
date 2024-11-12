import { useApeContext } from '../providers/ape/apeProvider.context.ts';
import {
  InitialPortalType,
  PortalType,
  TabConfig,
} from '../utils/constants.ts';
import { useCallback, useState } from 'react';
import {
  defaultBridgeDestinationToken,
  defaultBridgeSourceToken,
  defaultSwapDestinationToken,
  defaultSwapSourceToken,
  StashedTokens,
  usePortalStore,
} from '../store/usePortalStore.ts';
import { useHashPortalType } from './useHashPortalType.ts';
import { TokenTransactionData } from '../classes/TokenTransactionData.ts';
import { TokenInfo } from '@decent.xyz/box-common';

/**
 * This hook is used to handle a few of for tab state:
 * 1. The selected tab and setting the selected tab
 * 2. If hash routing is enabled, it will set the tab based on the hash
 * 3. Sync the selected tab with the source and destination tokens
 *
 * It also handles stashing the tokens per tab. When switching between tabs,
 * the tokens are stashed and restored when switching back to the tab.
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
  const { enableOnramp } = useApeContext();
  const {
    sourceToken,
    destinationToken,
    setDestinationToken,
    setSourceToken,
    setBridgeStash,
    bridgeStash,
    setSwapStash,
    swapStash,
  } = usePortalStore((state) => ({
    sourceToken: state.sourceToken,
    destinationToken: state.destinationToken,
    setDestinationToken: state.setDestinationToken,
    setSourceToken: state.setSourceToken,
    swapStash: state.swapStash,
    setSwapStash: state.setSwapStash,
    setBridgeStash: state.setBridgeStash,
    bridgeStash: state.bridgeStash,
  }));

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
  const [currentPortalType, setCurrentPortalType] = useState<PortalType>(
    <PortalType>initialTab,
  );
  useHashPortalType(setCurrentPortalType);

  const setPortalTypeWithSync = useCallback(
    (nextPortalType: PortalType) => {
      const handleTokenStashes = (
        defaultSourceToken: TokenInfo,
        defaultDestinationToken: TokenInfo,
        setStash: (stash: StashedTokens | undefined) => void,
        stashedTokens: StashedTokens | undefined,
      ) => {
        const isOnRampPrevious = currentPortalType === PortalType.OnRamp;
        if (stashedTokens?.sourceToken && stashedTokens?.destinationToken) {
          const tempSourceToken = sourceToken.token;
          const tempDestToken = destinationToken.token;
          setSourceToken(stashedTokens.sourceToken.token);
          setDestinationToken(stashedTokens.destinationToken.token);
          if (!isOnRampPrevious) {
            setStash({
              sourceToken: new TokenTransactionData(tempSourceToken),
              destinationToken: new TokenTransactionData(tempDestToken),
            });
          }
        } else {
          if (!isOnRampPrevious) {
            setStash({
              sourceToken: new TokenTransactionData(sourceToken.token),
              destinationToken: new TokenTransactionData(
                destinationToken.token,
              ),
            });
          }
          setSourceToken(defaultSourceToken);
          setDestinationToken(defaultDestinationToken);
        }
        setCurrentPortalType(nextPortalType);
      };

      if (nextPortalType === currentPortalType) return;
      if (nextPortalType === PortalType.OnRamp) {
        if (currentPortalType === PortalType.Bridge) {
          setBridgeStash({
            sourceToken: new TokenTransactionData(sourceToken.token),
            destinationToken: new TokenTransactionData(destinationToken.token),
          });
        }
        if (currentPortalType === PortalType.Swap) {
          setSwapStash({
            sourceToken: new TokenTransactionData(sourceToken.token),
            destinationToken: new TokenTransactionData(destinationToken.token),
          });
        }
        setCurrentPortalType(nextPortalType);
        return;
      }

      if (nextPortalType === PortalType.Swap) {
        handleTokenStashes(
          defaultSwapSourceToken,
          defaultSwapDestinationToken,
          setBridgeStash,
          swapStash,
        );
        return;
      }

      if (nextPortalType === PortalType.Bridge) {
        handleTokenStashes(
          defaultBridgeSourceToken,
          defaultBridgeDestinationToken,
          setSwapStash,
          bridgeStash,
        );
        return;
      }
    },
    [
      bridgeStash,
      destinationToken.token,
      currentPortalType,
      setBridgeStash,
      setDestinationToken,
      setSourceToken,
      setSwapStash,
      sourceToken.token,
      swapStash,
    ],
  );

  const selectedIndex =
    currentPortalType === PortalType.Bridge ||
    currentPortalType === PortalType.Swap
      ? 0 // Bridge and Swap share the same tab, relying on a smooth animation to switch between displayed components
      : 1;

  return {
    selectedPortalType: currentPortalType,
    setPortalTypeWithSync,
    selectedIndex,
    tabs: finalTabs,
  };
};
