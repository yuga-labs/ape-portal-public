import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import { PortalType } from '../../../utils/constants.ts';
import { cn } from '../../../utils/utils.ts';
import { useIsTransactionProcessing } from '../../../store/useIsTransactionProcessing.ts';
import { useIsErrorSet } from '../../../store/useIsErrorSet.ts';
import { useApeContext } from '../../../providers/ape/apeProvider.context.ts';

export const SelectedTabClass =
  'aw-bg-tab-button-selected disabled:aw-cursor-auto aw-shadow-tab-button-selected';
export const UnselectedTabClass =
  'aw-bg-ape-blue-700 aw-opacity-90 aw-shadow-tab-button';

export const TabButton = ({
  portalType,
  selectedPortalType,
  setPortalTabState,
  testId,
}: {
  portalType: PortalType;
  selectedPortalType: PortalType;
  setPortalTabState: (portalType: PortalType) => void;
  testId: string;
}) => {
  const { enableOnramp } = useApeContext();
  const selected = portalType === selectedPortalType;
  const isErrorSet = useIsErrorSet();
  const isProcessing = useIsTransactionProcessing();
  const disabled = isProcessing || isErrorSet;

  if (portalType === PortalType.OnRamp && !enableOnramp) {
    return;
  }
  return (
    <Tab disabled={disabled} as={Fragment} data-testid={testId}>
      <button
        onClick={() => {
          setPortalTabState(portalType);
        }}
        disabled={disabled}
        className={cn(
          'aw-h-14 aw-rounded-[2px] aw-bg-gray-400/30  disabled:aw-opacity-80 aw-leading-[14px] aw-tracking-[1.4px] aw-font-dmmono aw-uppercase aw-font-medium aw-relative aw-flex aw-flex-1 aw-items-center aw-justify-center aw-text-white aw-text-[14px] disabled:aw-cursor-not-allowed aw-z-20 hover:enabled:aw-underline focus:aw-outline-none',
          selected && SelectedTabClass,
          !selected && UnselectedTabClass,
        )}
      >
        {portalType}
      </button>
    </Tab>
  );
};
