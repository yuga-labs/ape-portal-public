import React, { useState } from 'react';
import { cn } from '../../utils/utils.ts';
import apeOutline from '../../assets/svg/ape-logo-outline.svg';

export const SpotlightBackground = ({
  children,
  isSwap,
  showBranding,
}: {
  children: React.ReactNode;
  isSwap: boolean;
  showBranding?: boolean;
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <>
      <div
        onMouseMove={handleMouseMove}
        style={{
          background: `
          linear-gradient(to top, rgb(2, 70, 205, 1) 0%, transparent 100px),
          radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, transparent 50px, rgb(2, 70, 205, 1) 200px)`,
          transition: 'background 0.4s ease-out',
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
      </div>
    </>
  );
};
