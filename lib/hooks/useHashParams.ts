import { PortalType } from '../utils/constants.ts';
import { useApeContext } from '../providers/ape/apeProvider.context.ts';
import { isAddress } from 'viem';
import { useTokenInformation } from './useTokenInformation.ts';
import { DefaultTokenInfo } from '../index.ts';
import { useEffect, useState } from 'react';
import { usePortalStore } from '../store/usePortalStore.ts';
import { getChainNextToken } from '../utils/getNextToken.ts';
import { TokenId } from '@decent.xyz/box-common';
import { useChainConfig } from './useChainConfig.ts';
import { useHash } from './useHash.ts';

const SwapDestTokenExp = /#swap\/(\d+)\/(0x[\dA-Fa-f]{40})/;

const extractTokenInfo = (
  hash: string,
  chains: number[],
): DefaultTokenInfo | undefined => {
  const swapDestTokenMatch = hash.match(SwapDestTokenExp);
  if (swapDestTokenMatch) {
    try {
      const chainId = Number.parseInt(swapDestTokenMatch[1]);
      const tokenAddress = swapDestTokenMatch[2];
      const tokenAddressValid = isAddress(tokenAddress);
      if (!tokenAddressValid) {
        throw new Error(
          `URL hash requested invalid token address ${tokenAddress}`,
        );
      }
      if (!chains.includes(chainId)) {
        throw new Error(
          `URL hash requested chain ${chainId} but we only support ${chains}`,
        );
      }
      return {
        chainId,
        address: tokenAddress,
      } as DefaultTokenInfo;
    } catch (error) {
      console.error(`Error parsing token info from hash: ${error}`);
    }
  } else {
    return undefined;
  }
};

/**
 * This hook is used to determine if the user is using the url
 * hash to set the destination token. If no hash is found then
 * the default token/s are checked next for use.
 * @param portalType
 */
export const useHashParams = (
  portalType: PortalType,
): {
  usingHashOrLoading: boolean;
} => {
  const [usingHash, setUsingHash] = useState(false);
  const { useHashRouter } = useApeContext();
  const { chains } = useChainConfig();
  const hash = useHash();
  // For swaps only, Use URL hash to prefill destination token
  const defaultTokenInfo: DefaultTokenInfo | undefined =
    portalType === PortalType.Swap && useHashRouter
      ? extractTokenInfo(hash, chains)
      : undefined;
  const [internalLoading, setInternalLoading] = useState(!!defaultTokenInfo);
  const { setDestinationToken, setSourceToken, sourceToken } = usePortalStore(
    (state) => ({
      setDestinationToken: state.setDestinationToken,
      sourceToken: state.sourceToken,
      setSourceToken: state.setSourceToken,
    }),
  );
  const {
    tokenInfo: hashTokenInfo,
    tokenDataLoading,
    tokenDataSuccess,
  } = useTokenInformation(defaultTokenInfo);

  useEffect(() => {
    if (!defaultTokenInfo) {
      setInternalLoading(false);
    }
  }, [defaultTokenInfo, setInternalLoading]);

  useEffect(() => {
    if (hashTokenInfo) {
      if (sourceToken.token.chainId === hashTokenInfo.chainId) {
        setDestinationToken(hashTokenInfo);
        setUsingHash(true);
        return;
      } else {
        const chainNextToken = getChainNextToken({
          chainId: hashTokenInfo.chainId,
          address: hashTokenInfo.address,
        } as TokenId);
        if (chainNextToken) {
          setSourceToken(chainNextToken);
          setDestinationToken(hashTokenInfo);
          setUsingHash(true);
        }
      }
      setInternalLoading(false);
      return;
    }
    // Rule disabled because we only want to run
    // this when hashTokenInfo changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hashTokenInfo, tokenDataSuccess, tokenDataLoading]);

  return {
    usingHashOrLoading: usingHash || internalLoading || tokenDataLoading,
  };
};
