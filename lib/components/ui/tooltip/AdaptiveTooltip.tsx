import { MouseEventHandler, useEffect, useState } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { ReactNode } from 'react';
import { cn } from '../../../utils/utils';
import { useModalStore } from '../../../store/useModalStore';

interface AdaptiveTooltipProps {
  children: ReactNode;
  content: ReactNode;
  delayDuration?: number;
  className?: string;
}

const AdaptiveTooltip = ({
  children,
  content,
  delayDuration = 200,
  className,
  ...props
}: AdaptiveTooltipProps) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { modalContainer } = useModalStore((state) => ({
    modalContainer: state.modalContainer,
  }));

  useEffect(() => {
    // Check if device supports touch
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);

    // Add click-away listener for mobile
    if (isTouch) {
      const handleClickAway = (e: MouseEvent) => {
        // Check if the click was outside the tooltip and its trigger
        if (
          isOpen &&
          !(e.target as Element)?.closest('[data-tooltip-trigger]')
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('click', handleClickAway);
      return () => document.removeEventListener('click', handleClickAway);
    }
  }, [isOpen]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (isTouchDevice) {
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root
        delayDuration={delayDuration}
        open={isTouchDevice ? isOpen : undefined}
      >
        <TooltipPrimitive.Trigger
          onClick={handleClick}
          data-tooltip-trigger
          className="aw-touch-manipulation"
        >
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal container={modalContainer}>
          <TooltipPrimitive.Content
            side="top"
            align="center"
            collisionBoundary={modalContainer}
            collisionPadding={10}
            avoidCollisions
            sideOffset={5}
            className={cn(
              'aw-z-100 aw-w-[275px] aw-max-w-[90vw] aw-animate-fade-in aw-flex-col aw-items-start aw-justify-center aw-gap-3 aw-rounded-[10px] aw-border aw-border-white/20 aw-bg-[#002775] aw-px-5 aw-py-[17px]',
              className,
            )}
            onPointerDownOutside={
              isTouchDevice ? (e) => e.preventDefault() : undefined
            }
            {...props}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default AdaptiveTooltip;
