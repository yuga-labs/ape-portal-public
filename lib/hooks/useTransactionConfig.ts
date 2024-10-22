import { useEffect, useRef, useState } from 'react';
import { usePortalStore } from '../store/usePortalStore.ts';
import {
  Address,
  isAddress,
  isAddressEqual,
  parseUnits,
  zeroAddress,
} from 'viem';
import {
  ActionType,
  bigintSerializer,
  BridgeId,
  ChainId,
  SwapActionConfig,
  SwapDirection,
  TokenInfo,
} from '@decent.xyz/box-common';
import { useAccount } from 'wagmi';
import { UseBoxActionArgs } from '@decent.xyz/box-hooks';
import { InputType } from '../utils/constants.ts';
import { useApeContext } from '../providers/ape/apeProvider.context.ts';
import {
  ApeCoinMainnetArbitrumContract,
  ApeCoinMainnetEthereumContract,
} from '../utils/utils.ts';

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

function isApechainOrApecoin(token: TokenInfo): boolean {
  if (token.chainId === ChainId.APE || token.chainId === ChainId.APE_CURTIS) {
    return true;
  }
  return (
    isAddressEqual(token.address as Address, ApeCoinMainnetArbitrumContract) ||
    isAddressEqual(token.address as Address, ApeCoinMainnetEthereumContract)
  );
}

export const useTransactionConfig = (): UseBoxActionArgs => {
  const { destinationAddress } = useApeContext();
  const { address } = useAccount();
  const [useBoxActionArgs, setUseBoxActionArgs] = useState<UseBoxActionArgs>();
  const {
    sourceToken,
    destinationToken,
    bridgeTransactionData,
    lastChanged,
    clearTransactionData,
  } = usePortalStore((state) => ({
    bridgeTransactionData: state.bridgeTransactionData,
    lastChanged: state.lastChanged,
    sourceToken: state.sourceToken,
    destinationToken: state.destinationToken,
    clearTransactionData: state.clearTransactionData,
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
        clearTransactionData();
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
        clearTransactionData();
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

    // For decent's initial ApeChain OFT support, bridge transactions must set bridgeId property if ApeChain or ApeCoin ARB is involved in the TX
    if (
      sourceToken.token.chainId !== destinationToken.token.chainId &&
      (isApechainOrApecoin(sourceToken.token) ||
        isApechainOrApecoin(destinationToken.token))
    ) {
      newUseBoxActionArgs.bridgeId = BridgeId.OFT;
    }

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
    clearTransactionData,
  ]);

  return useBoxActionArgs ?? DisabledTransactionConfig;
};
