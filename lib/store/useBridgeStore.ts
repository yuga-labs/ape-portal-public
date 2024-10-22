import { create } from 'zustand';
import { BridgeError } from '../types';

interface BridgeState {
  bridgeError: BridgeError | undefined;
  bridgeTransactionHash: string | undefined;
  waitingForSignature: boolean;
  isTokenApprovalRequired: boolean;
  waitingForTokenApprovalTxConfirm: boolean;
}

interface BridgeActions {
  resetBridgeError: () => void;
  setBridgeError: (error?: BridgeError) => void;
  setBridgeTransactionHash: (txHash: string) => void;
  resetBridgeTransactionHash: () => void;
  setWaitingForSignature: (waiting: boolean) => void;
  setIsTokenApprovalRequired: (required: boolean) => void;
  setWaitingForTokenApprovalTxConfirm: (waiting: boolean) => void;
}

export const useBridgeStore = create<BridgeState & BridgeActions>((set) => ({
  bridgeError: undefined,
  bridgeTransactionHash: undefined,
  waitingForSignature: false,
  isTokenApprovalRequired: false,
  waitingForTokenApprovalTxConfirm: false,
  resetBridgeError: () => set({ bridgeError: undefined }),
  resetBridgeTransactionHash: () => set({ bridgeTransactionHash: undefined }),
  setBridgeError: (error?: BridgeError) =>
    set({ bridgeError: error ?? undefined }),
  setBridgeTransactionHash: (txHash: string) =>
    set({ bridgeTransactionHash: txHash }),
  setWaitingForSignature: (waiting: boolean) =>
    set({ waitingForSignature: waiting }),
  setIsTokenApprovalRequired: (required: boolean) =>
    set({ isTokenApprovalRequired: required }),
  setWaitingForTokenApprovalTxConfirm: (waiting: boolean) =>
    set({ waitingForTokenApprovalTxConfirm: waiting }),
}));
