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
  DaiArbMainnetContract,
  DaiEthMainnetContract,
  StethEthMainnetContract,
  UsdcArbMainnetContract,
  UsdcEthMainnetContract,
  UsdtArbMainnetContract,
  UsdtEthMainnetContract,
  WethArbMainnetContract,
  WethEthMainnetContract,
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
    DaiEthMainnetContract, // ETH-DAI
    UsdtEthMainnetContract, // ETH-USDT
    UsdcEthMainnetContract, // ETH-USDC
    StethEthMainnetContract, // ETH-stETH
  ],
  [ChainId.ARBITRUM]: [
    ApeUsdOmnichainContract,
    ApeEthOmnichainContract,
    ApeCoinMainnetArbitrumContract,
    zeroAddress,
    '0x912CE59144191C1204E64559FE8253a0e49E6548', // ARB-ARB
    DaiArbMainnetContract, // ARB-DAI
    UsdtArbMainnetContract, // ARB-USDT
    UsdcArbMainnetContract, // ARB-USDC
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
  if (
    sourceToken.chainId === ChainId.ETHEREUM &&
    (destChain === ChainId.ARBITRUM || destChain === ChainId.APE)
  ) {
    // Source: ETH-USDC, ETH-USDT, ETH-DAI
    if (
      isAddressEqual(sourceToken.address as Address, UsdcEthMainnetContract) ||
      isAddressEqual(sourceToken.address as Address, UsdtEthMainnetContract) ||
      isAddressEqual(sourceToken.address as Address, DaiEthMainnetContract)
    ) {
      return [ApeUsdOmnichainContract]; // APE-APEUSD or ARB-APEUSD
    }

    // Source: ETH-ETH, ETH-WETH, ETH-stETH
    if (
      isAddressEqual(sourceToken.address as Address, zeroAddress) ||
      isAddressEqual(sourceToken.address as Address, WethEthMainnetContract) ||
      isAddressEqual(sourceToken.address as Address, StethEthMainnetContract)
    ) {
      return [ApeEthOmnichainContract]; // APE-APEETH or ARB-APEETH
    }

    // Source: ETH-APE
    if (
      isAddressEqual(
        sourceToken.address as Address,
        ApeCoinMainnetEthereumContract,
      )
    ) {
      if (destChain === ChainId.ARBITRUM) {
        return [ApeCoinMainnetArbitrumContract]; // APE-ARB
      }
      if (destChain === ChainId.APE) {
        return [zeroAddress]; // APE-APE
      }
    }
  }

  if (sourceToken.chainId === ChainId.ARBITRUM) {
    // Source: ARB-USDC
    if (
      isAddressEqual(sourceToken.address as Address, UsdcArbMainnetContract)
    ) {
      if (destChain === ChainId.APE) {
        return [ApeUsdOmnichainContract]; // APE-APEUSD
      }
      return [];
    }
    // Source: ARB-USDT
    if (
      isAddressEqual(sourceToken.address as Address, UsdtArbMainnetContract)
    ) {
      if (destChain === ChainId.APE) {
        return [ApeUsdOmnichainContract]; // APE-APEUSD
      }
      return [];
    }
    // Source: ARB-DAI
    if (isAddressEqual(sourceToken.address as Address, DaiArbMainnetContract)) {
      if (destChain === ChainId.APE) {
        return [ApeUsdOmnichainContract]; // APE-APEUSD
      }
      return [];
    }
    // Source: ARB-APEUSD
    if (
      isAddressEqual(sourceToken.address as Address, ApeUsdOmnichainContract)
    ) {
      if (destChain === ChainId.APE) {
        return [ApeUsdOmnichainContract]; // APE-APEUSD
      }
      return [];
    }
    // Source: ARB-ETH
    if (isAddressEqual(sourceToken.address as Address, zeroAddress)) {
      if (destChain === ChainId.APE) {
        return [ApeEthOmnichainContract]; // APE-APEETH
      }
      return [];
    }
    // Source: ARB-WETH
    if (
      isAddressEqual(sourceToken.address as Address, WethArbMainnetContract)
    ) {
      if (destChain === ChainId.APE) {
        return [ApeEthOmnichainContract]; // APE-APEETH
      }
      return [];
    }
    // Source: ARB-APEETH
    if (
      isAddressEqual(sourceToken.address as Address, ApeEthOmnichainContract)
    ) {
      if (destChain === ChainId.APE) {
        return [ApeEthOmnichainContract]; // APE-APEETH
      }
      return [];
    }
    // Source: ARB-APE
    if (
      isAddressEqual(
        sourceToken.address as Address,
        ApeCoinMainnetArbitrumContract,
      )
    ) {
      if (destChain === ChainId.APE) {
        return [zeroAddress]; // APE-APE
      }
      if (destChain === ChainId.ETHEREUM) {
        return [ApeCoinMainnetEthereumContract]; // ETH-APE
      }
      return [];
    }
  }

  if (sourceToken.chainId === ChainId.APE) {
    // Source: APE-APEUSD
    if (
      isAddressEqual(sourceToken.address as Address, ApeUsdOmnichainContract)
    ) {
      if (destChain === ChainId.ETHEREUM) {
        return [DaiEthMainnetContract]; // ETH-DAI
      }
      if (destChain === ChainId.ARBITRUM) {
        return [ApeUsdOmnichainContract]; // ARB-APEUSD
      }
      return [];
    }

    // Source: APE-APEETH
    if (
      isAddressEqual(sourceToken.address as Address, ApeEthOmnichainContract)
    ) {
      if (destChain === ChainId.ETHEREUM) {
        return [StethEthMainnetContract]; // ETH-stETH
      }
      if (destChain === ChainId.ARBITRUM) {
        return [ApeEthOmnichainContract]; // ARB-APEETH
      }
      return [];
    }

    // Source: APE-APE
    if (isAddressEqual(sourceToken.address as Address, zeroAddress)) {
      if (destChain === ChainId.ARBITRUM) {
        return [ApeCoinMainnetArbitrumContract]; // APE-ARB
      }
      if (destChain === ChainId.ETHEREUM) {
        return [ApeCoinMainnetEthereumContract]; // ETH-APE
      }
      return [];
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
    <>
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
    </>
  );
};
