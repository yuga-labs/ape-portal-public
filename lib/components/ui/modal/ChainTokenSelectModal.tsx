import { ChainDropdown } from '../ChainDropdown.tsx';
import { ChainId, getChainName, TokenInfo } from '@decent.xyz/box-common';
import { TokenSelector } from '@decent.xyz/box-ui';
import { usePortalStore } from '../../../store/usePortalStore.ts';
import { useShallow } from 'zustand/react/shallow';
import { useChainConfig } from '../../../hooks/useChainConfig.ts';
import { TokenTransactionData } from '../../../classes/TokenTransactionData.ts';
import { useAccount } from 'wagmi';
import { useMemo, useState } from 'react';
import {
  ApeCoinMainnetArbitrumContract,
  ApeCoinMainnetEthereum,
  ApeCoinMainnetEthereumContract,
  ApeEthOmnichainContract,
  ApeUsdOmnichainContract,
  createApeCoinTokenInfo,
} from '../../../utils/utils.ts';
import { Address, isAddressEqual, zeroAddress } from 'viem';

const ApeCoinArbitrum = createApeCoinTokenInfo(
  ChainId.ARBITRUM,
  ApeCoinMainnetArbitrumContract,
);

const popularTokens = [ApeCoinMainnetEthereum, ApeCoinArbitrum];

/** Hotfix to address broken routes in decent.xyz - only show some possible swap options. */
const activeTokens = {
  [ChainId.ETHEREUM]: [
    ApeUsdOmnichainContract,
    ApeEthOmnichainContract,
    ApeCoinMainnetEthereumContract,
    zeroAddress,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // ETH-DAI
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // ETH-USDT
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // ETH-USDC
    '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', // ETH-stETH
  ],
  [ChainId.ARBITRUM]: [
    ApeUsdOmnichainContract,
    ApeEthOmnichainContract,
    ApeCoinMainnetArbitrumContract,
    zeroAddress,
    '0x912CE59144191C1204E64559FE8253a0e49E6548', // ARB-ARB
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // ARB-DAI
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // ARB-USDT
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // ARB-USDC
  ],
  [ChainId.APE]: [
    ApeUsdOmnichainContract,
    ApeEthOmnichainContract,
    zeroAddress,
  ],
};

/** Hotfix to address broken routes in decent.xyz - show even more narrow swap options for specific source/dest. */
const limitTokensBySource = (
  sourceToken: TokenInfo,
  destChain: ChainId,
): string[] | undefined => {
  if (sourceToken.chainId === ChainId.APE && destChain === ChainId.ETHEREUM) {
    if (isAddressEqual(sourceToken.address as Address, zeroAddress)) {
      return [ApeCoinMainnetEthereumContract]; // ETH-APE
    }
    if (
      isAddressEqual(sourceToken.address as Address, ApeUsdOmnichainContract)
    ) {
      return [
        '0x6B175474E89094C44Da98b954EedeAC495271d0F', // ETH-DAI
      ];
    }
    if (
      isAddressEqual(sourceToken.address as Address, ApeEthOmnichainContract)
    ) {
      return [
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', // ETH-stETH
      ];
    }
  }
};

export const ChainTokenSelectModal = ({
  currentToken,
  isSourceToken,
  isSwap,
  setModalOpen,
}: {
  currentToken: TokenTransactionData;
  isSourceToken?: boolean;
  isSwap: boolean;
  setModalOpen: (isOpen: boolean) => void;
}) => {
  const { chains } = useChainConfig();
  const { address } = useAccount();
  const {
    sourceToken,
    setSourceToken,
    setDestinationToken,
    setHasUserUpdatedTokens,
  } = usePortalStore(
    useShallow((state) => ({
      sourceToken: state.sourceToken,
      setSourceToken: state.setSourceToken,
      setDestinationToken: state.setDestinationToken,
      setHasUserUpdatedTokens: state.setHasUserUpdatedTokens,
    })),
  );
  const [selectorChainId, setSelectorChainId] = useState<ChainId>(
    currentToken.token.chainId,
  );
  const enabledTokens = useMemo(() => {
    if (!isSourceToken) {
      // We may need to limit the destination tokens available based on the current source token
      const maybeTokens = limitTokensBySource(
        sourceToken.token,
        selectorChainId,
      );
      if (maybeTokens) {
        return maybeTokens;
      }
    }
    return activeTokens[selectorChainId as keyof typeof activeTokens] || [];
  }, [selectorChainId, isSourceToken, sourceToken.token]);
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
            if (isSourceToken) {
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
          hidePopularSection
          selectTokens={enabledTokens}
        />
      </div>
    </div>
  );
};
