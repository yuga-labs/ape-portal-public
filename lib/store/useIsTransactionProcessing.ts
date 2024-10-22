import { useBridgeStore } from './useBridgeStore';

/**
 * Returns true if a transaction is currently being processed.
 */
export const useIsTransactionProcessing = () => {
  const { bridgeTransactionHash, waitingForSignature } = useBridgeStore(
    (state) => ({
      bridgeTransactionHash: state.bridgeTransactionHash,
      waitingForSignature: state.waitingForSignature,
    }),
  );

  return !!bridgeTransactionHash || waitingForSignature;
};
