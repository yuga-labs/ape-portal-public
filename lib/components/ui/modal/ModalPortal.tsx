import { useEffect, useState } from 'react';
import { useModalStore } from '../../../store/useModalStore.ts';

export const ModalPortal = () => {
  const [container, setContainer] = useState<null | HTMLDivElement>();
  const { setModalContainer } = useModalStore((state) => ({
    modalContainer: state.modalContainer,
    setModalContainer: state.setModalContainer,
  }));

  useEffect(() => {
    if (container) {
      setModalContainer(container);
    }
  }, [container, setModalContainer]);

  return (
    <div
      ref={setContainer}
      id={'portal-modal-portal'}
      className={
        'aw-pointer-events-none aw-absolute aw-z-100 aw-size-full aw-p-3'
      }
    />
  );
};
