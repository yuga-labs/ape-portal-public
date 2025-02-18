import { forwardRef, JSX } from 'react';
import { cn } from '../../../utils/utils';

export type BaseButtonProps = JSX.IntrinsicElements['button'] & {
  children: React.ReactNode;
  className?: string;
};

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'aw-min-h-[62px] aw-text-sm aw-leading-[14px] aw-w-full aw-flex aw-items-center aw-justify-center aw-rounded-[5px] aw-p-0.5 enabled:hover:aw-p-[0.1875rem] aw-transition-all aw-duration-300 aw-ease-in-out enabled:hover:aw-duration-100 disabled:aw-cursor-not-allowed disabled:aw-p-0 disabled:aw-opacity-70 aw-font-dmmono aw-uppercase aw-bg-accent aw-text-text-primary aw-tracking-[1.6px]',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
