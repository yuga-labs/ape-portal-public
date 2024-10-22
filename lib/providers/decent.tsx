import { ClientRendered } from '@decent.xyz/box-ui';
import { BoxHooksContextProvider } from '@decent.xyz/box-hooks';
import { useApeContext } from './ape/apeProvider.context.ts';
import {
  PortalType,
  PUBLIC_DECENT_API_KEY_BRIDGE,
  PUBLIC_DECENT_API_KEY_BRIDGE_NONEVM,
  PUBLIC_DECENT_API_KEY_BRIDGE_ZKSYNC,
  PUBLIC_DECENT_API_KEY_SWAP,
  PUBLIC_DECENT_API_KEY_SWAP_NONEVM,
  PUBLIC_DECENT_API_KEY_SWAP_ZKSYNC,
  PUBLIC_DECENT_API_KEY_TOPTRADER,
  PUBLIC_DECENT_API_KEY_TOPTRADER_NONEVM,
  PUBLIC_DECENT_API_KEY_TOPTRADER_ZKSYNC,
} from '../utils/constants.ts';
import { TokenSwapProps } from '../components/ui/TokenSwap.tsx';
import { useMemo } from 'react';
import { usePortalStore } from '../store/usePortalStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { ChainId } from '@decent.xyz/box-common';

export function isTokenSwapProps(props: unknown): props is TokenSwapProps {
  return (props as TokenSwapProps).portalType !== undefined;
}

const EVM_CHAINS = new Set([
  ChainId.ETHEREUM,
  ChainId.SEPOLIA,
  ChainId.BASE,
  ChainId.BASE_SEPOLIA,
  ChainId.POLYGON,
  ChainId.POLYGON_AMOY,
  ChainId.APE,
  ChainId.APE_CURTIS,
  ChainId.ARBITRUM,
  ChainId.ARBITRUM_SEPOLIA,
  ChainId.OPTIMISM,
  ChainId.OPTIMISM_SEPOLIA,
]);

/**
 * HOC to wrap a component with the Decent context provider. Some of the Decent hooks require the context to be present.
 */
export function withDecent<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  const WithDecent: React.FC<P> = (props) => {
    const { isTopTrader } = useApeContext();
    const { sourceToken } = usePortalStore(
      useShallow((state) => ({
        sourceToken: state.sourceToken,
      })),
    );

    const isZkSync = sourceToken.token.chainId === ChainId.ZKSYNC;
    const isNonEvm = !EVM_CHAINS.has(sourceToken.token.chainId);

    const apiKey = useMemo(() => {
      if (isTopTrader) {
        if (isZkSync) {
          return PUBLIC_DECENT_API_KEY_TOPTRADER_ZKSYNC;
        }
        if (isNonEvm) {
          return PUBLIC_DECENT_API_KEY_TOPTRADER_NONEVM;
        }
        return PUBLIC_DECENT_API_KEY_TOPTRADER;
      }

      const isSwapPortal =
        isTokenSwapProps(props) && props.portalType === PortalType.Swap;

      if (isSwapPortal) {
        if (isZkSync) {
          return PUBLIC_DECENT_API_KEY_SWAP_ZKSYNC;
        }
        if (isNonEvm) {
          return PUBLIC_DECENT_API_KEY_SWAP_NONEVM;
        }
        return PUBLIC_DECENT_API_KEY_SWAP;
      }

      if (isZkSync) {
        return PUBLIC_DECENT_API_KEY_BRIDGE_ZKSYNC;
      }
      if (isNonEvm) {
        return PUBLIC_DECENT_API_KEY_BRIDGE_NONEVM;
      }
      return PUBLIC_DECENT_API_KEY_BRIDGE;
    }, [props, isTopTrader, isZkSync, isNonEvm]);

    return (
      <ClientRendered>
        <BoxHooksContextProvider apiKey={apiKey}>
          <Component {...(props as P)} />
        </BoxHooksContextProvider>
      </ClientRendered>
    );
  };

  return WithDecent;
}
