import { BaseButton } from './BaseButton.tsx';

export const LaunchHallidayButton = ({ handler }: { handler: () => void }) => {
  return (
    <BaseButton
      onClick={handler}
      className={'aw-bg-gradient-lavender-coral-sunset'}
    >
      <div
        className={
          'aw-relative aw-inline-flex aw-size-full aw-w-full aw-items-center aw-justify-center aw-overflow-hidden aw-rounded-[5px] aw-bg-primaryDark aw-text-center aw-font-dmmono aw-text-[16px] aw-font-medium aw-text-text-primary md:aw-text-[18px]'
        }
      >
        Launch
      </div>
    </BaseButton>
  );
};
