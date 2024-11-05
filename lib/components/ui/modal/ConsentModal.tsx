import { WarningIcon } from '../../icons/WarningIcon';
import { BaseButton } from '../buttons/BaseButton.tsx';
import { ModalWrapper } from './ModalWrapper.tsx';

export type ConsentModalProps = {
  visible: boolean;
  onAccept: () => void;
  onReject: () => void;
  title: string;
  description: string;
  rejectText?: string;
  acceptText?: string;
};

export default function ConsentModal({
  visible,
  title,
  description,
  rejectText,
  acceptText,
  onAccept,
  onReject,
}: ConsentModalProps) {
  return (
    <ModalWrapper
      externalModalOpenState={visible}
      title={'User Consent Required'}
      showCloseButton={false}
      renderContent={() => (
        <div className="aw-flex aw-size-full aw-animate-fade-in aw-flex-col aw-items-center aw-justify-center aw-gap-y-3 aw-overflow-auto aw-p-4 aw-scrollbar aw-scrollbar-track-black/70 aw-scrollbar-thumb-blue-700/80">
          <WarningIcon size={53} isError={false} className="aw-opacity-60" />
          <h2 className="aw-px-20 aw-text-center aw-font-dmsans aw-text-[30px] aw-leading-[38px] aw-text-white md:aw-px-32">
            {title}
          </h2>
          <p className="aw-max-h-[40%] aw-w-full aw-overflow-auto aw-px-6 aw-text-center aw-text-sm aw-leading-6 aw-tracking-wide aw-text-[#9FBFFE] md:aw-px-20">
            {description}
          </p>
          <div className="aw-mt-2.5 aw-flex aw-w-1/2 aw-gap-x-8">
            <BaseButton onClick={onReject}>{rejectText || 'No'}</BaseButton>
            <BaseButton onClick={onAccept}>{acceptText || 'Yes'}</BaseButton>
          </div>
        </div>
      )}
    />
  );
}
