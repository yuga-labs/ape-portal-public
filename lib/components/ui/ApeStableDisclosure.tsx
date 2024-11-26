import { Address, isAddressEqual, zeroAddress } from 'viem';
import {
  ApeEthOmnichainContract,
  ApeUsdOmnichainContract,
  UsdcArbMainnetContract,
  UsdcEthMainnetContract,
  UsdtArbMainnetContract,
  UsdtEthMainnetContract,
} from '../../utils/utils';
import AdaptiveTooltip from './tooltip/AdaptiveTooltip';
import { useMemo } from 'react';
import { InfoIcon } from '../icons/InfoIcon';
import { ChainId } from '@decent.xyz/box-common';

type ApeStableDisclosureProps = {
  isSourceToken: boolean;
  sourceTokenChainId: number;
  sourceTokenAddress: Address;
  destinationTokenChainId: number;
  destinationTokenAddress: Address;
};

/**
 * Display a warning icon with tooltip in specific source/dest chain and token scenarios.
 * Generally, this guides users to use the "base" stable token for a ~1:1 conversion of APE-ETH and APE-USD.
 */
export const ApeStableDisclosure = ({
  isSourceToken,
  sourceTokenChainId,
  sourceTokenAddress,
  destinationTokenChainId,
  destinationTokenAddress,
}: ApeStableDisclosureProps) => {
  const tooltipContent = useMemo(() => {
    // ETH-ETH or ARB-ETH -> APE-ETH
    if (
      (sourceTokenChainId === ChainId.ETHEREUM ||
        sourceTokenChainId === ChainId.ARBITRUM) &&
      isAddressEqual(sourceTokenAddress, zeroAddress) &&
      destinationTokenChainId === ChainId.APE &&
      isAddressEqual(destinationTokenAddress, ApeEthOmnichainContract)
    ) {
      return 'For a 1:1 conversion, use stETH to apeETH';
    }
    // APE-ETH -> ETH-ETH
    if (
      sourceTokenChainId === ChainId.APE &&
      isAddressEqual(sourceTokenAddress, ApeEthOmnichainContract) &&
      destinationTokenChainId === ChainId.ETHEREUM &&
      isAddressEqual(destinationTokenAddress, zeroAddress)
    ) {
      return 'For a 1:1 conversion, use apeETH to stETH';
    }
    // APE-ETH -> ARB-ETH
    if (
      sourceTokenChainId === ChainId.APE &&
      isAddressEqual(sourceTokenAddress, ApeEthOmnichainContract) &&
      destinationTokenChainId === ChainId.ARBITRUM &&
      isAddressEqual(destinationTokenAddress, zeroAddress)
    ) {
      return 'For a 1:1 conversion, use apeETH to stETH';
    }
    // ETH-USDC/USDT -> APE-USD
    if (
      sourceTokenChainId === ChainId.ETHEREUM &&
      (isAddressEqual(sourceTokenAddress, UsdcEthMainnetContract) ||
        isAddressEqual(sourceTokenAddress, UsdtEthMainnetContract)) &&
      destinationTokenChainId === ChainId.APE &&
      isAddressEqual(destinationTokenAddress, ApeUsdOmnichainContract)
    ) {
      return 'For a 1:1 conversion, use DAI to apeUSD';
    }
    // ARB-USDC/USDT -> APE-USD
    if (
      sourceTokenChainId === ChainId.ARBITRUM &&
      (isAddressEqual(sourceTokenAddress, UsdtArbMainnetContract) ||
        isAddressEqual(sourceTokenAddress, UsdcArbMainnetContract)) &&
      destinationTokenChainId === ChainId.APE &&
      isAddressEqual(destinationTokenAddress, ApeUsdOmnichainContract)
    ) {
      return 'For a 1:1 conversion, use DAI to apeUSD';
    }
    // APE-USD -> ETH-USDC/USDT
    if (
      sourceTokenChainId === ChainId.APE &&
      isAddressEqual(sourceTokenAddress, ApeUsdOmnichainContract) &&
      destinationTokenChainId === ChainId.ETHEREUM &&
      (isAddressEqual(destinationTokenAddress, UsdcEthMainnetContract) ||
        isAddressEqual(destinationTokenAddress, UsdtEthMainnetContract))
    ) {
      return 'For a 1:1 conversion, use apeUSD to DAI';
    }
    // APE-USD -> ARB-USDC/USDT
    if (
      sourceTokenChainId === ChainId.APE &&
      isAddressEqual(sourceTokenAddress, ApeUsdOmnichainContract) &&
      destinationTokenChainId === ChainId.ARBITRUM &&
      (isAddressEqual(destinationTokenAddress, UsdcArbMainnetContract) ||
        isAddressEqual(destinationTokenAddress, UsdtArbMainnetContract))
    ) {
      return 'For a 1:1 conversion, use apeUSD to DAI';
    }
  }, [
    sourceTokenAddress,
    sourceTokenChainId,
    destinationTokenChainId,
    destinationTokenAddress,
  ]);

  if (isSourceToken || !tooltipContent) {
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
