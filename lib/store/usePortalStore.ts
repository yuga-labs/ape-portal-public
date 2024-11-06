import { create } from 'zustand';
import { produce } from 'immer';
import {
  ChainId,
  getNativeTokenInfoOrFail,
  TokenInfo,
} from '@decent.xyz/box-common';
import {
  ApeCoinMainnetEthereum,
  secondsToReadableTime,
} from '../utils/utils.ts';
import { BridgeTransactionData } from '../classes/BridgeTransactionData.ts';
import { TokenTransactionData } from '../classes/TokenTransactionData.ts';
import {
  InputType,
  WARNING_PRICE_IMPACT,
  WARNING_THRESHOLD_FIVE_MINUTES,
  WARNING_THRESHOLD_PRICE_IMPACT,
} from '../utils/constants.ts';

interface PortalState {
  sourceToken: TokenTransactionData;
  destinationToken: TokenTransactionData;
  stashedToken: TokenTransactionData | undefined;
  bridgeTransactionData: BridgeTransactionData;
  tokenApprovalTxHash: string | undefined;
  /* Used to enforce token defaults until the user explicitly changes the tokens */
  hasUserUpdatedTokens: boolean;
  /* Input State */
  lastChanged: InputType;
}

interface PortalActions {
  /* Source Token Methods */
  setSourceToken: (token: TokenInfo) => void;
  setSourceChainGasTokenUsdValue: (value: number) => void;
  setSourceTokenAmount: (amount: string) => void;
  setSourceTokenAmountUsd: (amount: string) => void;
  maxOutSourceToken: (userBalance: string) => void;
  /* Destination Token Methods */
  setDestinationToken: (token: TokenInfo) => void;
  setDestinationTokenAmount: (amount: string) => void;
  setDestinationTokenAmountUsd: (amount: string) => void;
  swapSourceDestination: () => void;
  setPriceImpactWarning: (priceImpact?: number) => void;
  setTxTimeWarning: (estimatedTxTime?: number) => void;
  setTokenApprovalTxHash: (txHash: string) => void;
  setStashedToken: (token: TokenTransactionData | undefined) => void;
  updateTransactionData: (
    sourceAmount: string,
    destAmount: string,
    bridgeFee: string,
    gasFee: string,
  ) => void;
  setSlippagePercentage: (slippage: number) => void;
  resetSlippage: () => void;
  /** Reset warnings, gas prices and fees, and only the last touched token amount. */
  resetTransactionData: () => void;
  /** Reset warnings, gas prices and fees, and both source/dest token amounts. */
  resetTransactionDataAndAmounts: () => void;
  setHasUserUpdatedTokens: () => void;
}

export const defaultBridgeSourceToken = ApeCoinMainnetEthereum;
export const defaultBridgeDestinationToken = getNativeTokenInfoOrFail(
  ChainId.APE,
);
export const defaultSwapSourceToken = getNativeTokenInfoOrFail(
  ChainId.ETHEREUM,
);
export const defaultSwapDestinationToken: TokenInfo = ApeCoinMainnetEthereum;

export const usePortalStore = create<PortalState & PortalActions>()((set) => ({
  sourceToken: new TokenTransactionData(defaultBridgeSourceToken),
  destinationToken: new TokenTransactionData(defaultBridgeDestinationToken),
  stashedToken: undefined,
  setStashedToken: (token: TokenTransactionData | undefined) =>
    set(
      produce((state) => {
        state.stashedToken = token;
      }),
    ),
  bridgeTransactionData: new BridgeTransactionData(),
  destinationChain: defaultBridgeDestinationToken.chainId,
  bridgeTransaction: undefined,
  tokenApprovalTxHash: undefined,
  lastChanged: InputType.Source,
  hasUserUpdatedTokens: false,
  setHasUserUpdatedTokens: () =>
    set(
      produce((state) => {
        state.hasUserUpdatedTokens = true;
      }),
    ),
  /** Reset warnings, gas prices and fees, and only the last touched token amount. */
  resetTransactionData: () =>
    set(
      produce((state) => {
        state.bridgeTransactionData.resetTransactionData();
        // Reset amount for the "non touched" field to zero out the quote
        if (state.lastChanged == InputType.Source) {
          state.destinationToken.amount = '';
        } else {
          state.sourceToken.amount = '';
        }
      }),
    ),
  /** Reset warnings, gas prices and fees, and both source/dest token amounts. */
  resetTransactionDataAndAmounts: () =>
    set(
      produce((state) => {
        state.bridgeTransactionData.resetTransactionData();
        state.sourceToken.amount = '';
        state.destinationToken.amount = '';
      }),
    ),
  updateTransactionData: (
    sourceAmount: string,
    destAmount: string,
    bridgeFee: string,
    gasFee: string,
  ) =>
    set(
      produce((state) => {
        if (state.lastChanged !== InputType.Source) {
          state.sourceToken.amount = sourceAmount;
        }
        state.destinationToken.amount = destAmount;
        state.bridgeTransactionData.applicationFee = bridgeFee;
        state.bridgeTransactionData.setApplicationFeeUsd = bridgeFee;
        state.bridgeTransactionData.gasFee = gasFee;
        state.bridgeTransactionData.setGasFeeUsd = gasFee;
      }),
    ),
  setSourceChainGasTokenUsdValue: (value: number) =>
    set(
      produce((state) => {
        state.bridgeTransactionData.sourceChainGasTokenUsdValue = value;
      }),
    ),
  setSlippagePercentage: (slippage: number) =>
    set(
      produce((state) => {
        state.bridgeTransactionData.slippagePercentage = slippage;
      }),
    ),
  resetSlippage: () =>
    set(
      produce((state) => {
        state.bridgeTransactionData.resetSlippage();
      }),
    ),
  setPriceImpactWarning: (priceImpact?: number) =>
    set(
      produce((state) => {
        if (!priceImpact || priceImpact < WARNING_THRESHOLD_PRICE_IMPACT) {
          state.bridgeTransactionData.priceImpactWarning = undefined;
          return;
        }
        state.bridgeTransactionData.priceImpactWarning =
          WARNING_PRICE_IMPACT(priceImpact);
      }),
    ),
  setTxTimeWarning: (estimatedTxTime?: number) => {
    set(
      produce((state) => {
        state.bridgeTransactionData.estimatedTxTime = estimatedTxTime;
        if (
          !estimatedTxTime ||
          estimatedTxTime < WARNING_THRESHOLD_FIVE_MINUTES
        ) {
          state.bridgeTransactionData.timeWarning = undefined;
          return;
        }
        const readableTime = secondsToReadableTime(estimatedTxTime);
        state.bridgeTransactionData.timeWarning = `The estimated waiting time to bridge is ${readableTime}.`;
      }),
    );
  },
  setTokenApprovalTxHash: (txHash: string) =>
    set(
      produce((state) => {
        state.tokenApprovalTxHash = txHash;
      }),
    ),
  setSourceTokenAmount: (amount: string) =>
    set(
      produce((state) => {
        state.sourceToken.amount = amount;
        state.lastChanged = InputType.Source;
      }),
    ),
  setSourceTokenAmountUsd: (amount: string) =>
    set(
      produce((state) => {
        state.sourceToken.amountUsd = amount;
      }),
    ),
  setDestinationTokenAmount: (amount: string) =>
    set(
      produce((state) => {
        state.destinationToken.amount = amount;
        state.lastChanged = InputType.Destination;
      }),
    ),
  setDestinationTokenAmountUsd: (amount: string) =>
    set(
      produce((state) => {
        state.destinationToken.amountUsd = amount;
      }),
    ),
  setSourceToken: (token: TokenInfo) =>
    set(
      produce((state) => {
        state.sourceToken = new TokenTransactionData(
          token,
          state.sourceToken.amount,
        );
      }),
    ),
  setDestinationToken: (token: TokenInfo) =>
    set(
      produce((state) => {
        state.destinationToken = new TokenTransactionData(
          token,
          state.destinationToken.amount,
        );
      }),
    ),
  swapSourceDestination: () => {
    set(
      produce((state) => {
        const currentSource = state.sourceToken;
        state.sourceToken = state.destinationToken;
        state.destinationToken = currentSource;
        state.hasUserUpdatedTokens = true;
      }),
    );
  },
  maxOutSourceToken: (userBalance: string) =>
    set(
      produce((state) => {
        state.sourceToken.amount = userBalance;
        state.lastChanged = InputType.Source;
      }),
    ),
}));
