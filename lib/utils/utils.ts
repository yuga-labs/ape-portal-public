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

export const ApeCoinMainnetArbitrumContract =
  '0x7f9FBf9bDd3F4105C478b996B648FE6e828a1e98';
