import { useCallback, useState } from 'react';
import { usePortalStore } from '../store/usePortalStore.ts';
import { useAccount, useConfig } from 'wagmi';
import { useChainConfig } from './useChainConfig';
import { approveTokenHandler, isApprovalNeeded } from '../utils/tokenApproval';
import { sendTransaction, waitForTransactionReceipt } from 'wagmi/actions';
import { BoxActionResponse, EvmTransaction } from '@decent.xyz/box-common';
import { useBridgeStore } from '../store/useBridgeStore';
import { useErrorStore } from '../store/useErrorStore';

const GENERIC_ERROR_MESSAGE =
  'Error sending transaction. Please make sure you are connected to the internet, have sufficient funds for gas, and try again.';
const REGEX_USER_REJECTED_TX = /user rejected the request/i;

type Web3Error = Error & {
  details?: string;
};

export const useDecentBridge = (
  bridgeApiResponse: BoxActionResponse | undefined,
) => {
  const { address } = useAccount();
  const wagmiConfig = useConfig();
  const { isWrongChain } = useChainConfig();
  const [loading, setLoading] = useState(false);
  const { setError } = useErrorStore((state) => ({
    setError: state.setError,
  }));

  const { sourceToken } = usePortalStore((state) => ({
    sourceToken: state.sourceToken,
  }));

  const {
    setBridgeTransactionHash,
    setWaitingForSignature,
    setIsTokenApprovalRequired,
    setWaitingForTokenApprovalTxConfirm,
  } = useBridgeStore((state) => ({
    setBridgeTransactionHash: state.setBridgeTransactionHash,
    setWaitingForSignature: state.setWaitingForSignature,
    setIsTokenApprovalRequired: state.setIsTokenApprovalRequired,
    setWaitingForTokenApprovalTxConfirm:
      state.setWaitingForTokenApprovalTxConfirm,
  }));

  const sendBridgeTransaction = useCallback(async () => {
    if (!address || !bridgeApiResponse || isWrongChain || loading) {
      return;
    }

    setLoading(true);
    // Determine if token requires separate approval TX
    const approvalNeeded = await isApprovalNeeded({
      boxActionResponse: bridgeApiResponse,
      user: address,
      srcChainId: sourceToken.token.chainId,
      wagmiConfig,
    });
    setIsTokenApprovalRequired(approvalNeeded);

    let approvalReceived = false;
    if (approvalNeeded) {
      setWaitingForSignature(true);
      setWaitingForTokenApprovalTxConfirm(true);
      try {
        const chainId = sourceToken.token.chainId;
        const tokenApprovalTxHash = await approveTokenHandler({
          boxActionResponse: bridgeApiResponse,
          userAddress: address,
          srcChainId: chainId,
          wagmiConfig,
        });
        if (!tokenApprovalTxHash) {
          throw new Error('Approval transaction failed');
        }
        setWaitingForSignature(false);
        // Wait for approval transaction to be confirmed, since bridge/swap transaction depends approval being in place first
        const receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: tokenApprovalTxHash,
          chainId,
        });
        if (receipt.status !== 'success') {
          throw new Error('Approval transaction failed');
        }
        setIsTokenApprovalRequired(false);
        approvalReceived = true;
      } catch (error) {
        console.log('Error sending approval transaction', error);
        if (error instanceof Error) {
          if (!REGEX_USER_REJECTED_TX.test(error.message)) {
            setError((error as Web3Error).details ?? error.message);
          }
        } else {
          setError(GENERIC_ERROR_MESSAGE);
        }
      } finally {
        setWaitingForSignature(false);
        setWaitingForTokenApprovalTxConfirm(false);
      }
    }

    if (approvalNeeded && !approvalReceived) {
      setLoading(false);
      return;
    }

    setWaitingForSignature(true);
    try {
      const result = await sendTransaction(wagmiConfig, {
        ...(bridgeApiResponse.tx as EvmTransaction),
      });
      setBridgeTransactionHash(result);
    } catch (error) {
      console.log('Error sending bridge transaction', error);
      if (error instanceof Error) {
        if (!REGEX_USER_REJECTED_TX.test(error.message)) {
          setError((error as Web3Error).details ?? error.message);
        }
      } else {
        setError(GENERIC_ERROR_MESSAGE);
      }
    }

    setLoading(false);
    setWaitingForSignature(false);
  }, [
    address,
    bridgeApiResponse,
    isWrongChain,
    loading,
    setBridgeTransactionHash,
    sourceToken.token.chainId,
    wagmiConfig,
    setWaitingForSignature,
    setIsTokenApprovalRequired,
    setWaitingForTokenApprovalTxConfirm,
    setError,
  ]);

  return {
    loading,
    sendBridgeTransaction,
  };
};
