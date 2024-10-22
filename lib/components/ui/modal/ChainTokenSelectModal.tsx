import { ChainDropdown } from '../ChainDropdown.tsx';
import { ChainId, getChainName, TokenInfo } from '@decent.xyz/box-common';
import { TokenSelector } from '@decent.xyz/box-ui';
import { usePortalStore } from '../../../store/usePortalStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useChainConfig } from '../../../hooks/useChainConfig.ts';
import { TokenTransactionData } from '../../../classes/TokenTransactionData.ts';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import {
  ApeCoinMainnetEthereum,
  createApeCoinTokenInfo,
} from '../../../utils/utils.ts';

const ApeCoinArbitrum = createApeCoinTokenInfo(
  ChainId.ARBITRUM,
  '0x7f9FBf9bDd3F4105C478b996B648FE6e828a1e98',
);

const popularTokens = [ApeCoinMainnetEthereum, ApeCoinArbitrum];

export const ChainTokenSelectModal = ({
  currentToken,
  srcToken,
  isSwap,
  setModalOpen,
}: {
  currentToken: TokenTransactionData;
  srcToken?: boolean;
  isSwap: boolean;
  setModalOpen: (isOpen: boolean) => void;
}) => {
  const { chains } = useChainConfig();
  const { address } = useAccount();
  const { setSourceToken, setDestinationToken, setHasUserUpdatedTokens } =
    usePortalStore(
      useShallow((state) => ({
        setSourceToken: state.setSourceToken,
        setDestinationToken: state.setDestinationToken,
        setHasUserUpdatedTokens: state.setHasUserUpdatedTokens,
      })),
    );
  const [selectorChainId, setSelectorChainId] = useState<ChainId>(
    currentToken.token.chainId,
  );

  const instructionPrefix = isSwap ? '' : '2. ';

  return (
    <div className="aw-flex aw-size-full aw-flex-col aw-gap-y-3 aw-overflow-auto aw-p-4 aw-scrollbar aw-scrollbar-track-black/70 aw-scrollbar-thumb-blue-700/80">
      {!isSwap && (
        <div className="aw-flex aw-w-full aw-flex-col aw-items-start aw-justify-start aw-gap-2.5 aw-rounded aw-border aw-border-white/20 aw-bg-apeCtaBlue/50 aw-p-3 md:aw-px-5">
          <p
            className={
              'aw-font-dmsans aw-font-medium aw-leading-normal aw-tracking-wide'
            }
          >
            1. Select Network
          </p>
          <ChainDropdown
            setSelectorChain={setSelectorChainId}
            selectorChain={selectorChainId}
            chains={chains}
          />
        </div>
      )}
      <div className="decent-dialog aw-inline-flex aw-w-full aw-flex-col aw-items-start aw-justify-start aw-gap-2.5 aw-rounded aw-border aw-border-white/20 aw-bg-apeCtaBlue/50 aw-px-3 aw-pt-2 md:aw-px-5 md:aw-pt-5">
        <p
          className={
            'aw-font-dmsans aw-font-medium aw-leading-normal aw-tracking-wide'
          }
        >
          {instructionPrefix}Select any token on{' '}
          {getChainName(selectorChainId) ?? ' this chain'}
        </p>
        <TokenSelector
          selectedToken={currentToken.token}
          setSelectedToken={(token: TokenInfo) => {
            setHasUserUpdatedTokens();
            if (srcToken) {
              setSourceToken(token);
            } else {
              setDestinationToken(token);
            }
            setModalOpen(false);
          }}
          chainId={selectorChainId}
          address={address}
          selectorOnly
          showUsdValue={true}
          popularTokens={popularTokens}
        />
      </div>
    </div>
  );
};
