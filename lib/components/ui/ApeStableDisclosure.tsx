import { Address, isAddressEqual } from 'viem';
import {
  ApeEthOmnichainContract,
  ApeUsdOmnichainContract,
} from '../../utils/utils';
import AdaptiveTooltip from './tooltip/AdaptiveTooltip';
import { useMemo } from 'react';
import { InfoIcon } from '../icons/InfoIcon';

type ApeStableDisclosureProps = {
  isSourceToken: boolean;
  tokenAddress: Address;
  tokenUsdValue: string;
};

/**
 * Display a warning icon with tooltip if:
 *  - the token is the destination token, AND
 *  - the token is ApeUSD or ApeETH
 */
export const ApeStableDisclosure = ({
  isSourceToken,
  tokenAddress,
}: ApeStableDisclosureProps) => {
  const isApeUsd = isAddressEqual(tokenAddress, ApeUsdOmnichainContract);
  const isApeEth = isAddressEqual(tokenAddress, ApeEthOmnichainContract);
  const isApeStable = isApeUsd || isApeEth;

  const tooltipContent = useMemo(() => {
    if (isApeEth) {
      return 'The underlying price of APE-ETH is correlated with Liquid Staked ETH (stETH).';
    }
    if (isApeUsd) {
      return 'The underlying price of APE-USD is correlated with DAI.';
    }
  }, [isApeEth, isApeUsd]);

  if (isSourceToken || !isApeStable || !tooltipContent) {
    return;
  }

  return (
    <div className="aw-ml-2 aw-flex aw-items-center">
      <AdaptiveTooltip content={tooltipContent} className="aw-text-white">
        <InfoIcon className="aw-cursor-help" />
      </AdaptiveTooltip>
    </div>
  );
};
