import { useEffect } from 'react';
import { usePortalStore } from '../store/usePortalStore';
import { getNativeTokenInfoOrFail } from '@decent.xyz/box-common';
import { useApiKey, useUsdConversion } from '@decent.xyz/box-hooks';

/**
 * Monitors and stores the current price of the source gas token in USD.
 */
export const useSourceGasTokenUsdPrice = () => {
  const decentApiKey = useApiKey();
  if (!decentApiKey) {
    throw new Error(
      'useSourceGasTokenUsdPrice must be used within withDecent HOC',
    );
  }

  const { sourceToken, setSourceChainGasTokenUsdValue } = usePortalStore(
    (state) => ({
      sourceToken: state.sourceToken,
      setSourceChainGasTokenUsdValue: state.setSourceChainGasTokenUsdValue,
    }),
  );
  const sourceChainGasToken = getNativeTokenInfoOrFail(
    sourceToken.token.chainId,
  );

  const { data: tokenUsdData, error: tokenUsdPriceError } = useUsdConversion({
    chainId: sourceChainGasToken.chainId,
    tokenAddress: sourceChainGasToken.address,
    enable: true,
  });
  // Quote may be null. Decent types lie.
  const tokenUsdPrice =
    (tokenUsdData?.found && tokenUsdData?.quote?.formatted) || '0';

  useEffect(() => {
    if (tokenUsdPriceError) {
      console.error('Error fetching token price:', tokenUsdPriceError);
    }
  }, [tokenUsdPriceError]);

  useEffect(() => {
    const price = Number(tokenUsdPrice);
    if (price > 0) {
      setSourceChainGasTokenUsdValue(price);
    }
  }, [tokenUsdPrice, setSourceChainGasTokenUsdValue]);
};
