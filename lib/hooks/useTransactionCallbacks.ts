import { useMemo } from 'react';
import { TransactionCallbacks } from '../components/ui/types.ts';
import { BridgeState, DecentBridgeStatus } from '../types.ts';
import usePrevious from './usePrevious.ts';

export type useTransactionCallbacksArgs = TransactionCallbacks & {
  status: BridgeState;
  chainId: number;
  transactionHash?: string;
  details?: DecentBridgeStatus;
};
/**
 * Hook that triggers callbacks when a transaction completes or fails.
 */
export default function useTransactionCallbacks({
  status,
  chainId,
  transactionHash,
  details,
  onTransactionSuccess,
  onTransactionError,
}: useTransactionCallbacksArgs) {
  const prevStatus = usePrevious(status);
  useMemo(() => {
    if (
      prevStatus === BridgeState.PROCESSING &&
      status === BridgeState.COMPLETED
    ) {
      onTransactionSuccess?.({
        chainId,
        transactionHash,
        details,
      });
    }
    if (
      prevStatus === BridgeState.PROCESSING &&
      status === BridgeState.FAILED
    ) {
      onTransactionError?.({
        chainId,
        transactionHash,
        details,
      });
    }
  }, [
    prevStatus,
    status,
    details,
    chainId,
    transactionHash,
    onTransactionError,
    onTransactionSuccess,
  ]);
}
