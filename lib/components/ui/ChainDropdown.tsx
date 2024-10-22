import { ChainId } from '@decent.xyz/box-common';
import { useMemo } from 'react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChainPillButton } from './buttons/ChainPillButton.tsx';
import { ArrowDown } from '../icons/ArrowDown.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/utils.ts';
import { usePortalStore } from '../../store/usePortalStore.ts';

/**
 * A list of chains as pill type buttons that can be selected.
 * @param chains
 * @param setSelectorChain
 * @param selectorChain
 * @param condensed
 * If not condensed, it will show all chains.
 * Condensed shows first 5 chains, rest will be hidden behind a dropdown.
 * @constructor
 */
export const ChainDropdown = ({
  chains,
  setSelectorChain,
  selectorChain,
  condensed = true,
}: {
  chains: ChainId[];
  setSelectorChain: (chain: ChainId) => void;
  selectorChain: ChainId;
  condensed?: boolean;
}) => {
  const { setHasUserUpdatedTokens } = usePortalStore((state) => ({
    setHasUserUpdatedTokens: state.setHasUserUpdatedTokens,
  }));
  const firstFiveChains: ChainId[] = useMemo(
    () => chains.slice(0, 5),
    [chains],
  );
  const restOfChains: ChainId[] = useMemo(() => chains.slice(5), [chains]);
  const hasMoreChains = restOfChains.length > 0;
  const defaultOpen =
    condensed && hasMoreChains && restOfChains.includes(selectorChain);

  return (
    <Disclosure
      as="div"
      className={'aw-flex aw-flex-row aw-flex-wrap aw-gap-2'}
      defaultOpen={defaultOpen}
    >
      {({ open }) => (
        <>
          <div className={'aw-flex aw-flex-row aw-flex-wrap aw-gap-2'}>
            {(condensed ? firstFiveChains : chains).map((chain) => {
              return (
                <ChainPillButton
                  key={chain}
                  chain={chain}
                  setSelectorChain={setSelectorChain}
                  selectorChain={selectorChain}
                />
              );
            })}
            {hasMoreChains && condensed && (
              <DisclosureButton
                className={
                  'aw-flex aw-h-[40px] aw-items-center aw-justify-center aw-gap-2 aw-rounded-[55px] aw-border aw-border-white/20 aw-bg-transparent aw-py-1 aw-pl-3 aw-pr-2 aw-font-dmsans aw-font-medium aw-capitalize'
                }
              >
                {open ? <>- Close</> : <>+ {restOfChains.length} More</>}
                <ArrowDown
                  className={cn('aw-transition-transform aw-duration-500', {
                    'aw-rotate-180': open,
                  })}
                  size={30}
                />
              </DisclosureButton>
            )}
          </div>
          <div className="aw-overflow-hidden">
            <AnimatePresence>
              {open && (
                <DisclosurePanel
                  static
                  as={motion.div}
                  initial={{ opacity: 0, y: -24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  className={'aw-flex aw-flex-row aw-flex-wrap aw-gap-2'}
                >
                  {restOfChains.map((chain) => {
                    return (
                      <ChainPillButton
                        key={chain}
                        chain={chain}
                        setSelectorChain={(chain) => {
                          setHasUserUpdatedTokens();
                          setSelectorChain(chain);
                        }}
                        selectorChain={selectorChain}
                      />
                    );
                  })}
                </DisclosurePanel>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </Disclosure>
  );
};
