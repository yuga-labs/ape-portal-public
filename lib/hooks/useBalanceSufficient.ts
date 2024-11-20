import { useEffect, useMemo, useRef } from 'react';
import { BoxActionResponse } from '@decent.xyz/box-common';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { useBridgeStore } from '../store/useBridgeStore';
import { Address, erc20Abi } from 'viem';
import { useChainConfig } from './useChainConfig';
import { usePortalStore } from '../store/usePortalStore';

export const useBalanceSufficient = (
  preparedTransaction: BoxActionResponse | undefined,
) => {
  const { address } = useAccount();
  const balanceSufficient = useRef(false);
  const { setBridgeError } = useBridgeStore((state) => ({
    setBridgeError: state.setBridgeError,
  }));
  const bridgeTransactionData = usePortalStore(
    (state) => state.bridgeTransactionData,
  );
  const { chains } = useChainConfig();
  const chainId = preparedTransaction?.tokenPayment?.chainId;
  const isValidChain = chainId !== undefined && chains.includes(chainId);

  const nativeTokenBalance = useBalance({
    address,
    chainId,
    query: {
      enabled:
        !!address &&
        isValidChain &&
        !!preparedTransaction?.tokenPayment &&
        preparedTransaction?.tokenPayment?.isNative,
    },
  });

  /** Total amount of fees required in the native token, in the smallest unit (wei). */
  const totalFeesNativeWei = useMemo(() => {
    return (
      (preparedTransaction?.applicationFee?.amount ?? 0n) +
      (preparedTransaction?.protocolFee?.amount ?? 0n) +
      (preparedTransaction?.bridgeFee?.amount ?? 0n) +
      bridgeTransactionData.gasFeeWei
    );
  }, [
    preparedTransaction?.applicationFee?.amount,
    preparedTransaction?.protocolFee?.amount,
    preparedTransaction?.bridgeFee?.amount,
    bridgeTransactionData.gasFeeWei,
  ]);

  // Monitors balance sufficiency for swaps using the native token as the source
  useEffect(() => {
    if (
      !preparedTransaction?.tokenPayment ||
      !preparedTransaction.tokenPayment.isNative ||
      nativeTokenBalance.data?.value === undefined
    ) {
      return;
    }
    const totalNativePaymentWithFees =
      preparedTransaction.tokenPayment.amount + totalFeesNativeWei;
    if (
      nativeTokenBalance.data.value < preparedTransaction.tokenPayment.amount
    ) {
      balanceSufficient.current = false;
      setBridgeError('INSUFFICIENT_FUNDS');
    } else if (nativeTokenBalance.data?.value < totalNativePaymentWithFees) {
      balanceSufficient.current = false;
      setBridgeError('INSUFFICIENT_FUNDS_FOR_FEES');
    } else {
      balanceSufficient.current = true;
    }
  }, [
    totalFeesNativeWei,
    nativeTokenBalance.data?.value,
    preparedTransaction,
    setBridgeError,
    bridgeTransactionData.gasFeeWei,
  ]);

  // Non-native (ERC-20) token balance monitor.
  const { data: tokenBalance } = useReadContract({
    address: preparedTransaction?.tokenPayment?.tokenAddress
      ? (preparedTransaction?.tokenPayment?.tokenAddress as Address)
      : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as Address],
    chainId,
    query: {
      enabled:
        !!address &&
        isValidChain &&
        !!preparedTransaction?.tokenPayment &&
        preparedTransaction?.tokenPayment?.isNative == false,
    },
  });
  useEffect(() => {
    if (preparedTransaction?.tokenPayment?.isNative) {
      return;
    }
    if (
      tokenBalance !== undefined &&
      preparedTransaction?.tokenPayment?.amount !== undefined &&
      tokenBalance < preparedTransaction.tokenPayment.amount
    ) {
      balanceSufficient.current = false;
      setBridgeError('INSUFFICIENT_FUNDS');
    } else if (
      nativeTokenBalance.data?.value !== undefined &&
      nativeTokenBalance.data.value < totalFeesNativeWei
    ) {
      balanceSufficient.current = false;
      setBridgeError('INSUFFICIENT_FUNDS_FOR_FEES');
    } else {
      balanceSufficient.current = true;
    }
  }, [
    tokenBalance,
    preparedTransaction?.tokenPayment?.amount,
    preparedTransaction?.tokenPayment?.isNative,
    nativeTokenBalance.data?.value,
    totalFeesNativeWei,
    setBridgeError,
  ]);

  return {
    balanceSufficient,
  };
};
