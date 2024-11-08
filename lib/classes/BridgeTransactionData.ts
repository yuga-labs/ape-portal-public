import { immerable } from 'immer';
import { currencyFormatter } from '../utils/currency.ts';

export class BridgeTransactionData {
  [immerable] = true;

  static DEFAULT_SLIPPAGE: number = 1;
  /** Amount of slippage to use when swapping between stables (stable coins). */
  static STABLE_SWAP_SLIPPAGE: number = 0.1;
  static MINIMUM_SLIPPAGE: number = 0.1;
  static MAXIMUM_SLIPPAGE: number = 50;

  applicationFee: number = 0;
  applicationFeeUsd: number = 0;
  gasFee: number = 0;
  gasFeeUsd: number = 0;
  timeWarning: string | undefined;
  priceImpactWarning: string | undefined;
  _slippagePercentage: number = 1;
  /** Stores $USD price of source chain gas token to use in Gas Fee calculations. */
  sourceChainGasTokenUsdValue: number = 0;
  emptyCurrency: string = '$0';
  estimatedTxTime: number | undefined;

  constructor() {}

  resetTransactionData() {
    this.applicationFee = 0;
    this.applicationFeeUsd = 0;
    this.gasFee = 0;
    this.gasFeeUsd = 0;
    this.timeWarning = undefined;
    this.priceImpactWarning = undefined;
  }

  resetSlippage() {
    this._slippagePercentage = BridgeTransactionData.DEFAULT_SLIPPAGE;
  }

  set setGasFeeUsd(gasFee: number) {
    this.gasFeeUsd = Number(gasFee) * this.sourceChainGasTokenUsdValue;
  }

  set setApplicationFeeUsd(applicationFee: number) {
    this.applicationFeeUsd =
      Number(applicationFee) * this.sourceChainGasTokenUsdValue;
  }

  get gasFeeUsdString(): string {
    return this.gasFee > 0
      ? currencyFormatter.format(this.gasFeeUsd)
      : this.emptyCurrency;
  }

  get applicationFeeUsdString(): string {
    return this.applicationFee > 0
      ? currencyFormatter.format(this.applicationFeeUsd)
      : this.emptyCurrency;
  }

  get totalFeeUsdString(): string {
    if (this.applicationFeeUsd + this.gasFeeUsd > 0) {
      return currencyFormatter.format(this.applicationFeeUsd + this.gasFeeUsd);
    }
    return this.emptyCurrency;
  }

  get slippagePercentage(): number {
    return this._slippagePercentage;
  }

  set slippagePercentage(value: number) {
    if (value < BridgeTransactionData.MINIMUM_SLIPPAGE) {
      throw new Error(
        `Slippage cannot be lower than ${BridgeTransactionData.MINIMUM_SLIPPAGE}%`,
      );
    }
    if (value > BridgeTransactionData.MAXIMUM_SLIPPAGE) {
      throw new Error(
        `Slippage cannot be higher than ${BridgeTransactionData.MAXIMUM_SLIPPAGE}%`,
      );
    }
    this._slippagePercentage = value;
  }

  get isSlippageHigh(): boolean {
    return this._slippagePercentage > BridgeTransactionData.DEFAULT_SLIPPAGE;
  }
}
