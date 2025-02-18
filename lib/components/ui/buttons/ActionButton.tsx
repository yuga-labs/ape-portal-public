import { useAccount } from 'wagmi';
import { useChainConfig } from '../../../hooks/useChainConfig.ts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApeContext } from '../../../providers/ape/apeProvider.context.ts';
import Granim from 'granim';
import { cn, createGranimConfig } from '../../../utils/utils.ts';
import { useBridgeStore } from '../../../store/useBridgeStore.ts';
import { PortalType } from '../../../utils/constants.ts';
import { BaseButton } from './BaseButton.tsx';
import { motion } from 'framer-motion';
import { usePortalStore } from '../../../store/usePortalStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useBridgeError } from '../../../store/useBridgeError.ts';
import { useErrorStore } from '../../../store/useErrorStore.ts';
import ConsentModal from '../modal/ConsentModal.tsx';

enum ActionButtonStyle {
  GradientBorder,
  GradientFull,
}

const GradientBg = ({}) => {
  useEffect(() => {
    new Granim(createGranimConfig('#aw-button-bg', 'left-right', 1000));
  }, []);

  return (
    <canvas id={'aw-button-bg'} className={'aw-size-full aw-rounded-[5px]'} />
  );
};

const UNSUPPORTED_WALLETS = ['Magic Eden', 'Uniswap'];

export type ActionButtonProps = {
  action: () => void;
  disabled?: boolean;
  portal: PortalType;
};

/**
 * If the user is connected and on the right chain, the button will execute `action()`.
 * If the user is on the wrong chain, they will be prompted to switch chains.
 * If the user is not connected, they will be prompted to connect their wallet.
 *
 * @param action
 * @param disabled
 * @param portal
 * @constructor
 */
export const ActionButton = ({
  action,
  disabled,
  portal,
}: ActionButtonProps) => {
  const account = useAccount();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [spotlightX, setSpotlightX] = useState(0);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const {
    highImpactWarning,
    waitingForSignature,
    isTokenApprovalRequired,
    waitingForTokenApprovalTxConfirm,
  } = useBridgeStore((state) => ({
    highImpactWarning: state.highImpactWarning,
    waitingForSignature: state.waitingForSignature,
    isTokenApprovalRequired: state.isTokenApprovalRequired,
    waitingForTokenApprovalTxConfirm: state.waitingForTokenApprovalTxConfirm,
  }));
  const { bridgeErrorMessage } = useBridgeError();
  const {
    sourceToken: { amount: sourceAmount },
    destinationToken: { amount: destinationAmount },
  } = usePortalStore(
    useShallow((state) => ({
      sourceToken: state.sourceToken,
      destinationToken: state.destinationToken,
    })),
  );
  const { setError } = useErrorStore((state) => ({
    setError: state.setError,
  }));
  const areAmountsEmpty =
    Number(sourceAmount) === 0 && Number(destinationAmount) === 0;
  const isWalletConnected = !!useAccount().address;
  const {
    isWrongChain,
    switchToDesiredChain,
    desiredChainName,
    desiredChainId,
  } = useChainConfig();
  const { openConnectModal } = useApeContext();

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const buttonWidth = rect.width;

      // Calculate the spotlight position (opposite to cursor)
      const spotlightX = buttonWidth - x;
      // Subtract 70 to place a bit closer to cursor
      setSpotlightX(spotlightX - 70);
    }
  };

  useEffect(() => {
    // Set initial spotlight position
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setSpotlightX(rect.width * 0.85); // Start at 85% of the button width
    }
  }, []);

  const handler = useCallback(() => {
    if (!isWalletConnected) {
      openConnectModal();
    } else if (isWrongChain) {
      switchToDesiredChain();
    } else {
      if (highImpactWarning && !showConsentModal) {
        setShowConsentModal(true);
      } else {
        action();
      }
    }
  }, [
    isWrongChain,
    switchToDesiredChain,
    action,
    isWalletConnected,
    openConnectModal,
    highImpactWarning,
    showConsentModal,
  ]);

  const unsupportedWalletName: string | undefined = useMemo(() => {
    if (account?.connector?.name) {
      for (const wallet of UNSUPPORTED_WALLETS) {
        const regexp = new RegExp(wallet, 'i');
        if (regexp.test(account.connector.name)) {
          return wallet;
        }
      }
    }
  }, [account?.connector?.name]);
  const isUnsupportedWallet = !!unsupportedWalletName;

  useEffect(() => {
    if (isUnsupportedWallet) {
      setError(
        `${unsupportedWalletName} Wallet support coming soon. Please choose a different wallet provider. If you already disconnected the wallet, try refreshing the page.`,
      );
    }
  }, [isUnsupportedWallet, unsupportedWalletName, setError]);

  const [text, style]: [string, ActionButtonStyle] = useMemo(() => {
    let message = '';
    let style = ActionButtonStyle.GradientBorder;
    if (!isWalletConnected) {
      message = 'Connect Wallet';
    } else if (isUnsupportedWallet) {
      message = 'Unsupported Wallet';
    } else if (isWrongChain) {
      message = `Switch Network to ${desiredChainName || desiredChainId}`;
    } else {
      if (bridgeErrorMessage) {
        message = bridgeErrorMessage;
      } else if (waitingForSignature) {
        message = 'Waiting for signature';
        style = ActionButtonStyle.GradientFull;
      } else if (waitingForTokenApprovalTxConfirm) {
        message = 'Transaction is confirming...';
        style = ActionButtonStyle.GradientFull;
      } else if (areAmountsEmpty) {
        message = 'Enter Amount';
      } else if (isTokenApprovalRequired) {
        message = 'Approve token for spend';
      } else {
        message = portal === PortalType.Swap ? 'Swap' : 'Bridge';
      }
    }
    return [message, style];
  }, [
    isWalletConnected,
    isUnsupportedWallet,
    isWrongChain,
    desiredChainName,
    desiredChainId,
    bridgeErrorMessage,
    waitingForSignature,
    waitingForTokenApprovalTxConfirm,
    areAmountsEmpty,
    isTokenApprovalRequired,
    portal,
  ]);

  const buttonDisabled =
    isUnsupportedWallet ||
    (!isWrongChain &&
      isWalletConnected &&
      (disabled ||
        waitingForTokenApprovalTxConfirm ||
        bridgeErrorMessage !== undefined ||
        areAmountsEmpty));

  return (
    <>
      {showConsentModal && (
        <ConsentModal
          visible={showConsentModal}
          title="High Impact Warning"
          description="This transaction has a high price impact, meaning you will receive significantly less in $USD equivalent than you are sending. Are you sure you want to proceed?"
          onAccept={() => {
            setShowConsentModal(false);
            action();
          }}
          onReject={() => setShowConsentModal(false)}
          acceptText="Proceed"
          rejectText="Cancel"
        />
      )}
      <BaseButton
        disabled={buttonDisabled}
        onClick={handler}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        className={cn(
          'disabled:aw-opacity-100',
          style === ActionButtonStyle.GradientFull
            ? 'aw-gradient-lavender-coral-sunset aw-relative aw-h-[62px] aw-cursor-not-allowed aw-overflow-hidden aw-text-clip'
            : 'aw-bg-gradient-lavender-coral-sunset',
        )}
        ref={buttonRef}
      >
        <div
          className={cn(
            'aw-relative aw-overflow-hidden aw-font-dmmono aw-text-[16px] md:aw-text-[18px] aw-font-medium aw-w-full',
            style === ActionButtonStyle.GradientFull
              ? 'aw-absolute aw-left-1/2 aw-top-1/2 aw--translate-x-1/2 aw--translate-y-1/2 aw-cursor-not-allowed aw-text-blue-900'
              : 'aw-inline-flex aw-size-full aw-items-center aw-justify-center aw-rounded-[5px] aw-bg-primaryDark aw-text-center aw-text-text-primary',
            buttonDisabled &&
              style != ActionButtonStyle.GradientFull &&
              'aw-text-text-disabled',
          )}
        >
          <motion.div
            className="aw-absolute aw-h-[25px] aw-w-2/5 aw-rounded-full aw-bg-white aw-opacity-10 aw-blur-2xl aw-filter"
            style={{
              left: spotlightX,
              top: 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.2 : 0 }}
            transition={{ duration: 0.2 }}
          />
          {text}
        </div>
        {style === ActionButtonStyle.GradientFull && <GradientBg />}
      </BaseButton>
    </>
  );
};
