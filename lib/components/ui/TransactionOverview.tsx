import { AnimatePresence, motion } from 'framer-motion';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { usePortalStore } from '../../store/usePortalStore.ts';
import { ArrowDown } from '../icons/ArrowDown.tsx';
import { cn } from '../../utils/utils.ts';
import { TransactionWarnings } from './TransactionWarnings.tsx';
import { useApeContext } from '../../providers/ape/apeProvider.context.ts';
import { SlippageInputModule } from './SlippageInputModule.tsx';

const DetailRow = ({
  descriptor,
  information = '-',
}: {
  descriptor: string;
  information?: string;
}) => {
  return (
    <div
      className={
        'aw-flex aw-flex-row aw-items-center aw-justify-end aw-gap-x-2.5'
      }
    >
      <span className="aw-text-center aw-text-[14px] aw-font-normal aw-leading-[18px] aw-tracking-tight aw-opacity-40">
        {descriptor}
      </span>
      <span className="aw-text-center aw-text-[14px] aw-font-normal aw-leading-[18px] aw-tracking-tight aw-opacity-70">
        {information}
      </span>
    </div>
  );
};

export const TransactionOverview = () => {
  const { destinationAddress, isTopTrader } = useApeContext();
  const bridgeTransactionData = usePortalStore(
    (state) => state.bridgeTransactionData,
  );

  return (
    <Disclosure
      as={motion.div}
      layout={'position'}
      transition={{ duration: 0.5 }}
      className="aw-mb-auto aw-w-full aw-rounded-[5px] aw-border-2 aw-border-text-primary/20 aw-bg-primary aw-px-3 aw-pt-1 aw-font-dmsans aw-text-text-primary"
    >
      {({ open }) => (
        <>
          <DisclosureButton className="aw-mb-2 aw-flex aw-w-full aw-flex-col aw-items-center aw-justify-end aw-rounded aw-border-b-2 aw-border-text-primary/10 aw-text-right">
            <div
              className={
                'aw-flex aw-w-full aw-flex-row aw-items-center aw-justify-between'
              }
            >
              <span className="aw-font-dmsans aw-text-[15px] aw-font-normal aw-leading-[18px] aw-tracking-wide aw-opacity-70">
                Fees:
              </span>
              <div className={'aw-flex aw-flex-row aw-items-center'}>
                <span className="aw-max-w-[300px] aw-overflow-hidden aw-text-ellipsis aw-text-[15px] aw-font-bold aw-leading-[18px] aw-tracking-tight">
                  {bridgeTransactionData.totalFeeUsdString}
                </span>
                <ArrowDown
                  className={cn('aw-transition-transform aw-duration-500', {
                    'aw-rotate-180': open,
                  })}
                  size={35}
                />
              </div>
            </div>
          </DisclosureButton>
          <SlippageInputModule />
          <div className="aw-overflow-hidden">
            <AnimatePresence>
              {open && (
                <DisclosurePanel
                  static
                  as={motion.div}
                  initial={{ opacity: 0, y: -24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  className="aw-origin-top"
                >
                  <div
                    className={
                      'aw-flex aw-flex-col aw-gap-y-2 aw-border-t-2 aw-border-text-primary/10 aw-py-2'
                    }
                  >
                    <DetailRow
                      descriptor={'Gas Fee'}
                      information={bridgeTransactionData.gasFeeUsdString}
                    />
                    <DetailRow
                      descriptor={'Application Fee'}
                      information={
                        bridgeTransactionData.applicationFeeUsdString
                      }
                    />
                  </div>
                </DisclosurePanel>
              )}
            </AnimatePresence>
          </div>
          <TransactionWarnings
            destinationAddress={destinationAddress}
            bridgeTransactionData={bridgeTransactionData}
            isTopTrader={isTopTrader}
            className={open ? 'aw-mt-2' : undefined}
          />
        </>
      )}
    </Disclosure>
  );
};
