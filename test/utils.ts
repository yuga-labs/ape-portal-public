import { createConfig } from 'wagmi';
import {
  Address,
  Chain,
  createPublicClient,
  createWalletClient,
  custom,
  Hex,
  http,
  PublicClient,
  WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mock } from 'wagmi/connectors';
import { ApeConfig } from '../lib';
import { vi } from 'vitest';
import { arbitrum, base, mainnet, optimism, polygon, zora } from 'wagmi/chains';

export const testChains = [mainnet, base, polygon, optimism, arbitrum];

export const TEST_ACCOUNT = {
  privateKey:
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address,
};

export function getPublicClient({
  chains = testChains,
  chainId,
}: { chains?: Chain[]; chainId?: number } = {}): PublicClient {
  const chain = chains.find((x) => x.id === chainId) ?? mainnet;
  const url = mainnet.rpcUrls.default.http[0];
  const publicClient = createPublicClient({
    chain,
    transport: http(url),
    pollingInterval: 1000,
  });
  return Object.assign(publicClient, {
    chains,
    toJSON() {
      return `<PublicClient network={${chain.id}} />`;
    },
  });
}

export function getWalletClient(walletChainOverride?: Chain): WalletClient {
  const publicClient = getPublicClient({
    chainId: walletChainOverride?.id,
  });
  return createWalletClient({
    account: privateKeyToAccount(TEST_ACCOUNT.privateKey as Hex),
    chain: publicClient.chain,
    transport: custom(publicClient),
  });
}

export function setupConfig(
  walletChainOverride?: Chain,
): ReturnType<typeof createConfig> {
  const walletClient = getWalletClient(walletChainOverride);
  if (walletClient?.account?.address) {
    return createConfig({
      chains: (walletChainOverride ? [walletChainOverride] : testChains) as [
        Chain,
        ...Chain[],
      ],
      connectors: [
        mock({
          accounts: [walletClient.account.address],
        }),
      ],
      transports: {
        [mainnet.id]: http(),
        [zora.id]: http(),
        [base.id]: http(),
        [polygon.id]: http(),
        [optimism.id]: http(),
      },
    });
  } else {
    throw new Error('No wallet address');
  }
}

export const defaultApeConfig: ApeConfig = {
  openConnectModal: vi.fn(),
};
