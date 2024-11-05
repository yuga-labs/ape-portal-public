import { useMemo } from 'react';
import { useBridgeStore } from './useBridgeStore';
import { humanReadableBridgeError } from '../types';

/** Light transformer for various error states of `useBridgeStore`. */
export const useBridgeError = () => {
  const { bridgeError } = useBridgeStore((state) => ({
    bridgeError: state.bridgeError,
  }));

  const bridgeErrorMessage: string | undefined = useMemo(() => {
    if (bridgeError) {
      return humanReadableBridgeError[bridgeError];
    }
  }, [bridgeError]);

  return {
    bridgeErrorMessage,
  };
};
