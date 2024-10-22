import { useMemo } from 'react';
import { isAddress } from 'viem';
import { cn, shortenAddress } from '../../utils/utils';
import { BridgeTransactionData } from '../../classes/BridgeTransactionData';

export const HIGH_SLIPPAGE_WARNING =
  'Slippage higher than 1% may be frontrun and result in unfavorable prices.';
const PriceImpactRegex = new RegExp(
  'try sending smaller amounts to reduce price impact.',
  'i',
);

export type TransactionWarningsProps = {
  bridgeTransactionData: BridgeTransactionData;
  destinationAddress?: string | undefined;
  isTopTrader?: boolean;
  className?: string;
};

export const TransactionWarnings = ({
  bridgeTransactionData,
  destinationAddress,
  isTopTrader,
  className,
}: TransactionWarningsProps) => {
  const fundsReceiverWarning = useMemo(() => {
    if (destinationAddress && isAddress(destinationAddress)) {
      return isTopTrader
        ? `Funds will arrive in your Top Trader wallet and will be ready for you to enter Top Trader Tournaments`
        : `Funds will be sent to a different wallet address! ${shortenAddress(destinationAddress)}`;
    }
  }, [destinationAddress, isTopTrader]);

  const warnings = useMemo(() => {
    const warnings = [
      ...(bridgeTransactionData?.priceImpactWarning
        ? [bridgeTransactionData.priceImpactWarning]
        : []),
      ...(bridgeTransactionData?.timeWarning
        ? [bridgeTransactionData.timeWarning]
        : []),
      ...(bridgeTransactionData?.isSlippageHigh ? [HIGH_SLIPPAGE_WARNING] : []),
      ...(fundsReceiverWarning ? [fundsReceiverWarning] : []),
    ];
    return warnings;
  }, [bridgeTransactionData, fundsReceiverWarning]);
  const isMoreThanOneWarning = warnings.length > 1;
  const isTopTraderWarning = warnings.some((w) => w.includes('Top Trader'));
  const showWarningLabel = isMoreThanOneWarning || !isTopTraderWarning;

  if (warnings.length === 0) {
    return;
  }

  const singlePriceImpactWarning =
    bridgeTransactionData?.priceImpactWarning && !isMoreThanOneWarning;

  return (
    <div
      className={cn(
        'aw-flex aw-flex-col aw-text-left aw-w-full aw-justify-between aw-border-t aw-border-white/10 aw-py-2 aw-text-[14px] aw-leading-[14px] aw-tracking-[0.12px] aw-gap-y-2',
        className,
        bridgeTransactionData?.priceImpactWarning
          ? 'aw-text-danger'
          : 'aw-text-warning',
      )}
      id={isTopTraderWarning ? 'aw-top-trader-warning' : ''}
    >
      {showWarningLabel && (
        <span className="aw-mr-1.5 aw-font-bold">Warning:</span>
      )}
      {isMoreThanOneWarning ? (
        <ul className="aw-ml-4 aw-list-disc aw-space-y-2 aw-leading-[18px]">
          {warnings.map((warning) => {
            const priceImpactWarning = PriceImpactRegex.test(warning);
            return (
              <li
                className={cn({
                  'aw-text-danger': priceImpactWarning,
                  'aw-text-warning': !priceImpactWarning,
                })}
                key={warning}
              >
                {warning}
              </li>
            );
          })}
        </ul>
      ) : (
        <span
          className={cn({
            'aw-text-danger': singlePriceImpactWarning,
          })}
        >
          {warnings[0]}
        </span>
      )}
    </div>
  );
};
