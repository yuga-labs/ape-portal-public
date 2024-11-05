import '../style.css';
import TransactionStatus from './TransactionStatus.tsx';
import { TokenInputModule } from './TokenInputModule.tsx';
import { PortalType } from '../../utils/constants.ts';
import { SwapSourceDestination } from './buttons/SwapSourceDestination.tsx';
import { TransactionOverview } from './TransactionOverview.tsx';
import { ActionButton } from './buttons/ActionButton.tsx';
import { ChainSelectorModule } from './ChainSelectorModule.tsx';
import { withDecent } from '../../providers/decent.tsx';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useDecentBridge } from '../../hooks/useDecentBridge.ts';
import '@decent.xyz/box-ui/index.css';
import { ToolBar } from './ToolBar.tsx';
import { ApeContainer } from './ApeContainer.tsx';
import { useTokenSwapSetup } from '../../hooks/useTokenSwapSetup.ts';
import { usePreparedTransaction } from '../../hooks/usePreparedTransaction.ts';
import { cn } from '../../utils/utils.ts';
import { useSourceGasTokenUsdPrice } from '../../hooks/useSourceGasTokenUsdPrice.ts';
import { SpotlightBackground } from './SpotlightBackground.tsx';
import { PortalProps } from './types.ts';
import ErrorModal from './modal/ErrorModal.tsx';

export type TokenSwapProps = PortalProps & {
  portalType: PortalType;
};

function TokenSwapComponent({
  portalType,
  showBranding = false,
  isTabHosted = false,
  tokenConfig,
  className,
  onTransactionSuccess,
  onTransactionError,
}: TokenSwapProps) {
  const useBoxActionArgs = useTokenSwapSetup(portalType, tokenConfig);
  const { loading, preparedTransaction } =
    usePreparedTransaction(useBoxActionArgs);
  const { sendBridgeTransaction } = useDecentBridge(preparedTransaction);
  const isSwap = portalType === PortalType.Swap;
  const isOnRamp = portalType === PortalType.OnRamp;
  useSourceGasTokenUsdPrice();

  return (
    <LayoutGroup>
      <ApeContainer wrapChildren={showBranding} className={className}>
        <SpotlightBackground
          isSwap={isSwap}
          showBranding={showBranding || isTabHosted}
        >
          <AnimatePresence>
            {isSwap && (
              <ChainSelectorModule
                loading={loading}
                className={cn(showBranding ? 'aw-mb-3' : 'aw-my-3')}
                disabled={tokenConfig?.lockDestinationToken}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!isOnRamp && (
              <motion.div
                layout={'position'}
                initial={{ opacity: 0.5, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className={
                  'aw-relative aw-flex aw-flex-1 aw-flex-col aw-gap-y-3'
                }
              >
                {!isTabHosted && <ErrorModal />}
                <TransactionStatus
                  isSwap={isSwap}
                  onTransactionSuccess={onTransactionSuccess}
                  onTransactionError={onTransactionError}
                />
                <div
                  className={
                    'aw-relative aw-flex aw-w-full aw-flex-col aw-items-center aw-gap-y-3'
                  }
                >
                  {!isOnRamp && (
                    <TokenInputModule
                      isSourceToken={true}
                      className="aw-z-50"
                      loading={loading}
                      selectType={portalType}
                    />
                  )}
                  <SwapSourceDestination
                    loading={loading}
                    disabled={tokenConfig?.lockDestinationToken}
                  />
                  {!isOnRamp && (
                    <TokenInputModule
                      isSourceToken={false}
                      className="aw-z-30"
                      loading={loading}
                      selectType={portalType}
                      lockDestinationToken={tokenConfig?.lockDestinationToken}
                    />
                  )}
                </div>
                <TransactionOverview />
                <ActionButton
                  disabled={loading || preparedTransaction === undefined}
                  portal={portalType}
                  action={() => {
                    void sendBridgeTransaction();
                  }}
                />
                <ToolBar />
              </motion.div>
            )}
          </AnimatePresence>
        </SpotlightBackground>
      </ApeContainer>
    </LayoutGroup>
  );
}

export const TokenSwap = withDecent(TokenSwapComponent);
