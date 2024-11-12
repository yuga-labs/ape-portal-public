import { getChainLogoOrFail, getChainName } from '@decent.xyz/box-common';
import { usePortalStore } from '../../store/usePortalStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../../utils/utils.ts';
import { motion } from 'framer-motion';

/**
 * Used ONLY in the Swap tab to visually show the selected chain.
 * @constructor
 */
export const ChainSelectorModule = ({ className }: { className?: string }) => {
  const { sourceToken } = usePortalStore(
    useShallow((state) => ({
      sourceToken: state.sourceToken,
    })),
  );

  return (
    <motion.div
      initial={{ y: -10 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={'aw-flex aw-w-full aw-items-center aw-justify-center'}
    >
      <div
        className={cn(
          'aw-inline-flex aw-h-[35px] aw-items-center aw-justify-center aw-gap-2.5 aw-rounded-[55px] aw-bg-[#1652ca] aw-px-3 aw-py-[5px] aw-duration-500 aw-animate-in aw-slide-in-from-bottom',
          className,
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
      </div>
    </motion.div>
  );
};
