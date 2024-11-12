import { useCallback, useEffect, useMemo } from 'react';
import { InputType, PortalType } from '../utils/constants.ts';
import { TokenConfig } from '../index.ts';
import { useTokenInformation } from './useTokenInformation.ts';
import { getNativeTokenInfo, TokenId, TokenInfo } from '@decent.xyz/box-common';
import {
  defaultSwapDestinationToken,
  defaultSwapSourceToken,
  usePortalStore,
} from '../store/usePortalStore.ts';
import {
  getChainNextToken,
  NO_TOKENS_FOUND_ERROR,
} from '../utils/getNextToken.ts';
import { useErrorStore } from '../store/useErrorStore.ts';
import { useChainConfig } from './useChainConfig.ts';
import { useHashPortalType } from './useHashPortalType.ts';
import { useAccount, useChainId } from 'wagmi';
import { useShallow } from 'zustand/react/shallow';

export const ERROR_MALFORMED_CONFIG =
  'Swap attempted with malformed token configuration. Please contact support or try again.';

const isTokenConfigValid = (
  portalType: PortalType,
  chains: number[],
  tokenConfig?: TokenConfig,
): boolean => {
  const { defaultSourceToken, defaultDestinationToken } = tokenConfig || {};
  const isBridge = portalType === PortalType.Bridge;
  const isSwap = portalType === PortalType.Swap;
  if (!defaultSourceToken && !defaultDestinationToken) {
    return true;
  }

  if (isBridge) {
    if (defaultSourceToken && !chains.includes(defaultSourceToken.chainId)) {
      return false;
    }
    if (
      defaultDestinationToken &&
      !chains.includes(defaultDestinationToken.chainId)
    ) {
      return false;
    }
  }

  if (isSwap) {
    if (defaultSourceToken && defaultDestinationToken) {
      return (
        tokenConfig?.defaultSourceToken?.chainId ==
          defaultSwapSourceToken.chainId &&
        tokenConfig?.defaultSourceToken?.chainId ==
          tokenConfig?.defaultDestinationToken?.chainId
      );
    } else {
      if (defaultSourceToken) {
        return defaultSourceToken.chainId == defaultSwapSourceToken.chainId;
      }
      if (defaultDestinationToken) {
        return (
          defaultDestinationToken.chainId == defaultSwapSourceToken.chainId
        );
      }
    }
  }
  return true;
};

/**
 * This hook is ran once on the initial render to set
 * custom token and amounts.
 */
export const useConfigTokenDefaults = (
  portalType: PortalType,
  usingHash: boolean,
  tokenConfig?: TokenConfig,
) => {
  const isSwap = portalType === PortalType.Swap;
  const { isWrongChain, chains } = useChainConfig();
  const { hashPortalType, hashTypeProcessing } = useHashPortalType();
  const walletChainId = useChainId();

  const {
    setSourceToken,
    setSourceTokenAmount,
    setDestinationToken,
    setDestinationTokenAmount,
    destinationToken,
  } = usePortalStore((state) => ({
    setSourceToken: state.setSourceToken,
    setSourceTokenAmount: state.setSourceTokenAmount,
    setDestinationToken: state.setDestinationToken,
    setDestinationTokenAmount: state.setDestinationTokenAmount,
    sourceToken: state.sourceToken,
    destinationToken: state.destinationToken,
  }));
  const {
    sourceToken: { amount },
  } = usePortalStore(
    useShallow((state) => ({
      sourceToken: state.sourceToken,
    })),
  );
  const { setError } = useErrorStore((state) => ({
    setError: state.setError,
  }));
  const {
    tokenInfo: destinationTokenInfo,
    tokenDataLoading: destinationTokenLoading,
  } = useTokenInformation(
    usingHash ? undefined : tokenConfig?.defaultDestinationToken,
  );
  const { tokenInfo: sourceTokenInfo, tokenDataLoading: sourceTokenLoading } =
    useTokenInformation(
      usingHash ? undefined : tokenConfig?.defaultSourceToken,
    );
  const { address } = useAccount();
  const isWalletConnected = useMemo(() => !!address, [address]);
  /** If some amount has been entered for the source token, assume that automatically changing the token is not desired. */
  const isSourceTokenEmpty = useMemo(
    () => !amount || Number.isNaN(amount) || Number(amount) <= 0,
    [amount],
  );

  const setNextToken = useCallback(
    (token: TokenInfo, inputType: InputType) => {
      const matchedDestinationToken = getChainNextToken({
        chainId: token.chainId,
        address: token.address,
      } as TokenId);
      if (matchedDestinationToken) {
        if (inputType === InputType.Source) {
          setDestinationToken(matchedDestinationToken);
        } else {
          setSourceToken(matchedDestinationToken);
        }
      } else {
        console.error('No tokens found setting the default swap token');
        setError(NO_TOKENS_FOUND_ERROR);
        setSourceToken(defaultSwapSourceToken);
        setDestinationToken(defaultSwapDestinationToken);
      }
    },
    [setDestinationToken, setError, setSourceToken],
  );

  useEffect(() => {
    // If the tokenConfig amount is provided, set the default token amounts
    if (tokenConfig?.defaultTokenAmount) {
      const { amount } = tokenConfig.defaultTokenAmount;
      if (tokenConfig?.defaultTokenAmount?.type == InputType.Source) {
        setSourceTokenAmount(amount);
      } else {
        setDestinationTokenAmount(amount);
      }
    }

    // Check for malformed token configuration from props
    if (!isTokenConfigValid(portalType, chains, tokenConfig)) {
      console.error(ERROR_MALFORMED_CONFIG);
      setError(ERROR_MALFORMED_CONFIG);
      if (portalType === PortalType.Swap) {
        setSourceToken(defaultSwapSourceToken);
        setDestinationToken(defaultSwapDestinationToken);
      }
      return;
    }

    if (sourceTokenInfo && destinationTokenInfo) {
      setDestinationToken(destinationTokenInfo);
      setSourceToken(sourceTokenInfo);
      return;
    }

    if (destinationTokenInfo) {
      setDestinationToken(destinationTokenInfo);
      if (isSwap) {
        setNextToken(destinationTokenInfo, InputType.Destination);
      }
      return;
    }

    if (sourceTokenInfo) {
      setSourceToken(sourceTokenInfo);
      if (isSwap) {
        setNextToken(sourceTokenInfo, InputType.Source);
      }
      return;
    }

    if (
      isWalletConnected &&
      isWrongChain &&
      chains.includes(walletChainId) &&
      isSourceTokenEmpty &&
      portalType === PortalType.Bridge
    ) {
      const chainNativeToken = getNativeTokenInfo(walletChainId);
      const matchesDestinationToken =
        chainNativeToken?.chainId === destinationToken.token.chainId &&
        chainNativeToken?.address === destinationToken.token.address;
      if (chainNativeToken && !matchesDestinationToken) {
        setSourceToken(chainNativeToken);
      }
    }

    // If no other defaults are provided above these are the defaults for the swap tab
    if (portalType === PortalType.Swap) {
      setSourceToken(defaultSwapSourceToken);
      setDestinationToken(defaultSwapDestinationToken);
      return;
    }
    // Rule disabled because we only want to run this when
    // the sourceTokenInfo or destinationTokenInfo loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tokenConfig,
    destinationTokenInfo,
    sourceTokenInfo,
    sourceTokenLoading,
    destinationTokenLoading,
    hashPortalType,
    hashTypeProcessing,
    isWalletConnected,
  ]);
};
