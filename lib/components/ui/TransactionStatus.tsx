import { useShallow } from 'zustand/react/shallow';
import { useBridgeStore } from '../../store/useBridgeStore.ts';
import { useMemo } from 'react';
import { usePortalStore } from '../../store/usePortalStore.ts';
import { useDecentScan } from '@decent.xyz/box-hooks';
import { BridgeState, DecentBridgeStatus } from '../../types.ts';
import approvedIcon from '../../assets/lotties/approved-icon.json';
import errorIcon from '../../assets/lotties/error-icon.json';
import Lottie from 'lottie-react';
import { LinkButton } from './buttons/LinkButton.tsx';
import { motion } from 'framer-motion';
import { Address } from 'viem';
import {
  cn,
  readableAmount,
  secondsToReadableTime,
} from '../../utils/utils.ts';
import { useIsTransactionProcessing } from '../../store/useIsTransactionProcessing.ts';
import TokenDisplay from './TokenDisplay.tsx';
import { LINK_SUPPORT, PortalType } from '../../utils/constants.ts';
import { ActionButton } from './buttons/ActionButton.tsx';
import { ModalWrapper } from './modal/ModalWrapper.tsx';
import { TransactionCallbacks } from './types.ts';
import useTransactionCallbacks from '../../hooks/useTransactionCallbacks.ts';

type TransactionStatusProps = TransactionCallbacks & {
  isSwap: boolean;
};

function TransactionStatus({
  isSwap,
  onTransactionSuccess,
  onTransactionError,
}: TransactionStatusProps) {
  const { sourceToken, destinationToken, estimatedTxTime } = usePortalStore(
    useShallow((state) => ({
      sourceToken: state.sourceToken,
      destinationToken: state.destinationToken,
      estimatedTxTime: state.bridgeTransactionData.estimatedTxTime,
    })),
  );
  const { resetBridgeTransactionHash } = useBridgeStore(
    useShallow((state) => ({
      resetBridgeTransactionHash: state.resetBridgeTransactionHash,
    })),
  );
  const { bridgeTransactionHash, waitingForSignature } = useBridgeStore(
    (state) => ({
      bridgeTransactionHash: state.bridgeTransactionHash,
      waitingForSignature: state.waitingForSignature,
    }),
  );
  const isWaitingForSignatureOrIsProcessing = useIsTransactionProcessing();
  const isTransactionHashSet = !!bridgeTransactionHash;
  const { data: bridgeTransaction } = useDecentScan({
    chainId: sourceToken.token.chainId,
    txHash: isTransactionHashSet
      ? (bridgeTransactionHash as Address)
      : undefined,
    enable: isTransactionHashSet,
  }) as { data: DecentBridgeStatus | undefined };

  const status = useMemo(() => {
    if (waitingForSignature) {
      return BridgeState.WAITING_FOR_SIGNATURE;
    } else if (
      bridgeTransaction?.status === 'Executed' ||
      bridgeTransaction?.tx?.statusMessage === 'success'
    ) {
      return BridgeState.COMPLETED;
    } else if (
      bridgeTransaction?.status === 'Failed' ||
      bridgeTransaction?.tx?.statusMessage === 'failed'
    ) {
      return BridgeState.FAILED;
    }
    return BridgeState.PROCESSING;
  }, [bridgeTransaction, waitingForSignature]);
  useTransactionCallbacks({
    status,
    chainId: sourceToken.token.chainId,
    transactionHash: bridgeTransactionHash,
    details: bridgeTransaction,
    onTransactionSuccess,
    onTransactionError,
  });

  const [statusSecondary, statusElement] = useMemo(() => {
    if (status === BridgeState.COMPLETED) {
      const statusText = isSwap ? 'Swapped' : 'Bridged';
      return [
        statusText,
        <Lottie
          animationData={approvedIcon}
          autoplay={true}
          loop={false}
          className={'aw-mx-auto aw-size-14 md:aw-size-20'}
        />,
      ];
    }
    if (status === BridgeState.FAILED) {
      const statusText = isSwap ? 'Swap Failed' : 'Bridge Failed';
      return [
        statusText,
        <Lottie
          animationData={errorIcon}
          autoplay={true}
          loop={false}
          className={'aw-mx-auto aw-size-14 md:aw-size-20'}
        />,
      ];
    }
    const statusText = isSwap ? 'Swapping' : 'Bridging';
    return [statusText, <div className={'aw-mx-auto'} />];
  }, [isSwap, status]);

  const viewTransactionUrl = `https://www.decentscan.xyz/?chainId=${sourceToken.token.chainId}&txHash=${bridgeTransactionHash}`;

  /** Source token amount truncated to 5 decimal places. */
  const sourceAmount = useMemo(() => {
    return readableAmount(sourceToken.amount);
  }, [sourceToken.amount]);
  const destinationAmount = useMemo(() => {
    return readableAmount(destinationToken.amount);
  }, [destinationToken.amount]);

  const variants = {
    [BridgeState.WAITING_FOR_SIGNATURE]: {
      width: '90%',
      backgroundImage: `linear-gradient(to right, rgba(162, 129, 255, 0.7), rgba(235, 130, 128, 0.7), rgba(235, 191, 154, 0.7), rgba(137, 208, 255, 0.7))`,
      transition: { duration: 1, delay: 0.5 },
    },
    [BridgeState.PROCESSING]: {
      width: '90%',
      transition: { duration: 1, delay: 0.5 },
    },
    [BridgeState.FAILED]: {
      width: '90%',
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
      backgroundImage: `unset`,
    },
    [BridgeState.COMPLETED]: {
      width: '90%',
      backgroundColor: '#0246cd',
      backgroundImage: 'unset',
    },
  };

  const estimatedTxTimeReadable = useMemo(() => {
    if (estimatedTxTime === undefined) {
      return '';
    }
    return secondsToReadableTime(estimatedTxTime);
  }, [estimatedTxTime]);

  const isTxProcessing = status === BridgeState.PROCESSING;

  return (
    <ModalWrapper
      title="Transaction Status"
      externalModalOpenState={isWaitingForSignatureOrIsProcessing}
      onDismiss={() => {
        resetBridgeTransactionHash();
      }}
      showCloseButton={!isTxProcessing && !waitingForSignature}
      renderContent={() => (
        <div className="aw-flex aw-size-full aw-animate-fade-in aw-flex-col aw-items-center aw-justify-center aw-gap-y-3 aw-overflow-auto aw-p-4 aw-scrollbar aw-scrollbar-track-black/70 aw-scrollbar-thumb-blue-700/80">
          <div className="aw-flex aw-h-full aw-flex-col aw-items-center aw-justify-center">
            <div className="aw-mt-12 aw-px-20 aw-text-center aw-text-[25px] aw-leading-[38px] aw-text-white md:aw-px-24 md:aw-text-[35px] md:aw-leading-[40px]">
              {status}
            </div>
            <h2 className="aw-mt-8 aw-text-[16px] aw-text-white">
              {statusSecondary}
            </h2>
            <div
              className={
                'aw-relative aw-mt-8 aw-flex aw-w-4/5 aw-flex-row aw-justify-center aw-gap-x-4'
              }
            >
              <motion.div
                initial={{ width: '60%' }}
                animate={status}
                variants={variants}
                className={cn(
                  'aw-relative aw-flex aw-h-20 aw-w-full aw-flex-row aw-items-center aw-justify-evenly aw-rounded-full',
                  {
                    'aw-animated-gradient': isTxProcessing,
                  },
                )}
              >
                <TokenDisplay
                  token={sourceToken.token}
                  amount={sourceAmount}
                  amountUsd={sourceToken.amountUsd}
                  animationVisible={isTxProcessing}
                  showChain={!isSwap}
                  left
                />
                {statusElement}
                <TokenDisplay
                  token={destinationToken.token}
                  amount={destinationAmount}
                  amountUsd={destinationToken.amountUsd}
                  animationVisible={isTxProcessing}
                  showChain={!isSwap}
                />
              </motion.div>
            </div>
            <div className="aw-mb-10 aw-mt-2 aw-w-full aw-px-3 aw-pb-3 aw-text-center md:aw-mb-0">
              <div
                className={cn(
                  'aw-mb-8 aw-mt-24 aw-flex aw-flex-col aw-font-dmsans aw-text-[13px] aw-leading-[18px] aw-tracking-[0.13px] aw-text-white',
                  {
                    'aw-invisible':
                      status === BridgeState.COMPLETED ||
                      status === BridgeState.FAILED ||
                      !estimatedTxTimeReadable,
                  },
                )}
              >
                <div className="aw-flex aw-min-h-5 aw-justify-center aw-font-normal aw-opacity-50">
                  Estimated Time:
                </div>
                <div className="aw-flex aw-min-h-5 aw-justify-center aw-font-bold">
                  {estimatedTxTimeReadable}
                </div>
              </div>
              <div className="aw-flex aw-flex-col">
                {waitingForSignature ? (
                  <ActionButton
                    disabled={true}
                    portal={isSwap ? PortalType.Swap : PortalType.Bridge}
                    action={() => {}}
                  />
                ) : (
                  <LinkButton
                    text={'View Transaction'}
                    url={viewTransactionUrl}
                  />
                )}
                <a
                  href={LINK_SUPPORT}
                  target="_blank"
                  className="aw-mt-3 aw-text-center aw-font-mono aw-text-[13px] aw-tracking-wide aw-text-white/70 aw-underline"
                >
                  {isSwap ? 'Swap' : 'Bridge'} Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    />
  );
}

export default TransactionStatus;
