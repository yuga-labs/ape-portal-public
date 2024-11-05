import { PencilIcon } from '../icons/PencilIcon.tsx';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { usePortalStore } from '../../store/usePortalStore.ts';
import { useState } from 'react';
import { cn } from '../../utils/utils.ts';
import { BridgeTransactionData } from '../../classes/BridgeTransactionData.ts';
import { WarningIcon } from '../icons/WarningIcon.tsx';
import { HIGH_SLIPPAGE_WARNING } from './TransactionWarnings.tsx';
import { DecimalInput } from './input/DecimalInput.tsx';

export const SlippageInputModule = () => {
  const { bridgeTransactionData, setSlippagePercentage } = usePortalStore(
    (state) => state,
  );
  const [customSlippageEnabled, setCustomSlippageEnabled] =
    useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string | number>(
    bridgeTransactionData.slippagePercentage,
  );
  const [error, setError] = useState<string | undefined>();

  const handlePercentChange = (rawValue: string) => {
    setError(undefined);
    // Clamp maximum and minimum values
    const value = Math.min(
      Number.parseFloat(rawValue),
      BridgeTransactionData.MAXIMUM_SLIPPAGE,
    );
    if (Number.isNaN(value)) {
      setInputValue('');
      return;
    }
    if (value < BridgeTransactionData.MINIMUM_SLIPPAGE) {
      setError(
        `Slippage must be at least ${BridgeTransactionData.MINIMUM_SLIPPAGE}%`,
      );
    }
    if (rawValue.endsWith('.')) {
      setInputValue(rawValue);
    } else {
      setInputValue(value);
    }
  };

  const handleApplyChanges = (onSuccess: () => void) => {
    setError(undefined);
    const inputAsNumber = Number.parseFloat(inputValue.toString());
    try {
      const updatedValue = Number.isNaN(inputAsNumber)
        ? BridgeTransactionData.DEFAULT_SLIPPAGE
        : inputAsNumber;
      setSlippagePercentage(updatedValue);
      setInputValue(updatedValue);
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  const errorOrHighSlippage =
    error ||
    (Number.parseFloat(inputValue.toString()) >
      BridgeTransactionData.DEFAULT_SLIPPAGE &&
      HIGH_SLIPPAGE_WARNING);

  return (
    <div
      className={
        'aw-mb-2 aw-flex aw-flex-row aw-items-center aw-justify-between'
      }
    >
      <div className="aw-font-dmsans aw-text-[15px] aw-leading-[18px] aw-tracking-wide aw-text-white aw-opacity-70">
        Max slippage:
      </div>
      <Popover className="aw-relative">
        <PopoverButton>
          <div
            className={cn(
              'aw-transition-colors aw-flex aw-flex-row aw-items-center aw-justify-end aw-gap-[3px] aw-gap-x-2 aw-rounded-[5px] aw-bg-apeDarkBlue/25 aw-py-0.5 aw-pl-4 aw-pr-1',
              {
                'aw-bg-warning/25': bridgeTransactionData.isSlippageHigh,
              },
            )}
          >
            <div
              className={cn(
                'aw-text-center aw-font-dmsans aw-text-[14px] aw-tracking-wide aw-text-white',
                {
                  'aw-text-warning aw-font-bold':
                    bridgeTransactionData.isSlippageHigh,
                },
              )}
            >
              {bridgeTransactionData.slippagePercentage}%{' '}
              {bridgeTransactionData.slippagePercentage ===
                BridgeTransactionData.DEFAULT_SLIPPAGE && 'Auto'}
            </div>
            <div className="aw-flex aw-items-center aw-justify-start aw-gap-2.5 aw-rounded-[60px] aw-bg-[#002775] aw-p-1.5">
              <PencilIcon className="aw-size-3 aw-text-white" />
            </div>
          </div>
        </PopoverButton>
        <PopoverPanel
          anchor={`top end`}
          className="aw-z-100 aw-flex aw-flex-col"
        >
          {({ close }) => (
            <div className="aw-inline-flex aw-min-h-[164px] aw-w-[320px] aw-flex-col aw-items-start aw-justify-center aw-gap-3 aw-rounded-[10px] aw-border aw-border-white/20 aw-bg-[#002775] aw-px-5 aw-py-[17px]">
              <div className="aw-inline-flex aw-items-start aw-justify-between aw-self-stretch">
                <div className="aw-text-center aw-font-dmsans aw-text-sm aw-font-bold aw-leading-[18px] aw-text-white">
                  Max slippage
                </div>
                <div className="aw-text-right aw-font-dmsans aw-text-sm aw-font-bold aw-leading-[18px] aw-text-white">
                  {customSlippageEnabled ? 'Custom' : 'Auto'}
                </div>
              </div>
              <div className="aw-inline-flex aw-items-center aw-justify-start aw-gap-2.5 aw-self-stretch aw-border-b aw-border-white/25 aw-pb-4">
                <div className="aw-flex aw-h-9 aw-shrink aw-grow aw-basis-0 aw-items-center aw-justify-center aw-rounded aw-border aw-border-white/20 aw-bg-[#002d86] aw-p-[3px]">
                  <button
                    onClick={() => {
                      setError(undefined);
                      setCustomSlippageEnabled(false);
                      setInputValue(BridgeTransactionData.DEFAULT_SLIPPAGE);
                    }}
                    className={cn(
                      'aw-flex aw-items-center aw-justify-center aw-gap-2.5 aw-rounded aw-px-2.5 aw-py-1.5',
                      {
                        'aw-bg-[#0054fa]': !customSlippageEnabled,
                      },
                    )}
                  >
                    <div className="aw-text-center aw-font-dmsans aw-text-[13px] aw-font-bold aw-leading-[18px] aw-text-white">
                      Auto
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setCustomSlippageEnabled(true);
                    }}
                    className={cn(
                      'aw-flex aw-items-center aw-justify-center aw-gap-2.5 aw-rounded aw-px-2.5 aw-py-1.5',
                      {
                        'aw-bg-[#0054fa]': customSlippageEnabled,
                      },
                    )}
                  >
                    <div className="aw-text-center aw-font-dmsans aw-text-[13px] aw-font-bold aw-leading-[18px] aw-text-white">
                      Custom
                    </div>
                  </button>
                </div>
                <div
                  className={cn(
                    'aw-flex aw-w-full aw-flex-row aw-gap-x-2 aw-self-stretch aw-text-ellipsis aw-rounded aw-border aw-border-white/20 aw-bg-[#002d86] aw-p-2 aw-text-right aw-font-dmsans  aw-text-sm aw-font-medium aw-text-[#4e89ff]',
                    { 'aw-text-white': customSlippageEnabled },
                  )}
                >
                  <DecimalInput
                    value={String(inputValue)}
                    onChangeSanitized={handlePercentChange}
                    disabled={!customSlippageEnabled}
                    placeholder={'Amount'}
                    className={cn(
                      'aw-w-full aw-self-stretch aw-text-ellipsis aw-bg-transparent aw-text-right  [appearance:aw-textfield] focus:aw-border-indigo-500 focus:aw-outline-none focus:aw-ring-indigo-500 disabled:aw-opacity-50 [&::-webkit-inner-spin-button]:aw-appearance-none [&::-webkit-outer-spin-button]:aw-appearance-none',
                      {
                        'aw-cursor-not-allowed': !customSlippageEnabled,
                      },
                    )}
                  />
                  <span>%</span>
                </div>
              </div>
              {errorOrHighSlippage && (
                <div className="aw-flex aw-flex-row aw-items-center">
                  <WarningIcon className="aw-mr-2 aw-size-6 aw-shrink-0" />
                  <div className="aw-text-left aw-font-dmsans aw-text-[13px] aw-leading-[18px] aw-text-warning">
                    {errorOrHighSlippage}
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  handleApplyChanges(close);
                }}
                className="aw-inline-flex aw-items-center aw-justify-center aw-gap-2.5 aw-self-stretch aw-rounded aw-bg-[#0054fa] aw-px-2.5 aw-py-[9px] aw-text-center aw-font-dmsans aw-text-[13px] aw-font-bold aw-leading-[18px] aw-text-white aw-transition-colors aw-duration-200 hover:aw-bg-[#053389]"
              >
                Apply changes
              </button>
            </div>
          )}
        </PopoverPanel>
      </Popover>
    </div>
  );
};
