import { useMemo } from 'react';
import { useBridgeStore } from './useBridgeStore';
import { HIGH_IMPACT_ERROR, humanReadableBridgeError } from '../types';

/** Light transformer for various error states of `useBridgeStore`. */
export const useBridgeError = () => {
  const { bridgeError, highImpactError } = useBridgeStore((state) => ({
    bridgeError: state.bridgeError,
    highImpactError: state.highImpactError,
  }));

  const bridgeErrorMessage: string | undefined = useMemo(() => {
    if (highImpactError) {
      return HIGH_IMPACT_ERROR;
    }
    if (bridgeError) {
      return humanReadableBridgeError[bridgeError];
    }
  }, [bridgeError, highImpactError]);

  return {
    bridgeErrorMessage,
  };
};
