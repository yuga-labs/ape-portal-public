import { create } from 'zustand';
import { BridgeError } from '../types';

interface BridgeState {
  /** Various bridge/swap error states. Intended for reading via useBridgeError, to account for highImpactError. */
  bridgeError: BridgeError | undefined;
  /** True if price impact exceeds DISABLE_BUTTON_THRESHOLD_PRICE_IMPACT. Intended for reading via useBridgeError. */
  highImpactError: boolean;
  bridgeTransactionHash: string | undefined;
  waitingForSignature: boolean;
  isTokenApprovalRequired: boolean;
  waitingForTokenApprovalTxConfirm: boolean;
}

interface BridgeActions {
  resetBridgeError: () => void;
  setBridgeError: (error?: BridgeError) => void;
  setHighImpactError: (highImpact: boolean) => void;
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
  highImpactError: false,
  resetBridgeError: () => set({ bridgeError: undefined }),
  resetBridgeTransactionHash: () => set({ bridgeTransactionHash: undefined }),
  setBridgeError: (error?: BridgeError) =>
    set({ bridgeError: error ?? undefined }),
  setHighImpactError: (highImpact: boolean) =>
    set({ highImpactError: highImpact }),
  setBridgeTransactionHash: (txHash: string) =>
    set({ bridgeTransactionHash: txHash }),
  setWaitingForSignature: (waiting: boolean) =>
    set({ waitingForSignature: waiting }),
  setIsTokenApprovalRequired: (required: boolean) =>
    set({ isTokenApprovalRequired: required }),
  setWaitingForTokenApprovalTxConfirm: (waiting: boolean) =>
    set({ waitingForTokenApprovalTxConfirm: waiting }),
}));
