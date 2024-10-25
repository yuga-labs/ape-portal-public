import { useUsdConversion, useUsersBalances } from '@decent.xyz/box-hooks';
import { TokenTransactionData } from '../classes/TokenTransactionData.ts';
import { useCallback, useEffect, useMemo } from 'react';
import { UserTokenInfo } from '@decent.xyz/box-common';
import { Address, formatUnits, isAddressEqual } from 'viem';
import { usePortalStore } from '../store/usePortalStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { currencyFormatter } from '../utils/currency.ts';
import { readableAmount } from '../utils/utils.ts';
import { useIsTransactionProcessing } from '../store/useIsTransactionProcessing.ts';

export const useTokenAmounts = (
  token: TokenTransactionData,
  srcToken?: boolean,
  address?: Address,
) => {
  const { setSourceTokenAmountUsd, setDestinationTokenAmountUsd } =
    usePortalStore(
      useShallow((state) => ({
        setSourceTokenAmountUsd: state.setSourceTokenAmountUsd,
        setDestinationTokenAmountUsd: state.setDestinationTokenAmountUsd,
      })),
    );
  const isTxProcessing = useIsTransactionProcessing();

  const { tokens: userBalances = [], isLoading: isBalanceLoading } =
    useUsersBalances({
      address,
      chainId: token.token.chainId,
      selectTokens: [token.token.address],
    });

  const findCurrentBalance = useCallback(
    (userBalances: UserTokenInfo[]): string => {
      return formatUnits(
        userBalances.find(
          (userTokenInfo: UserTokenInfo) =>
            userTokenInfo.chainId === token.token.chainId &&
            isAddressEqual(
              userTokenInfo.address as Address,
              token.token.address as Address,
            ),
        )?.balance || BigInt(0),
        token.token.decimals,
      );
    },
    [token.token.chainId, token.token.address, token.token.decimals],
  );

  const tokenBalance = findCurrentBalance(userBalances);
  const tokenBalanceTrimmed = useMemo(() => {
    return readableAmount(tokenBalance);
  }, [tokenBalance]);

  const { data: tokenUsdData, error: tokenUsdPriceError } = useUsdConversion({
    chainId: token.token.chainId,
    tokenAddress: token.token.address,
    enable: Number(token.amount) > 0,
  });
  // Quote may be null. Decent types lie.
  const tokenUsdPrice =
    (tokenUsdData?.found && tokenUsdData?.quote?.formatted) || '';

  const inputUsdValue: string = useMemo(() => {
    if (Number.isNaN(Number(tokenUsdPrice)) || tokenUsdPriceError) {
      return `Price not available`;
    }

    if (tokenUsdPrice) {
      const totalUsdValue = Number(tokenUsdPrice) * Number(token.amount);

      if (totalUsdValue >= 1e14) {
        return `$${totalUsdValue.toExponential(2).replace('e', 'E').replace('+', '')}`;
      } else if (totalUsdValue >= 1e12) {
        return currencyFormatter.format(totalUsdValue / 1e12) + 'T';
      } else if (totalUsdValue >= 1e9) {
        return currencyFormatter.format(totalUsdValue / 1e9) + 'B';
      } else if (totalUsdValue >= 1e6) {
        return currencyFormatter.format(totalUsdValue / 1e6) + 'M';
      } else if (totalUsdValue >= 1e3) {
        return currencyFormatter.format(totalUsdValue / 1e3) + 'K';
      } else {
        return currencyFormatter.format(totalUsdValue);
      }
    } else {
      return '$0';
    }
  }, [tokenUsdPrice, token.amount, tokenUsdPriceError]);

  useEffect(() => {
    if (isTxProcessing) {
      // Do not update the USD value if the transaction is processing
      return;
    }
    if (srcToken) {
      setSourceTokenAmountUsd(inputUsdValue);
    } else {
      setDestinationTokenAmountUsd(inputUsdValue);
    }
  }, [
    srcToken,
    isTxProcessing,
    inputUsdValue,
    setSourceTokenAmountUsd,
    setDestinationTokenAmountUsd,
  ]);

  return {
    tokenBalance,
    tokenBalanceTrimmed,
    inputUsdValue,
    isBalanceLoading,
  };
};
