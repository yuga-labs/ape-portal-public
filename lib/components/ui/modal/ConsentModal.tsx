import { BaseButton } from '../buttons/BaseButton.tsx';
import ModalWarningText from './ModalText.tsx';
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
      centerContents
      renderContent={() => (
        <>
          <ModalWarningText title={title} description={description} />
          <div className="aw-mt-2.5 aw-flex aw-w-1/2 aw-gap-x-8">
            <BaseButton onClick={onReject}>{rejectText || 'No'}</BaseButton>
            <BaseButton onClick={onAccept}>{acceptText || 'Yes'}</BaseButton>
          </div>
        </>
      )}
    />
  );
}
