import '../style.css';
import { useAccount } from 'wagmi';
import {
  CommerceWindowType,
  openHalliday,
  Service,
} from '@halliday-sdk/commerce';
import { useEffect, useMemo, useRef } from 'react';
import { ActionButton } from '../ui/buttons/ActionButton';
import {
  PUBLIC_HALLIDAY_API_KEY as apiKey,
  PortalType,
} from '../../utils/constants';
import { useEthersSigner } from '../../hooks/useEthersSigner';
import { useApeContext } from '../../providers/ape/apeProvider.context';
import { ApeContainer } from '../ui/ApeContainer';
import { PortalProps } from '../ui/types';
import { useErrorStore } from '../../store/useErrorStore';
import { cn, shortenAddress } from '../../utils/utils';
import { isAddress } from 'viem';
import ErrorModal from '../ui/modal/ErrorModal.tsx';

export function Buy({
  showBranding = false,
  className,
  isTabHosted,
  portalType,
}: PortalProps & { portalType?: PortalType }) {
  const { enableOnramp, destinationAddress, isTopTrader } = useApeContext();
  const { address } = useAccount();
  const signer = useEthersSigner();
  const { setError } = useErrorStore();
  const wasHallidayLoaded = useRef(false);

  useEffect(() => {
    if (wasHallidayLoaded.current) return;
    if (isTabHosted && portalType !== PortalType.OnRamp) return;
    if (!address || !signer || !enableOnramp) return;
    openHalliday({
      apiKey,
      destinationBlockchainType: 'APECHAIN',
      destinationCryptoType: 'APECOIN_APECHAIN',
      destinationAddress: destinationAddress || address,
      getSigner: async () => signer,
      targetElementId: 'aw-onramp-halliday',
      services: ['ONRAMP' as Service],
      windowType: 'EMBED' as CommerceWindowType,
    });
    wasHallidayLoaded.current = true;
  }, [
    address,
    signer,
    enableOnramp,
    destinationAddress,
    portalType,
    isTabHosted,
  ]);

  useEffect(() => {
    if (!enableOnramp) {
      setError('Onramp is not enabled.');
    }
  }, [setError, enableOnramp]);
  const isWalletConnected = useMemo(() => !!address, [address]);

  const fundsReceiverWarning = useMemo(() => {
    if (destinationAddress && isAddress(destinationAddress)) {
      return isTopTrader
        ? `Funds will arrive in your Top Trader wallet and will be ready for you to enter Top Trader Tournaments`
        : `Funds will be sent to a different wallet address! ${shortenAddress(destinationAddress)}`;
    }
  }, [destinationAddress, isTopTrader]);

  return (
    <ApeContainer
      wrapChildren={showBranding}
      className={className}
      showGradient={!isTabHosted}
    >
      <div
        data-testid="aw-onramp-container"
        className="aw-flex aw-min-h-[470px] aw-justify-center aw-bg-apeBlue"
      >
        {!isTabHosted && <ErrorModal />}
        {fundsReceiverWarning && isWalletConnected && (
          <div
            id={isTopTrader ? 'aw-onramp-top-trader-warning' : ''}
            className="aw-absolute aw-top-0 aw-w-full aw-justify-between aw-border-b aw-border-white/10 aw-p-2 aw-text-center aw-text-[14px] aw-leading-[14px] aw-tracking-[0.12px] aw-text-warning"
          >
            {fundsReceiverWarning}
          </div>
        )}
        <div
          id="aw-onramp-halliday"
          data-testid="aw-onramp-halliday"
          className={cn(
            'aw-w-[90vw]',
            !isWalletConnected && 'aw-hidden',
            fundsReceiverWarning && 'aw-pt-10 sm:aw-pt-6',
          )}
        />
        {!isWalletConnected && (
          <div className="aw-flex aw-w-full aw-flex-col aw-items-center aw-justify-between aw-px-8 aw-pb-8 aw-pt-16">
            <div className={'aw-font-dmsans aw-text-white'}>
              <div className="aw-mb-6 aw-text-center aw-text-3xl aw-capitalize aw-leading-[37px] aw-tracking-wide">
                Connect <br />
                your wallet
              </div>
              <div className="aw-text-center aw-font-bold aw-leading-[25px]">
                Please connect your wallet to
                <br />
                proceed with the onramp.
              </div>
            </div>
            <ActionButton action={() => {}} portal={PortalType.Bridge} />
          </div>
        )}
      </div>
    </ApeContainer>
  );
}
