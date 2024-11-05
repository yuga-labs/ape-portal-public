import { useErrorStore } from '../../../store/useErrorStore';
import { BaseButton } from '../buttons/BaseButton.tsx';
import ModalWarningText from './ModalText.tsx';
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
      centerContents
      renderContent={() => (
        <>
          <ModalWarningText
            isError
            title="Something went wrong"
            description={error || 'An unknown error occurred.'}
          />
          <div className="aw-mt-2.5 aw-w-1/2">
            <BaseButton onClick={resetError}>Ok</BaseButton>
          </div>
        </>
      )}
    />
  );
}
