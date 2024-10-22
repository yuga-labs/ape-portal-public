import { useEffect, useRef } from 'react';
import { BoxActionResponse } from '@decent.xyz/box-common';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { useBridgeStore } from '../store/useBridgeStore';
import { Address, erc20Abi } from 'viem';
import { useChainConfig } from './useChainConfig';

export const useBalanceSufficient = (
  preparedTransaction: BoxActionResponse | undefined,
) => {
  const { address } = useAccount();
  const balanceSufficient = useRef(false);
  const { setBridgeError } = useBridgeStore((state) => ({
    setBridgeError: state.setBridgeError,
  }));
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
  // Monitor for changes to sourceNativeTokenBalance and manage balanceSufficient state accordingly
  useEffect(() => {
    // TODO: This logic could get more complex and consider the `preparedTransaction?.tx?.value` as well, since
    //  that could be sent separately (and greater than) the tokenPayment.
    if (!preparedTransaction?.tokenPayment?.isNative) {
      return;
    }
    if (
      nativeTokenBalance.data?.value !== undefined &&
      preparedTransaction?.tokenPayment?.amount !== undefined &&
      nativeTokenBalance.data.value < preparedTransaction.tokenPayment.amount
    ) {
      balanceSufficient.current = false;
      setBridgeError('INSUFFICIENT_FUNDS');
    } else {
      balanceSufficient.current = true;
    }
  }, [
    nativeTokenBalance.data?.value,
    preparedTransaction?.tokenPayment?.amount,
    preparedTransaction?.tokenPayment?.isNative,
    setBridgeError,
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
    } else {
      balanceSufficient.current = true;
    }
  }, [
    tokenBalance,
    preparedTransaction?.tokenPayment?.amount,
    preparedTransaction?.tokenPayment?.isNative,
    setBridgeError,
  ]);

  return {
    balanceSufficient,
  };
};
