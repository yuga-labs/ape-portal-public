import { motion } from 'framer-motion';
import { BaseButton } from './buttons/BaseButton.tsx';
import { useEffect, useState } from 'react';
import { handler } from 'tailwindcss-animate';
import { useApeContext } from '../../providers/ape/apeProvider.context.ts';

export const SolanaModule = () => {
  const { solanaRedirectUrl } = useApeContext();
  const [count, setCount] = useState(3);
  useEffect(() => {
    if (count === 0) {
      if (solanaRedirectUrl) {
        window.location.href = solanaRedirectUrl;
      }
      return;
    }

    const intervalId = setInterval(() => {
      setCount((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [count, solanaRedirectUrl]);

  return (
    <motion.div
      key={'solana'}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout={'position'}
      className="aw-inline-flex aw-w-full aw-flex-col aw-items-start aw-justify-start aw-gap-2.5 aw-rounded aw-border aw-border-white/20 aw-bg-apeCtaBlue/50 aw-px-3 aw-pt-2 md:aw-px-5 md:aw-pt-5"
    >
      <p
        className={
          'aw-font-dmsans aw-font-medium aw-leading-normal aw-tracking-wide'
        }
      >
        2. Redirecting to Solana Bridge
      </p>
      <div
        className={
          'aw-flex aw-w-full aw-flex-col aw-items-center aw-justify-center aw-gap-y-3 aw-py-3'
        }
      >
        <BaseButton
          onClick={handler}
          className={'aw-bg-gradient-lavender-coral-sunset'}
        >
          <div
            className={
              'aw-relative aw-inline-flex aw-size-full aw-w-full aw-items-center aw-justify-center aw-overflow-hidden aw-rounded-[5px] aw-bg-apeCtaBlue aw-text-center aw-font-dmmono aw-text-[16px] aw-font-medium aw-text-white md:aw-text-[18px]'
            }
          >
            Redirecting {count}
          </div>
        </BaseButton>
      </div>
    </motion.div>
  );
};
