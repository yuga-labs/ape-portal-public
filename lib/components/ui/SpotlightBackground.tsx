import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/utils.ts';
import {
  motion,
  MotionValue,
  useMotionTemplate,
  useSpring,
} from 'framer-motion';
import { ApeOutline } from '../icons/ApeOutline.tsx';
import { useApeContext } from '../../providers/ape/apeProvider.context.ts';

export const SpotlightBackground = ({
  children,
  isSwap,
  showBranding,
}: {
  children: React.ReactNode;
  isSwap: boolean;
  showBranding?: boolean;
}) => {
  const mousePosX = useSpring(0);
  const mousePosY = useSpring(0);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const spotlightDivRef = useRef(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePosX.set(e.clientX - rect.left);
    mousePosY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = useCallback(() => {
    mousePosX.set(center.x);
    mousePosY.set(center.y);
  }, [center.x, center.y, mousePosX, mousePosY]);

  useEffect(() => {
    const updateCenter = () => {
      if (spotlightDivRef.current) {
        const { offsetLeft, offsetTop, clientWidth, clientHeight } =
          spotlightDivRef.current;
        const centerX = offsetLeft + clientWidth / 2;
        const centerY = offsetTop + clientHeight / 2;
        setCenter({ x: centerX, y: centerY });
        mousePosX.set(centerX);
        mousePosY.set(centerY);
      }
    };

    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
    // We want to run this effect only once to set the center
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const themeToMotionTemplate: {
    [key: string]: MotionValue<string>;
  } = {
    ape: useMotionTemplate`linear-gradient(to top, rgb(2, 70, 205, 1) 0%, transparent 100px), radial-gradient(circle at ${mousePosX}px ${mousePosY}px, transparent 50px, rgb(2, 70, 205, 1) 350px)`,
    light: useMotionTemplate`linear-gradient(to top, rgb(240, 240, 240, 1) 0%, transparent 100px), radial-gradient(circle at ${mousePosX}px ${mousePosY}px, transparent 50px, rgb(240, 240, 240, 1) 350px)`,
    dark: useMotionTemplate`linear-gradient(to top, rgb(38, 38, 38, 1) 0%, transparent 100px), radial-gradient(circle at ${mousePosX}px ${mousePosY}px, transparent 50px, rgb(38, 38, 38, 1) 350px)`,
  };

  const background = themeToMotionTemplate[useApeContext().theme ?? 'ape'];
  return (
    <motion.div
      ref={spotlightDivRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ background }}
      transition={{
        background: { duration: 0.25, ease: 'easeOut' },
      }}
      className={cn('aw-relative aw-z-40 aw-flex aw-overflow-hidden', {
        'aw-pt-0': !showBranding && isSwap,
        'aw-pt-6': !showBranding && !isSwap,
        'aw-rounded-b-[5px]': showBranding,
      })}
    >
      <ApeOutline
        className={cn(
          'aw-absolute aw-object-fill aw-stroke-primary aw-border-2 md:aw-top-[50%] aw-top-[45%] md:aw-left-[55%] aw-left-[65%] aw--translate-x-1/2 aw--translate-y-1/2',
          showBranding ? 'md:aw-size-[200%] aw-size-[250%]' : 'aw-size-[200%]',
        )}
      />
      <div
        className={cn(
          'aw-z-60 aw-flex aw-flex-1 aw-flex-col aw-px-2 aw-pb-2 aw-transition-all md:aw-px-6 aw-w-[90vw] md:aw-w-full',
          {
            'aw-pt-3': showBranding && isSwap,
            'aw-pt-6': showBranding && !isSwap,
          },
        )}
      >
        {children}
      </div>
    </motion.div>
  );
};
