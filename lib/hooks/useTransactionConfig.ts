import { useEffect, useRef, useState } from 'react';
import { usePortalStore } from '../store/usePortalStore.ts';
import { isAddress, parseUnits, zeroAddress } from 'viem';
import {
  ActionType,
  bigintSerializer,
  ChainId,
  SwapActionConfig,
  SwapDirection,
} from '@decent.xyz/box-common';
import { useAccount } from 'wagmi';
import { UseBoxActionArgs } from '@decent.xyz/box-hooks';
import { InputType } from '../utils/constants.ts';
import { useApeContext } from '../providers/ape/apeProvider.context.ts';

const DisabledTransactionConfig: UseBoxActionArgs = {
  sender: zeroAddress,
  srcToken: zeroAddress,
  srcChainId: ChainId.ETHEREUM,
  dstToken: zeroAddress,
  dstChainId: ChainId.ETHEREUM,
  slippage: 0,
  actionType: ActionType.SwapAction,
  actionConfig: {
    amount: 0n,
    swapDirection: SwapDirection.EXACT_AMOUNT_IN,
    chainId: ChainId.ETHEREUM,
  },
  enable: false,
};

export const useTransactionConfig = (): UseBoxActionArgs => {
  const { destinationAddress } = useApeContext();
  const { address } = useAccount();
  const [useBoxActionArgs, setUseBoxActionArgs] = useState<UseBoxActionArgs>();
  const {
    sourceToken,
    destinationToken,
    bridgeTransactionData,
    lastChanged,
    resetTransactionData,
  } = usePortalStore((state) => ({
    bridgeTransactionData: state.bridgeTransactionData,
    lastChanged: state.lastChanged,
    sourceToken: state.sourceToken,
    destinationToken: state.destinationToken,
    resetTransactionData: state.resetTransactionData,
  }));

  const sourceAmount = useRef<string | undefined>();
  const destAmount = useRef<string | undefined>();

  useEffect(() => {
    if (lastChanged === InputType.Source) {
      if (
        sourceToken.amount !== sourceAmount.current &&
        Number(sourceToken.amount) <= 0
      ) {
        sourceAmount.current = undefined;
        setUseBoxActionArgs(undefined);
        resetTransactionData();
        return;
      } else {
        sourceAmount.current = sourceToken.amount;
      }
    }

    if (lastChanged === InputType.Destination) {
      if (
        destinationToken.amount !== destAmount.current &&
        Number(destinationToken.amount) <= 0
      ) {
        destAmount.current = undefined;
        setUseBoxActionArgs(undefined);
        resetTransactionData();
        return;
      } else {
        destAmount.current = destinationToken.amount;
      }
    }

    const actionConfig: SwapActionConfig =
      lastChanged === InputType.Source
        ? {
            amount: parseUnits(sourceToken.amount, sourceToken.token.decimals),
            swapDirection: SwapDirection.EXACT_AMOUNT_IN,
            chainId: sourceToken.token.chainId,
          }
        : {
            amount: parseUnits(
              destinationToken.amount,
              destinationToken.token.decimals,
            ),
            swapDirection: SwapDirection.EXACT_AMOUNT_OUT,
            chainId: destinationToken.token.chainId,
          };

    if (destinationAddress && isAddress(destinationAddress)) {
      actionConfig.receiverAddress = destinationAddress;
    }

    const newUseBoxActionArgs: UseBoxActionArgs = {
      sender: address ?? zeroAddress,
      srcToken: sourceToken.token.address,
      srcChainId: sourceToken.token.chainId,
      dstToken: destinationToken.token.address,
      dstChainId: destinationToken.token.chainId,
      slippage: bridgeTransactionData.slippagePercentage,
      actionType: ActionType.SwapAction,
      actionConfig: actionConfig,
      enable: true,
    };

    if (
      JSON.stringify(useBoxActionArgs, bigintSerializer) !==
      JSON.stringify(newUseBoxActionArgs, bigintSerializer)
    ) {
      setUseBoxActionArgs(newUseBoxActionArgs);
    }
  }, [
    address,
    destinationToken,
    lastChanged,
    destinationAddress,
    bridgeTransactionData,
    sourceToken,
    useBoxActionArgs,
    resetTransactionData,
  ]);

  return useBoxActionArgs ?? DisabledTransactionConfig;
};
