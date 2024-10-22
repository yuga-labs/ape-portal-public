/* eslint-disable react-refresh/only-export-components */
import React, { ReactElement } from 'react';
import { Config, createConfig, http, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { connect, Connector } from '@wagmi/core';
import { defaultApeConfig, setupConfig, TEST_ACCOUNT } from './utils';
import {
  act,
  renderHook as defaultRenderHook,
  waitFor as globalWaitFor,
  render,
  RenderHookOptions,
  RenderOptions,
} from '@testing-library/react';
import { expect, vi } from 'vitest';
import { Address, Chain } from 'viem';
import { injected } from 'wagmi/connectors';
import 'vitest-canvas-mock';
import { ApeConfig, ApeProvider, DefaultTokenInfo } from '../lib';
import '@testing-library/jest-dom';
import { ChainId } from '@decent.xyz/box-common';

type TokenMap = {
  [chain: number]: {
    [tokenAddress: string]: [number, string, string];
  };
};

const MockTokenInfoMap: TokenMap = {
  [ChainId.POLYGON]: {
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063': [
      18,
      '(PoS) Dai Stablecoin',
      'DAI',
    ],
  },
  [ChainId.OPTIMISM]: {
    '0x4200000000000000000000000000000000000006': [18, 'Wrapped Ether', 'WETH'],
    '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': [18, 'Tether USD', 'USDT'],
  },
  [ChainId.ETHEREUM]: {
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': [18, 'Dai Stablecoin', 'DAI'],
  },
};

export const TestTokens = {
  PolyDai: {
    chainId: ChainId.POLYGON,
    address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  } as DefaultTokenInfo,
  OpWeth: {
    chainId: ChainId.OPTIMISM,
    address: '0x4200000000000000000000000000000000000006',
  } as DefaultTokenInfo,
  OpUsdt: {
    chainId: ChainId.OPTIMISM,
    address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
  } as DefaultTokenInfo,
  ArbArb: {
    chainId: ChainId.ARBITRUM,
    address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
  } as DefaultTokenInfo,
  ZoraImagine: {
    chainId: ChainId.ZORA,
    address: '0x078540eECC8b6d89949c9C7d5e8E91eAb64f6696',
  } as DefaultTokenInfo,
};

vi.mock('granim');
vi.mock('zustand');
vi.mock('lottie-react');
vi.mock('@decent.xyz/box-hooks', async () => {
  const boxHooks = await import('@decent.xyz/box-hooks');
  return {
    ...boxHooks,
    useDecentScan: vi.fn().mockReturnValue({}),
  };
});
vi.mock('wagmi', async () => {
  const wagmi = await vi.importActual<typeof import('wagmi')>('wagmi');
  return {
    ...wagmi,
    useReadContracts: vi.fn().mockImplementation((args) => {
      const { query, contracts } = args;
      if (query?.enabled) {
        const [chainId, address] = [contracts[0].chainId, contracts[0].address];
        return { data: MockTokenInfoMap[chainId][address] };
      }
      return wagmi.useReadContracts(args);
    }),
  };
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => {}),
    removeItem: vi.fn(() => {}),
    setItem: vi.fn(() => {}),
  },
  writable: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent Jest from garbage collecting cache
      gcTime: Number.POSITIVE_INFINITY,
      // Turn off retries to prevent timeouts
      retry: false,
    },
  },
});

export const AllTheProviders = ({
  children,
  wagmiConfig,
  apeConfig,
}: {
  children?: React.ReactNode;
  wagmiConfig: Config;
  apeConfig: ApeConfig;
}) => {
  const queryClient = new QueryClient();
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ApeProvider config={apeConfig}>{children}</ApeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

type Props = { config?: Config; apeConfig?: ApeConfig } & {
  children?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactNode;
};

export function wrapper({
  config = setupConfig(),
  apeConfig = defaultApeConfig,
  ...rest
}: Props) {
  return (
    <AllTheProviders {...rest} apeConfig={apeConfig} wagmiConfig={config} />
  );
}

export function renderHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  {
    wrapper: wrapper_,
    ...options_
  }:
    | RenderHookOptions<TProps & { config?: Config; apeConfig?: ApeConfig }>
    | undefined = {},
) {
  const options: RenderHookOptions<
    TProps & { config?: Config; apeConfig?: ApeConfig }
  > = {
    ...(wrapper_
      ? { wrapper: wrapper_ }
      : {
          wrapper: (props) => wrapper({ ...props, ...options_?.initialProps }),
        }),
    ...options_,
  };

  queryClient.clear();

  const utils = defaultRenderHook<TResult, TProps>(hook, options);
  return {
    ...utils,
    waitFor:
      (utils as { waitFor?: typeof globalWaitFor })?.waitFor ?? globalWaitFor,
  };
}

export const customRender = (
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'> & {
    apeConfig?: ApeConfig;
    chainId?: number;
    walletChainOverride?: Chain;
  },
): ReturnType<typeof render> & { connect: () => Promise<void> } => {
  const wagmiConfig = setupConfig(options.walletChainOverride);
  return {
    ...render(ui, {
      wrapper: (props) => (
        <AllTheProviders
          {...props}
          wagmiConfig={wagmiConfig}
          apeConfig={options.apeConfig || defaultApeConfig}
        />
      ),
      ...options,
    }),
    connect: async () => {
      let connected: {
        account?: Address;
        accounts?: readonly [Address, ...Address[]];
        chainId?: number;
      };
      await act(async () => {
        const mockConnector = wagmiConfig.connectors?.[0];
        const config = createConfig({
          chains: wagmiConfig.chains,
          connectors: [injected({ target: 'metaMask' })],
          transports: { [wagmiConfig.chains[0].id]: http() },
        });
        connected = await connect(config, {
          connector: mockConnector,
          chainId: options.chainId,
        });
      });

      await globalWaitFor(() => expect(connected.accounts).toBeTruthy());
    },
  };
};

export async function actConnect(config: {
  chainId?: number;
  connector?: Connector;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  utils: ReturnType<typeof renderHook<any, any>>;
}) {
  const { connector } = config;
  const getConnect = (utils: ReturnType<typeof renderHook>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (utils.result.current as any)?.connect || utils.result.current;
  const { chainId, utils } = config;

  await act(async () => {
    const connect = getConnect(utils);

    await connect.connectAsync?.({
      chainId,

      connector: connector ?? connect.connectors?.[0],
    });
  });

  const { waitFor } = utils;

  await waitFor(() => expect(getConnect(utils).isSuccess).toBeTruthy());
}

export async function actDisconnect(config: {
  utils: ReturnType<typeof renderHook>;
}) {
  const getDisconnect = (utils: ReturnType<typeof renderHook>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (utils.result.current as any)?.disconnect || utils.result.current;

  const utils = config.utils;

  await act(async () => {
    const disconnect = getDisconnect(utils);

    await disconnect.disconnectAsync?.();
  });

  const { waitFor } = utils;

  await waitFor(() => expect(getDisconnect(utils).isSuccess).toBeTruthy());
}

export { act, cleanup } from '@testing-library/react';
export { setupConfig, getPublicClient, getWalletClient } from './utils';
export const TEST_ADDRESS = TEST_ACCOUNT.address;

/* eslint-enable react-refresh/only-export-components */
