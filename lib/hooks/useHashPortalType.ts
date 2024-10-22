import { useEffect, useState } from 'react';
import { PortalType } from '../utils/constants.ts';
import { useApeContext } from '../providers/ape/apeProvider.context.ts';
import { useHash } from './useHash.ts';

type HashPair = [RegExp, PortalType];
const bridge: HashPair = [/#bridge\/?/, PortalType.Bridge];
const swap: HashPair = [/#swap\/?/, PortalType.Swap];
const onRamp: HashPair = [/#onramp\/?/, PortalType.OnRamp];
const hashPairs: HashPair[] = [bridge, swap, onRamp];

/**
 * Sets the selected tab based on the URL hash.
 */
export const useHashPortalType = (
  setSelectedPortalType?: (selectedPortalType: PortalType) => void,
): {
  hashPortalType: PortalType | undefined;
  hashTypeProcessing: boolean;
} => {
  const [hashTypeProcessing, setHashTypeProcessing] = useState<boolean>(true);
  const [hashPortalType, setHashPortalType] = useState<
    PortalType | undefined
  >();
  const { useHashRouter } = useApeContext();
  const hash = useHash();
  useEffect(() => {
    if (!useHashRouter) return;
    for (const [regex, portalType] of hashPairs) {
      if (regex.test(hash)) {
        setHashPortalType(portalType);
        setSelectedPortalType?.(portalType);
        setHashTypeProcessing(false);
        return;
      }
    }
    setHashTypeProcessing(false);
  }, [useHashRouter, hash, setSelectedPortalType]);

  return {
    hashPortalType,
    hashTypeProcessing,
  };
};
