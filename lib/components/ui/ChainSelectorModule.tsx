import { ChainDropdown } from './ChainDropdown.tsx';
import {
  ChainId,
  getChainLogoOrFail,
  getChainName,
  getNativeTokenInfo,
} from '@decent.xyz/box-common';
import {
  defaultSwapDestinationToken,
  defaultSwapSourceToken,
  usePortalStore,
} from '../../store/usePortalStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useChainConfig } from '../../hooks/useChainConfig.ts';
import { ArrowDown } from '../icons/ArrowDown.tsx';
import { ModalWrapper } from './modal/ModalWrapper.tsx';
import { cn } from '../../utils/utils.ts';
import { motion } from 'framer-motion';
import { ChainPillButton } from './buttons/ChainPillButton.tsx';
import { useCallback, useMemo } from 'react';
import {
  getChainNextToken,
  NO_TOKENS_FOUND_ERROR,
} from '../../utils/getNextToken.ts';
import { useErrorStore } from '../../store/useErrorStore.ts';

const headerTextClasses =
  'aw-chain-select-title aw-font-dmsans aw-font-medium aw-uppercase aw-leading-normal aw-tracking-wide';

/**
 * Used ONLY in the Swap tab to allow the user to select the chain they want to
 * interact with without selecting a token.
 * @constructor
 */
export const ChainSelectorModule = ({
  loading,
  className,
  disabled,
}: {
  loading: boolean;
  className?: string;
  disabled?: boolean;
}) => {
  const {
    sourceToken,
    setSourceToken,
    setDestinationToken,
    setHasUserUpdatedTokens,
  } = usePortalStore(
    useShallow((state) => ({
      sourceToken: state.sourceToken,
      setSourceToken: state.setSourceToken,
      setDestinationToken: state.setDestinationToken,
      setHasUserUpdatedTokens: state.setHasUserUpdatedTokens,
    })),
  );
  const { setError } = useErrorStore((state) => ({
    setError: state.setError,
  }));
  const { chains } = useChainConfig();

  const [popularChains, otherChains] = useMemo(() => {
    return chains.length <= 3
      ? [[], chains]
      : [chains.slice(0, 3), chains.slice(3)];
  }, [chains]);

  const hasPopularChains = popularChains.length > 0;
  const setSelectorChain = useCallback(
    (chainId: ChainId, setModalOpen: (open: boolean) => void) => {
      const handleTokenError = () => {
        setError(NO_TOKENS_FOUND_ERROR);
        setSourceToken(defaultSwapSourceToken);
        setDestinationToken(defaultSwapDestinationToken);
      };

      const newSourceToken = getNativeTokenInfo(chainId);
      if (newSourceToken) {
        const chainNextToken = getChainNextToken({
          chainId: newSourceToken.chainId,
          address: newSourceToken.address,
        });
        if (chainNextToken) {
          setSourceToken(newSourceToken);
          setDestinationToken(chainNextToken);
          setHasUserUpdatedTokens();
        } else {
          handleTokenError();
        }
      } else {
        handleTokenError();
      }
      setModalOpen(false);
    },
    [setDestinationToken, setError, setHasUserUpdatedTokens, setSourceToken],
  );

  return (
    <motion.div
      initial={{ y: -10 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={'aw-flex aw-w-full aw-items-center aw-justify-center'}
    >
      <ModalWrapper
        title="Select Network"
        renderContent={({ setModalOpen }) => (
          <div className="aw-flex aw-size-full aw-flex-col aw-items-center aw-justify-center aw-gap-y-3 aw-overflow-auto aw-p-4 aw-scrollbar aw-scrollbar-track-black/70 aw-scrollbar-thumb-blue-700/80">
            <div className="aw-inline-flex aw-size-full aw-flex-col aw-items-start aw-justify-start aw-gap-2.5 aw-rounded aw-border aw-border-white/20 aw-bg-apeCtaBlue/50 aw-p-5">
              <p
                className={
                  'aw-mb-2 aw-font-dmsans aw-font-medium aw-leading-normal aw-tracking-wide'
                }
              >
                Select Network
              </p>
              {hasPopularChains && (
                <>
                  <p className={headerTextClasses}>Popular Networks:</p>
                  <div
                    className={
                      'aw-mb-3 aw-flex aw-flex-row aw-flex-wrap aw-gap-2'
                    }
                  >
                    {popularChains.map((chain) => {
                      return (
                        <ChainPillButton
                          key={chain}
                          chain={chain}
                          setSelectorChain={(chainId: ChainId) => {
                            setSelectorChain(chainId, setModalOpen);
                          }}
                          selectorChain={sourceToken.token.chainId}
                        />
                      );
                    })}
                  </div>
                </>
              )}
              {hasPopularChains && (
                <p className={headerTextClasses}>All Networks:</p>
              )}
              <ChainDropdown
                setSelectorChain={(chainId: ChainId) => {
                  setSelectorChain(chainId, setModalOpen);
                }}
                selectorChain={sourceToken.token.chainId}
                chains={otherChains}
                condensed={false}
              />
            </div>
          </div>
        )}
        disabled={loading || disabled}
      >
        <div
          className={cn(
            'aw-inline-flex aw-h-[35px] aw-items-center aw-justify-center aw-gap-2.5 aw-rounded-[55px] aw-bg-[#1652ca] aw-px-3 aw-py-[5px] aw-duration-500 aw-animate-in aw-slide-in-from-bottom',
            className,
            {
              'aw-cursor-not-allowed': disabled,
            },
          )}
        >
          <img
            alt={`${sourceToken.token.chainId} logo`}
            src={getChainLogoOrFail(sourceToken.token.chainId)}
            className="aw-flex aw-size-6 aw-items-center aw-justify-center aw-rounded-[49.84px]"
          />
          <div className="aw-text-center aw-font-dmmono aw-text-xs aw-font-medium aw-uppercase aw-leading-normal aw-tracking-wide aw-text-[#c9dbff]">
            {getChainName(sourceToken.token.chainId)}
          </div>
          <ArrowDown size={20} />
        </div>
      </ModalWrapper>
    </motion.div>
  );
};
