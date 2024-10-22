import { Oval } from 'react-loader-spinner';
import { usePortalStore } from '../../../store/usePortalStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { SwitchIcon } from '../../icons/SwitchIcon.tsx';

export const SwapSourceDestination = ({
  loading,
  disabled,
}: {
  loading: boolean;
  disabled?: boolean;
}) => {
  const swapSourceDestination = usePortalStore(
    useShallow((state) => state.swapSourceDestination),
  );

  return (
    <>
      <div
        className={
          'aw-absolute aw-left-1/2 aw-top-1/2 aw-z-60 aw-size-10 aw--translate-x-1/2 aw--translate-y-1/2 md:aw-size-[48px]'
        }
      >
        {loading && ( // Conditionally render to avoid stuttering. Using `visible={loading}` causes re-mounting
          <Oval
            visible={true}
            color="#1e3a8a"
            strokeWidth={4}
            strokeWidthSecondary={4}
            secondaryColor="#1e3a8a"
            wrapperClass="aw-absolute aw-z-[65] aw-size-10 md:aw-size-[48px] -aw-top-[20px] md:-aw-top-[16px] aw-animate-fade-in"
          />
        )}
        <button
          onClick={() => {
            void swapSourceDestination();
          }}
          aria-label={'swap-source-destination'}
          className={
            'aw-gradient-lavender-coral-sunset aw-relative aw-flex aw-size-full aw-items-center aw-justify-center aw-rounded-full aw-bg-apeCtaBlue aw-p-[3px] aw-duration-500 hover:aw-scale-110 disabled:aw-cursor-not-allowed'
          }
          disabled={loading || disabled}
        >
          <SwitchIcon
            className={
              'aw-z-60 aw-size-full aw-rounded-full aw-bg-apeCtaBlue aw-p-2 aw-duration-1000 aw-animate-in hover:aw-rotate-180'
            }
          />
        </button>
      </div>
    </>
  );
};
