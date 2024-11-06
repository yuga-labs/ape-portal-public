import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/utils.ts';
import apeOutline from '../../assets/svg/ape-logo-outline.svg';
import { motion, useMotionTemplate, useSpring } from 'framer-motion';

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

  const background = useMotionTemplate`linear-gradient(to top, rgb(2, 70, 205, 1) 0%, transparent 100px), radial-gradient(circle at ${mousePosX}px ${mousePosY}px, transparent 50px, rgb(2, 70, 205, 1) 350px)`;

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
      <img
        className={cn(
          'aw-absolute aw-top-[-45%] aw-object-cover',
          showBranding ? 'aw-size-[150%]' : 'aw-size-[200%]',
        )}
        src={apeOutline}
        alt={'Background Ape'}
      />
      <div
        className={cn(
          'aw-z-60 aw-flex aw-flex-1 aw-flex-col aw-px-2 aw-pb-2 aw-transition-all md:aw-px-6',
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
