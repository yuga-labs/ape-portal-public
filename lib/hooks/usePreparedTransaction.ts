import {
  BoxActionResponse,
  EvmTransaction,
  getNativeTokenInfo,
  Payment,
} from '@decent.xyz/box-common';
import {
  useAccount,
  useConfig,
  useEstimateFeesPerGas,
  useEstimateGas,
} from 'wagmi';
import { usePortalStore } from '../store/usePortalStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useBridgeStore } from '../store/useBridgeStore.ts';
import {
  UseBoxActionArgs,
  useBoxAction as useDecentTransaction,
} from '@decent.xyz/box-hooks';
import {
  Address,
  EstimateGasExecutionError,
  formatUnits,
  InsufficientFundsError,
  parseGwei,
  zeroAddress,
} from 'viem';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useChainConfig } from './useChainConfig.ts';
import { useIsTransactionProcessing } from '../store/useIsTransactionProcessing.ts';
import { isApprovalNeeded } from '../utils/tokenApproval.ts';
import { DISABLE_BUTTON_THRESHOLD_PRICE_IMPACT } from '../utils/constants.ts';
import { useBalanceSufficient } from './useBalanceSufficient.ts';

const fallbackGasPriceInWei = parseGwei('5');
/** Estimate the amount of gas used by a bridge or swap operation through Decent contracts. These averages are very rough but should be reasonable to approximate the  quotes from `eth_estimateGas` */
const getFallbackGasEstimate = (isBridge: boolean): bigint =>
  isBridge ? 700_000n : 50_000n;

export const usePreparedTransaction = (useBoxActionArgs: UseBoxActionArgs) => {
  const { address } = useAccount();
  const { isWrongChain } = useChainConfig();
  const wagmiConfig = useConfig();
  const {
    sourceToken,
    setTxTimeWarning,
    setPriceImpactWarning,
    updateTransactionData,
  } = usePortalStore(
    useShallow((state) => ({
      sourceToken: state.sourceToken,
      setPriceImpactWarning: state.setPriceImpactWarning,
      setTxTimeWarning: state.setTxTimeWarning,
      updateTransactionData: state.updateTransactionData,
    })),
  );
  const { setBridgeError, clearBridgeError, setIsTokenApprovalRequired } =
    useBridgeStore((state) => ({
      setBridgeError: state.setBridgeError,
      clearBridgeError: state.resetBridgeError,
      setIsTokenApprovalRequired: state.setIsTokenApprovalRequired,
    }));
  const sourceChainGasToken = useMemo(
    () => getNativeTokenInfo(sourceToken.token.chainId),
    [sourceToken.token.chainId],
  );
  const isTransactionProcessing = useIsTransactionProcessing();

  const {
    actionResponse: preparedTransaction,
    isLoading: prepareTransactionLoading,
    error: prepareTransactionErrorData,
  } = useDecentTransaction({
    ...useBoxActionArgs,
    enable: useBoxActionArgs.enable && !isTransactionProcessing,
  });
  const tx = preparedTransaction?.tx as EvmTransaction;
  const { balanceSufficient } = useBalanceSufficient(preparedTransaction);

  const gasQueriesEnabled =
    tx !== undefined && address && !isWrongChain && !isTransactionProcessing;

  const gasQueryOptions = {
    enabled: gasQueriesEnabled,
    refetchInterval: 15_000, // seconds
    retry: false, // avoid retrying, or the UI appears very sluggish while the 'loading' state lingers
  };

  const {
    data: maxFeesPerGas,
    isLoading: maxFeesPerGasLoading,
    error: maxFeesPerGasErrorData,
  } = useEstimateFeesPerGas({
    chainId: sourceToken.token.chainId,
    query: {
      ...gasQueryOptions,
      select: (data) => data.maxFeePerGas,
    },
  });
  // Log maxFeesPerGasErrorData to console
  useEffect(() => {
    if (maxFeesPerGasErrorData) {
      console.error(
        'error getting maxFeesPerGas for chain',
        JSON.stringify(maxFeesPerGasErrorData, undefined, 2),
      );
    }
  }, [maxFeesPerGasErrorData]);

  const {
    data: gasEstimate,
    isLoading: gasEstimateLoading,
    error: gasEstimateErrorData,
  } = useEstimateGas({
    chainId: sourceToken.token.chainId,
    account: address ?? zeroAddress,
    to: tx?.to,
    data: tx?.data,
    value: tx?.value,
    query: {
      ...gasQueryOptions,
      /** Only check gas estimates _after_ balance was checked as sufficient. */
      enabled: gasQueriesEnabled && balanceSufficient.current,
    },
  });
  /** Stores the last successful gas unit estimation to prevent $USD displayed estimates from jumping around
   * after preparedTransaction was refreshed.
   */
  const lastGasEstimate = useRef<bigint>();
  useEffect(() => {
    if (gasEstimate) {
      lastGasEstimate.current = gasEstimate;
    }
  }, [gasEstimate]);

  const setErrorAndCheckForApproval = useCallback(
    async (
      boxActionResponse: BoxActionResponse,
      address: Address,
      chainId: number,
    ) => {
      try {
        const approvalNeeded = await isApprovalNeeded({
          boxActionResponse,
          user: address,
          srcChainId: chainId,
          wagmiConfig,
        });
        if (approvalNeeded) {
          setBridgeError(undefined);
          setIsTokenApprovalRequired(true);
        } else {
          setIsTokenApprovalRequired(false);
          setBridgeError('UNKNOWN_ERROR');
        }
      } catch (error) {
        console.error(error);
        setBridgeError('UNKNOWN_ERROR');
      }
    },
    [setBridgeError, setIsTokenApprovalRequired, wagmiConfig],
  );

  useEffect(() => {
    // As long as balance is sufficient, clear all previous errors
    if (balanceSufficient.current) {
      clearBridgeError();
    }

    setIsTokenApprovalRequired(false);

    if (prepareTransactionErrorData) {
      // Decent.xyz API returned an error.
      // TODO - should we zero out the source or destination amount in this case? probably related to APEW-301.
      if (
        prepareTransactionErrorData instanceof Error &&
        /wrong network/i.test(prepareTransactionErrorData.message)
      ) {
        setBridgeError('WRONG_NETWORK');
        return;
      }
      console.error(
        'Transaction Data Error:',
        JSON.stringify(prepareTransactionErrorData, undefined, 2),
      );
      setBridgeError('UNKNOWN_ERROR');
    } else if (
      balanceSufficient.current &&
      gasEstimateErrorData &&
      !isWrongChain &&
      address
    ) {
      // Error in estimating gas.
      if (gasEstimateErrorData instanceof EstimateGasExecutionError) {
        console.log(
          'gasEstimateErrorData is an instance of EstimateGasExecutionError',
        );
        if (
          InsufficientFundsError.nodeMessage.test(
            gasEstimateErrorData.cause.details,
          ) ||
          /amount exceeds balance/.test(gasEstimateErrorData.cause.details) ||
          /insufficient/i.test(gasEstimateErrorData.cause.details)
        ) {
          setBridgeError('INSUFFICIENT_FUNDS');
        } else if (/allowance/i.test(gasEstimateErrorData.cause.details)) {
          console.log(
            'ERC20 token not approved, so we cannot estimate the gas cost',
          );
          // ERC20 token not approved, so we cannot estimate the gas cost
          setBridgeError(undefined);
          setIsTokenApprovalRequired(true);
        } else {
          console.error(JSON.stringify(gasEstimateErrorData, undefined, 2));

          // Try checking ERC20 allowance
          if (
            !sourceToken.token.isNative &&
            address &&
            preparedTransaction &&
            balanceSufficient.current
          ) {
            setErrorAndCheckForApproval(
              preparedTransaction,
              address,
              sourceToken.token.chainId,
            );
          }
        }
      } else if (gasEstimateErrorData instanceof Error) {
        console.error(gasEstimateErrorData);
      }
    }

    if (preparedTransaction) {
      const gasUnits =
        gasEstimate ??
        lastGasEstimate.current ??
        getFallbackGasEstimate(
          preparedTransaction.amountOut?.chainId !== sourceToken.token.chainId,
        );

      const totalGasWei = gasUnits * (maxFeesPerGas || fallbackGasPriceInWei); // Multiply gas units by current gas fees in wei

      if (!sourceChainGasToken) {
        console.error('sourceChainGasToken is undefined');
        setBridgeError('UNKNOWN_ERROR');
        return;
      }

      const totalGasFee = {
        amount: totalGasWei,
        decimals: sourceChainGasToken.decimals,
      } as Payment;

      const zeroFeeFallback = {
        amount: 0n,
        decimals: sourceToken.token.decimals,
      } as Payment;

      const {
        tokenPayment, // eg. amountIn
        amountOut,
        applicationFee,
        bridgeFee,
        protocolFee,
        exchangeRate: apiExchangeRate,
      } = preparedTransaction;
      if (
        tokenPayment?.decimals === undefined ||
        amountOut?.decimals === undefined ||
        apiExchangeRate === undefined
      ) {
        // invalid response
        setBridgeError('UNKNOWN_ERROR');
        return;
      }

      const totalAppFeesAmount =
        (applicationFee?.amount ?? zeroFeeFallback.amount) +
        (bridgeFee?.amount ?? zeroFeeFallback.amount) +
        (protocolFee?.amount ?? zeroFeeFallback.amount);

      const totalAppFees = {
        amount: totalAppFeesAmount,
        decimals: applicationFee?.decimals ?? sourceToken.token.decimals,
      } as Payment;

      const [amountInStr, amountOutStr, totalAppFeesStr, gasFeeStr] = [
        tokenPayment,
        amountOut,
        totalAppFees,
        totalGasFee,
      ].map((payment: Payment) =>
        formatUnits(payment.amount, payment.decimals as number),
      );

      updateTransactionData(
        amountInStr,
        amountOutStr,
        totalAppFeesStr,
        gasFeeStr,
      );
      const { estimatedTxTime } = preparedTransaction;
      if (estimatedTxTime) {
        setTxTimeWarning(Math.ceil(estimatedTxTime));
      } else {
        setTxTimeWarning(undefined);
      }
      const { estimatedPriceImpact } = preparedTransaction;
      if (estimatedPriceImpact) {
        setPriceImpactWarning(estimatedPriceImpact);
      } else {
        setPriceImpactWarning(undefined);
      }

      if (
        estimatedPriceImpact &&
        estimatedPriceImpact >= DISABLE_BUTTON_THRESHOLD_PRICE_IMPACT
      ) {
        setBridgeError('HIGH_PRICE_IMPACT');
      }
    }
  }, [
    preparedTransaction,
    prepareTransactionErrorData,
    gasEstimate,
    maxFeesPerGas,
    setBridgeError,
    setTxTimeWarning,
    setPriceImpactWarning,
    sourceToken,
    updateTransactionData,
    clearBridgeError,
    setIsTokenApprovalRequired,
    gasEstimateErrorData,
    sourceChainGasToken,
    isWrongChain,
    address,
    wagmiConfig,
    setErrorAndCheckForApproval,
    balanceSufficient,
  ]);

  return {
    loading:
      prepareTransactionLoading || maxFeesPerGasLoading || gasEstimateLoading,
    preparedTransaction,
  };
};
