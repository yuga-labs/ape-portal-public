import { usePortalStore } from '../../store/usePortalStore.ts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { useShallow } from 'zustand/react/shallow';
import { TokenTransactionData } from '../../classes/TokenTransactionData.ts';
import { InputType, PortalType } from '../../utils/constants.ts';
import { NumberInputWithLabel } from './NumberInput.tsx';
import { useTokenAmounts } from '../../hooks/useTokenAmounts.ts';
import { MaxButton } from './buttons/MaxButton.tsx';
import { ChainTokenSelectModal } from './modal/ChainTokenSelectModal.tsx';
import { ChainTokenSelectTrigger } from './ChainTokenSelectTrigger.tsx';
import { cn, shortenAddress } from '../../utils/utils.ts';
import { useApeContext } from '../../providers/ape/apeProvider.context.ts';
import { ModalWrapper } from './modal/ModalWrapper.tsx';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

const InputLabelMap: Record<PortalType, Record<InputType, string>> = {
  [PortalType.Bridge]: {
    [InputType.Source]: 'From:',
    [InputType.Destination]: 'To:',
  },
  [PortalType.Swap]: {
    [InputType.Source]: 'Sell:',
    [InputType.Destination]: 'Buy:',
  },
  [PortalType.OnRamp]: {
    [InputType.Source]: '',
    [InputType.Destination]: '',
  },
};

export type TokenInputModuleProps = {
  isSourceToken?: boolean;
  className?: string;
  loading: boolean;
  selectType: PortalType;
  lockDestinationToken?: boolean;
};

export const TokenInputModule = ({
  isSourceToken,
  className,
  loading,
  selectType,
  lockDestinationToken,
}: TokenInputModuleProps) => {
  const { address: connectedWalletAddress } = useAccount();
  const { destinationAddress } = useApeContext();
  const {
    sourceToken,
    destinationToken,
    setDestinationTokenAmount,
    setSourceTokenAmount,
    lastChanged,
  } = usePortalStore(
    useShallow((state) => ({
      sourceToken: state.sourceToken,
      destinationToken: state.destinationToken,
      setDestinationTokenAmount: state.setDestinationTokenAmount,
      setSourceTokenAmount: state.setSourceTokenAmount,
      lastChanged: state.lastChanged,
    })),
  );
  const inputType: InputType = isSourceToken
    ? InputType.Source
    : InputType.Destination;
  const currentToken: TokenTransactionData = useMemo(() => {
    return isSourceToken ? sourceToken : destinationToken;
  }, [isSourceToken, sourceToken, destinationToken]);
  const isDifferentDestinationWallet =
    inputType === InputType.Destination &&
    destinationAddress &&
    isAddress(destinationAddress);
  const { tokenBalance, tokenBalanceTrimmed, isBalanceLoading, inputUsdValue } =
    useTokenAmounts(
      currentToken,
      isSourceToken,
      isDifferentDestinationWallet
        ? destinationAddress
        : connectedWalletAddress,
    );
  const inputChanged = useRef(false);
  const [inputValue, setInputValue] = useState(currentToken.amount);
  const debouncedInputValue = useDebounce(inputValue, 300);
  useEffect(() => {
    if (
      inputChanged.current &&
      Number(debouncedInputValue) !== Number(currentToken.amount)
    ) {
      if (isSourceToken) {
        setSourceTokenAmount(debouncedInputValue);
      }
      if (!isSourceToken) {
        setDestinationTokenAmount(debouncedInputValue);
      }
    }
    inputChanged.current = false;
  }, [
    debouncedInputValue,
    isSourceToken,
    setSourceTokenAmount,
    setDestinationTokenAmount,
    currentToken.amount,
  ]);

  useEffect(() => {
    setInputValue(currentToken.amount);
  }, [currentToken.amount]);

  const isSwap = selectType === PortalType.Swap;
  const isBridge = selectType === PortalType.Bridge;

  return (
    <>
      <div
        className={cn(
          'aw-relative aw-font-dmsans aw-flex aw-w-full aw-flex-col aw-gap-[12px] aw-text-clip aw-rounded-xl aw-border-t-2 aw-border-blue-500 aw-bg-gradient-to-t aw-from-white/20 aw-to-white/10 aw-p-4 aw-backdrop-blur-[38px]',
          className,
        )}
        data-testid={`token-input-${inputType}`}
      >
        <div className="aw-z-50 aw-flex aw-flex-row aw-gap-2">
          <NumberInputWithLabel
            label={InputLabelMap[selectType][inputType]}
            value={inputValue}
            onChange={(value) => {
              setInputValue(value);
              inputChanged.current = true;
            }}
            loading={loading}
            disabled={
              loading &&
              ((lastChanged === InputType.Destination && isSourceToken) ||
                (lastChanged === InputType.Source && !isSourceToken))
            }
          />
          <ModalWrapper
            title="Select Token"
            renderContent={({ setModalOpen }) => (
              <ChainTokenSelectModal
                currentToken={currentToken}
                srcToken={isSourceToken}
                isSwap={isSwap}
                setModalOpen={setModalOpen}
              />
            )}
            disabled={!isSourceToken && lockDestinationToken}
            closeButtonClassName="aw-right-5"
          >
            <ChainTokenSelectTrigger
              currentToken={currentToken}
              isBridge={isBridge}
            />
          </ModalWrapper>
        </div>
        <div className="aw-z-50 aw-flex aw-size-full aw-flex-row aw-items-center aw-justify-between aw-gap-x-2 aw-text-nowrap">
          <div className="aw-size-full aw-text-left aw-text-[15px] aw-font-normal aw-leading-[18px] aw-tracking-tight aw-text-white aw-opacity-70">
            {inputUsdValue}
          </div>
          <div>
            <span className="aw-mr-1 aw-text-[15px] aw-font-normal aw-leading-[18px] aw-tracking-tight aw-text-white aw-opacity-40">
              Balance
              {isDifferentDestinationWallet &&
                ` ${shortenAddress(destinationAddress)}`}
              :
            </span>
            <span className="aw-text-[15px] aw-font-normal aw-leading-[18px] aw-tracking-tight aw-text-white aw-opacity-70">
              {isBalanceLoading ? 'Loading...' : tokenBalanceTrimmed}
            </span>
          </div>
          {isSourceToken && (
            <MaxButton
              disabled={!connectedWalletAddress}
              tokenBalance={tokenBalance}
            />
          )}
        </div>
      </div>
    </>
  );
};
