import { useEffect } from 'react';
import Granim from 'granim';
import { cn, createGranimConfig } from '../../utils/utils.ts';
import { ModalPortal } from './modal/ModalPortal.tsx';
import apePortalLogo from '../../assets/svg/ape-portal-logo.svg';
import { GradientCanvas } from './GradientCanvas.tsx';

export type ApeContainerProps = {
  children: React.ReactNode;
  wrapChildren: boolean;
  className?: string;
  showGradient?: boolean;
};

export const ApeContainer = ({
  children,
  wrapChildren = false,
  className,
  showGradient = true,
}: ApeContainerProps) => {
  useEffect(() => {
    if (!showGradient) return;
    new Granim(createGranimConfig('#aw-ape-container-bg'));
  }, [showGradient]);

  if (!wrapChildren)
    return (
      <div
        className={cn(
          'aw-relative aw-z-50 aw-flex aw-size-full aw-min-h-[470px] aw-flex-col aw-justify-center aw-text-clip',
          className,
        )}
      >
        {showGradient && (
          <canvas
            id={'aw-ape-container-bg'}
            className={'aw-absolute aw-size-full aw-rounded-[10px]'}
          />
        )}
        {children}
      </div>
    );

  return (
    <div className={cn('aw-overflow-y-visible', className)}>
      <div className="aw-relative aw-z-50 aw-flex aw-w-[95vw] aw-max-w-[500px] aw-flex-col aw-items-center aw-justify-center aw-text-clip aw-rounded-[10px] aw-p-1 md:aw-w-[550px]">
        {showGradient && <GradientCanvas id={'aw-ape-container-bg'} />}
        <img
          src={apePortalLogo}
          alt={'Ape Portal'}
          className="aw-relative aw-z-40 aw-h-[88px] aw-w-full aw-rounded-t-[5px] aw-bg-ape-portal-logo aw-py-4"
        />
        <ModalPortal />
        <div
          className={
            'aw-relative aw-z-50 aw-flex aw-size-full aw-min-h-[470px] aw-flex-col aw-justify-center aw-text-clip aw-rounded-[5px]'
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
};
