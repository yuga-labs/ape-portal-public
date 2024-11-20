import { InputType } from './utils/constants.ts';
import { Address } from 'viem';

/** Response from useDecentScan (api.decentscan.xyz/getStatus)  */
export type DecentBridgeStatus = {
  status?: 'Initiated' | 'Processing' | 'Executed' | 'Failed';
  tx?: {
    statusMessage?: 'success' | 'pending' | 'refunded' | 'failed';
    dstTx?: {
      success: boolean;
    };
    srcTx?: {
      blockExplorer: string;
      blockNumber: number;
      chainId: number;
      success: boolean;
    };
  };
};

export type BridgeError =
  | 'INSUFFICIENT_FUNDS'
  | 'INSUFFICIENT_FUNDS_FOR_FEES'
  | 'WRONG_NETWORK'
  | 'UNKNOWN_ERROR';
export type BridgeErrorDescriptions = {
  [key in BridgeError]: string;
};
export const humanReadableBridgeError: BridgeErrorDescriptions = {
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  INSUFFICIENT_FUNDS_FOR_FEES: 'Insufficient funds for fees',
  UNKNOWN_ERROR: 'Something went wrong',
  WRONG_NETWORK: 'Bad from or to chains',
};

export interface DefaultTokenAmount {
  type: InputType;
  /** Human readable amount (i.e. "1.0") - not wei */
  amount: string;
}

export interface DefaultTokenInfo {
  chainId: number;
  address: Address;
}

export interface TokenConfig {
  /** Default source token **/
  defaultSourceToken?: DefaultTokenInfo;
  /** Default destination token**/
  defaultDestinationToken?: DefaultTokenInfo;
  /** Default token amount. Amount should be human-readable i.e. "1.0", and not in wei **/
  defaultTokenAmount?: DefaultTokenAmount;
  /** If true, the user will not be able to change the destination token. */
  lockDestinationToken?: boolean;
}

export enum BridgeState {
  WAITING_FOR_SIGNATURE = 'Check Your Wallet',
  PROCESSING = 'Processing Transaction',
  COMPLETED = 'Transaction Completed',
  FAILED = 'Transaction Failed',
}
