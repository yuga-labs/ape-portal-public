import { immerable } from 'immer';
import { TokenInfo } from '@decent.xyz/box-common';

export class TokenTransactionData {
  [immerable] = true;
  token: TokenInfo;
  amount: string;
  amountUsd: string = '';

  constructor(token: TokenInfo, amount: string = '') {
    this.token = token;
    this.amount = amount;
  }
}
