import { useErrorStore } from '../../../store/useErrorStore';
import { WarningIcon } from '../../icons/WarningIcon';
import { BaseButton } from '../buttons/BaseButton.tsx';
import { ModalWrapper } from './ModalWrapper.tsx';

export default function ErrorModal() {
  const { error, resetError } = useErrorStore();

  return (
    <ModalWrapper
      externalModalOpenState={!!error}
      onDismiss={() => {
        resetError();
      }}
      title={'An Error Has Occurred'}
      renderContent={() => (
        <div className="aw-flex aw-size-full aw-flex-col aw-items-center aw-justify-center aw-gap-y-3 aw-overflow-auto aw-p-4 aw-scrollbar aw-scrollbar-track-black/70 aw-scrollbar-thumb-blue-700/80">
          <WarningIcon size={53} isError className="aw-opacity-60" />
          <h2 className="aw-px-20 aw-text-center aw-font-dmsans aw-text-[30px] aw-leading-[30px] aw-text-white md:aw-px-32">
            Something went wrong
          </h2>
          <p className="aw-max-h-[40%] aw-w-full aw-overflow-auto aw-px-6 aw-text-center aw-text-sm aw-leading-6 aw-tracking-wide aw-text-[#9FBFFE] md:aw-px-20">
            {error}
          </p>
          <div className="aw-mt-2.5 aw-w-1/2">
            <BaseButton onClick={resetError}>Ok</BaseButton>
          </div>
        </div>
      )}
    />
  );
}
