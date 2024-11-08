import Granim from 'granim';
import { extendTailwindMerge } from 'tailwind-merge';
import clsx, { ClassValue } from 'clsx';
import { Address } from 'viem';
import {
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR,
  SECONDS_IN_MINUTE,
} from './constants';
import { ChainId, TokenInfo } from '@decent.xyz/box-common';
import { isAddressEqual } from 'viem';

export const pluralize = (amount: number): string => (amount > 1 ? 's' : '');

export const createGranimConfig = (
  element: string,
  direction: string = 'radial',
  speed: number = 3000,
) => {
  return {
    element,
    direction: direction,
    states: {
      'default-state': {
        gradients: [
          ['#a281ff', '#eb8280'],
          ['#ebbf9a', '#89d0ff'],
        ],
        transitionSpeed: speed,
      },
    },
  } as Granim.Options;
};

export const twMerge = extendTailwindMerge({
  prefix: 'aw-',
});

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const shortenAddress = (address: string | Address): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

/**
 * Truncate `amount` to a given number of `decimals`. Amounts less than 10^-decimals are returned as <0.00001 for example, with the number of decimal places equal to `decimals`.
 * @param amount The amount to truncate
 * @param decimals The number of decimal places to truncate to, assuming the amount is < 1. For amounts >= 1, the number of decimal places will be limited to 2.
 * @returns The truncated amount as a string
 *
 * Example: readableAmount(0.123456789, 5) => '0.12345'
 * Example: readableAmount(0.00000001, 5) => '<0.00001'
 * Example: readableAmount(123456789, 5) => '123456789'
 */
export function readableAmount(
  amount: string | number,
  decimals: number = 5,
): string {
  if (Number.isNaN(Number(amount)) || Number(amount) === 0) {
    return '0';
  }
  if (Number(amount) >= 1) {
    // Limit to 2 decimals for readability
    decimals = 2;
  }
  const truncated = Number.parseFloat(Number(amount).toFixed(decimals));
  if (truncated === 0) {
    return '<0.' + ''.padStart(decimals - 1, '0') + '1';
  }
  return truncated.toString();
}

export function secondsToReadableTime(seconds: number): string {
  if (seconds < SECONDS_IN_MINUTE) {
    return `${seconds} second${pluralize(seconds)}`;
  }
  if (seconds >= SECONDS_IN_MINUTE && seconds < SECONDS_IN_HOUR) {
    const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
    return `${minutes} minute${pluralize(minutes)}`;
  }
  if (seconds >= SECONDS_IN_HOUR && seconds < SECONDS_IN_DAY) {
    const hours = Math.floor(seconds / SECONDS_IN_HOUR);
    return `${hours} hour${pluralize(hours)}`;
  }
  if (seconds >= SECONDS_IN_DAY) {
    const days = Math.floor(seconds / SECONDS_IN_DAY);
    return `${days} day${pluralize(days)}`;
  }
  return '';
}

export const createApeCoinTokenInfo = (
  chainId: ChainId,
  address: string,
): TokenInfo => ({
  address,
  chainId,
  isNative: true,
  name: 'ApeCoin',
  symbol: 'APE',
  decimals: 18,
  logo: 'https://box-v3.api.decent.xyz/tokens/apecoin.svg',
});

export const ApeCoinMainnetEthereumContract =
  '0x4d224452801ACEd8B2F0aebE155379bb5D594381';
export const ApeCoinMainnetEthereum = createApeCoinTokenInfo(
  ChainId.ETHEREUM,
  ApeCoinMainnetEthereumContract,
);

/** Apecoin Contracts */
export const ApeCoinMainnetArbitrumContract =
  '0x7f9FBf9bDd3F4105C478b996B648FE6e828a1e98';
export const ApeUsdOmnichainContract =
  '0xA2235d059F80e176D931Ef76b6C51953Eb3fBEf4';
export const ApeEthOmnichainContract =
  '0xcF800F4948D16F23333508191B1B1591daF70438';

/** ETH mainnet stables */
export const UsdcEthMainnetContract =
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const UsdtEthMainnetContract =
  '0xdAC17F958D2ee523a2206206994597C13D831ec7';
export const DaiEthMainnetContract =
  '0x6B175474E89094C44Da98b954EedeAC495271d0F';
export const StethEthMainnetContract =
  '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';

/** ARB mainnet stables */
export const DaiArbMainnetContract =
  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1';
export const UsdtArbMainnetContract =
  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
export const UsdcArbMainnetContract =
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

export const isStableToken = (contractAddress: string | Address): boolean =>
  [
    UsdcEthMainnetContract,
    UsdtEthMainnetContract,
    DaiEthMainnetContract,
    DaiArbMainnetContract,
    UsdtArbMainnetContract,
    UsdcArbMainnetContract,
    ApeUsdOmnichainContract,
  ].some((stableContract) =>
    isAddressEqual(stableContract as Address, contractAddress as Address),
  );

const isStethAndApeEthTokenPair = (
  contractAddressA: string | Address,
  contractAddressB: string | Address,
): boolean =>
  (isAddressEqual(contractAddressA as Address, ApeEthOmnichainContract) &&
    isAddressEqual(contractAddressB as Address, StethEthMainnetContract)) ||
  (isAddressEqual(contractAddressA as Address, StethEthMainnetContract) &&
    isAddressEqual(contractAddressB as Address, ApeEthOmnichainContract));

export const isTokenPairStable = (
  contractAddressA: string | Address,
  contractAddressB: string | Address,
): boolean =>
  (isStableToken(contractAddressA) && isStableToken(contractAddressB)) ||
  isStethAndApeEthTokenPair(contractAddressA, contractAddressB);
