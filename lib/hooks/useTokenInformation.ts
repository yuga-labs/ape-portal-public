import { erc20Abi, zeroAddress } from 'viem';
import { useReadContracts, useSwitchChain } from 'wagmi';
import { DefaultTokenInfo } from '../types';
import { useEffect, useState } from 'react';
import { getNativeTokenInfoOrFail, TokenInfo } from '@decent.xyz/box-common';

const contractValues = ['decimals', 'name', 'symbol'];

export const useTokenInformation = (
  defaultTokenInfo?: DefaultTokenInfo,
): {
  tokenInfo: TokenInfo | undefined;
  tokenDataLoading: boolean;
  tokenDataSuccess: boolean;
  tokenDataError: boolean;
} => {
  const { chains: wagmiChains } = useSwitchChain();
  const chains = new Set(
    wagmiChains.map((chain) => {
      return chain.id;
    }),
  );
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | undefined>();
  const {
    data: tokenData,
    isLoading: tokenDataLoading,
    error: tokenDataError,
    isSuccess: tokenDataSuccess,
  } = useReadContracts({
    allowFailure: false,
    contracts: contractValues.map((value) => ({
      address: defaultTokenInfo?.address,
      abi: erc20Abi,
      functionName: value,
      chainId: defaultTokenInfo?.chainId,
    })),
    query: {
      enabled:
        defaultTokenInfo &&
        defaultTokenInfo.address !== zeroAddress &&
        chains.has(defaultTokenInfo.chainId),
    },
  });

  useEffect(() => {
    if (tokenData) {
      const [decimals, name, symbol] = tokenData;
      setTokenInfo({
        address: defaultTokenInfo?.address,
        chainId: defaultTokenInfo?.chainId,
        decimals: decimals as number,
        name: name as string,
        symbol: symbol as string,
        logo: undefined,
      } as TokenInfo);
    }

    if (!tokenData && defaultTokenInfo?.address === zeroAddress) {
      try {
        const nativeTokenInfo = getNativeTokenInfoOrFail(
          defaultTokenInfo.chainId,
        );
        setTokenInfo(nativeTokenInfo);
      } catch (error) {
        console.error(`Error getting native token info: ${error}`);
      }
    }
  }, [
    defaultTokenInfo?.address,
    defaultTokenInfo?.chainId,
    tokenDataError,
    tokenData,
  ]);

  return {
    tokenInfo,
    tokenDataLoading,
    tokenDataSuccess,
    tokenDataError: !!tokenDataError,
  };
};
