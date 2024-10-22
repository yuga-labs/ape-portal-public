import { produce } from 'immer';
import { create } from 'zustand';

interface ModalStoreState {
  modalContainer: HTMLDivElement | undefined;
}

interface ModalActions {
  setModalContainer: (container: HTMLDivElement | undefined) => void;
}

export const useModalStore = create<ModalStoreState & ModalActions>((set) => ({
  modalContainer: undefined,
  setModalContainer: (container: HTMLDivElement | undefined) =>
    set(
      produce((state) => {
        state.modalContainer = container;
      }),
    ),
}));
