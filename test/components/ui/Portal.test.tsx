import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  AllTheProviders,
  customRender,
  setupConfig,
  TestTokens,
} from '../../index.tsx';
import { ApePortal } from '../../../lib/components/portal/Portal.tsx';
import userEvent from '@testing-library/user-event';
import { MotionGlobalConfig } from 'framer-motion';
import { arbitrum, mainnet, polygon } from 'wagmi/chains';
import { Chain } from 'viem';
import { defaultApeConfig } from '../../utils.ts';
import { ApeConfig, InputType, PortalType } from '../../../lib/index.ts';
import { usePortalStore } from '../../../lib/store/usePortalStore.ts';
import { ChainId } from '@decent.xyz/box-common';
import { connect } from '@wagmi/core';
import { ERROR_MALFORMED_CONFIG } from '../../../lib/hooks/useConfigTokenDefaults.ts';
import { InitialPortalType } from '../../../lib/utils/constants.ts';
import {
  SelectedTabClass,
  UnselectedTabClass,
} from '../../../lib/components/ui/buttons/TabButton.tsx';
import { apeChain } from 'viem/chains';

MotionGlobalConfig.skipAnimations = true;

const SelectedTabClassRegex = new RegExp(SelectedTabClass, 'i');
const UnselectedTabClassRegex = new RegExp(UnselectedTabClass, 'i');

const expectSourceAndDestinationTokens = (
  sourceToken: string,
  destinationToken: string,
) => {
  expect(
    within(screen.getByTestId('token-input-source')).getByRole('button', {
      name: new RegExp(sourceToken, 'i'),
    }),
  ).toBeInTheDocument();
  expect(
    within(screen.getByTestId('token-input-destination')).getByRole('button', {
      name: new RegExp(destinationToken, 'i'),
    }),
  ).toBeInTheDocument();
};

describe('ApePortal', () => {
  beforeEach(() => {
    userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the default tab correctly with onramp disabled', async () => {
    const portal = customRender(<ApePortal />, {});
    expect(screen.getByRole('tab', { name: /bridge/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /swap/i })).toBeDefined();
    expect(screen.queryByRole('tab', { name: /onramp/i })).toBeNull();
    const bridgeTabButton = screen.getByRole('tab', {
      name: /bridge/i,
    });
    expect(bridgeTabButton).toBeDefined();
    expect(bridgeTabButton).toHaveAttribute(
      'data-headlessui-state',
      'selected',
    );
    expect(screen.getByText(/connect wallet/i)).toBeDefined();
    expectSourceAndDestinationTokens('APE', 'APE');
    expect(portal).toMatchSnapshot();
  });

  it('renders the bridge tab in the second place and no onramp with bridge as the initial', async () => {
    customRender(
      <ApePortal tabConfig={[PortalType.Swap, InitialPortalType.Bridge]} />,
      {},
    );
    const tab1 = screen.getByTestId('tab-0');
    const tab2 = screen.getByTestId('tab-1');
    const tab3 = screen.queryByTestId('tab-2');
    expect(tab1).toHaveTextContent(/swap/i);
    expect(tab2).toHaveTextContent(/bridge/i);
    expect(tab3).toBeNull();
    const bridgeClass = tab2.getAttribute('class');
    const swapClass = tab1.getAttribute('class');
    expect(swapClass).toMatch(new RegExp(UnselectedTabClass, 'i'));
    expect(bridgeClass).toMatch(SelectedTabClassRegex);
    expect(tab3).toBeNull();
  });

  it('renders all tabs in custom order', async () => {
    const config = setupConfig();
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
    };
    customRender(
      <AllTheProviders apeConfig={apeConfig} wagmiConfig={config}>
        <ApePortal
          tabConfig={[
            PortalType.OnRamp,
            InitialPortalType.Bridge,
            PortalType.Swap,
          ]}
        />
      </AllTheProviders>,
      {},
    );
    const tab1 = screen.getByTestId('tab-0');
    const tab2 = screen.getByTestId('tab-1');
    const tab3 = screen.getByTestId('tab-2');
    expect(tab1).toHaveTextContent(/onramp/i);
    expect(tab2).toHaveTextContent(/bridge/i);
    expect(tab3).toHaveTextContent(/swap/i);
  });

  it('renders all tabs in custom order with onramp as initial', async () => {
    const config = setupConfig();
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
    };
    customRender(
      <AllTheProviders apeConfig={apeConfig} wagmiConfig={config}>
        <ApePortal
          tabConfig={[
            InitialPortalType.OnRamp,
            PortalType.Swap,
            PortalType.Bridge,
          ]}
        />
      </AllTheProviders>,
      {},
    );
    const tab1 = screen.getByTestId('tab-0');
    const tab2 = screen.getByTestId('tab-1');
    const tab3 = screen.getByTestId('tab-2');
    expect(tab1).toHaveTextContent(/onramp/i);
    expect(tab2).toHaveTextContent(/swap/i);
    expect(tab3).toHaveTextContent(/bridge/i);
    const onrampClass = tab1.getAttribute('class');
    const bridgeClass = tab3.getAttribute('class');
    const swapClass = tab2.getAttribute('class');
    expect(swapClass).toMatch(UnselectedTabClassRegex);
    expect(bridgeClass).toMatch(UnselectedTabClassRegex);
    expect(onrampClass).toMatch(SelectedTabClassRegex);
  });

  it('renders the default tab correctly with onramp enabled', async () => {
    const config = setupConfig();
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
    };
    const portal = customRender(
      <AllTheProviders apeConfig={apeConfig} wagmiConfig={config}>
        <ApePortal />
      </AllTheProviders>,
      {
        chainId: undefined,
      },
    );
    expect(screen.getByRole('tab', { name: /bridge/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /swap/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /onramp/i })).toBeDefined();
    const bridgeTabButton = screen.getByRole('tab', {
      name: /bridge/i,
    });
    expect(bridgeTabButton).toBeDefined();
    expect(bridgeTabButton).toHaveAttribute(
      'data-headlessui-state',
      'selected',
    );
    const onrampContainer = screen.getByTestId('aw-onramp-container');
    expect(onrampContainer).toBeDefined();
    expect(within(onrampContainer).getByText(/connect wallet/i)).toBeDefined();
    expectSourceAndDestinationTokens('APE', 'APE');
    expect(portal).toMatchSnapshot();
  });

  it('renders source with native token from wallet', async () => {
    const { getState } = usePortalStore;
    const config = setupConfig(polygon as Chain);
    render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ApePortal />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.POLYGON,
        connector: config.connectors[0],
      });
    });

    expect(screen.getByRole('tab', { name: /bridge/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /swap/i })).toBeDefined();
    const bridgeTabButton = screen.getByRole('tab', {
      name: /bridge/i,
    });
    expect(bridgeTabButton).toBeDefined();
    expect(bridgeTabButton).toHaveAttribute(
      'data-headlessui-state',
      'selected',
    );
    expectSourceAndDestinationTokens('MATIC', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.POLYGON);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
  });

  it('when switching to swap tab use APE to ETH as the default pair when on ETH mainnet', async () => {
    const { getState } = usePortalStore;
    const config = setupConfig(mainnet);
    render(
      <AllTheProviders
        wagmiConfig={config}
        apeConfig={{
          ...defaultApeConfig,
        }}
      >
        <ApePortal />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: mainnet.id,
        connector: config.connectors[0],
      });
    });
    const swapTabButton = screen.getByRole('tab', {
      name: /swap/i,
    });
    expect(swapTabButton).toBeDefined();
    await userEvent.click(swapTabButton);
    expect(
      screen.queryByText(/no other tokens found on this chain to swap/i),
    ).toBeFalsy();
    expect(screen.getByText(/ETH/)).toBeDefined();
    expect(
      screen.getByRole('button', {
        name: /ethereum/i,
      }),
    ).toBeDefined();
    expectSourceAndDestinationTokens('ETH', 'APE');
    expect(
      screen.queryByRole('button', { name: 'ETH' }),
    ).not.toBeInTheDocument();
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ETHEREUM);
  });

  it('switches to swap tab and back to bridge stashes correctly', async () => {
    const { getState } = usePortalStore;
    customRender(<ApePortal />, {});
    const swapTabButton = screen.getByText(/swap/i);
    const bridgeTabButton = screen.getByRole('tab', {
      name: /bridge/i,
    });
    expectSourceAndDestinationTokens('APE', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    expect(screen.queryByText(/usdc/i)).toBeFalsy();
    await userEvent.click(swapTabButton);
    expect(screen.queryByText(/apechain/i)).toBeFalsy();
    expect(screen.queryByText(/ETH/)).toBeDefined();
    expect(
      screen.queryByRole('button', {
        name: /ETH/,
      }),
    ).toBeInTheDocument();
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ETHEREUM);
    await userEvent.click(bridgeTabButton);
    expect(screen.queryByText(/usdc/i)).toBeFalsy();
    expectSourceAndDestinationTokens('APE', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
  });

  /** ApeChain now has swap pairs, so we do not have a way to test this behavior anymore. */
  it.skip('shows an error modal when a chain does not have a swap pair', async () => {
    const { getState } = usePortalStore;
    customRender(<ApePortal />, {});
    const swapTabButton = screen.getByText(/swap/i);
    const switchTokenButton = screen.getByRole('button', {
      name: 'swap-source-destination',
    });
    expect(switchTokenButton).toBeDefined();
    expect(swapTabButton).toBeDefined();
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    // 1. Swap Ape to be the source token
    await userEvent.click(switchTokenButton);
    // 2. Click the swap tab button to switch tabs
    await userEvent.click(swapTabButton);
    expect(
      screen.getByText(/no other tokens found on this chain to swap/i),
    ).toBeDefined();
    const dismissButton = screen.getByRole('button', {
      name: 'Ok',
    });
    expect(dismissButton).toBeDefined();
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ETHEREUM);
  });

  it('portal uses DAI destination and amount token passed via prop', async () => {
    const { getState } = usePortalStore;
    customRender(
      <ApePortal
        tokenConfig={{
          defaultDestinationToken: TestTokens.PolyDai,
          defaultTokenAmount: {
            type: InputType.Destination,
            amount: '0.314',
          },
        }}
      />,
      {},
    );

    await waitFor(() => {
      expectSourceAndDestinationTokens('APE', 'DAI');
      expect(getState().destinationToken.amount).toBe('0.314');
      expect(getState().destinationToken.token.chainId).toBe(ChainId.POLYGON);
      expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    });
  });

  it('portal uses WETH source token passed via prop', async () => {
    const { getState } = usePortalStore;
    customRender(
      <ApePortal
        tokenConfig={{
          defaultSourceToken: TestTokens.OpWeth,
        }}
      />,
      {},
    );

    await waitFor(() => {
      expectSourceAndDestinationTokens('WETH', 'APE');
      expect(getState().sourceToken.token.chainId).toBe(ChainId.OPTIMISM);
      expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    });
  });

  it('portal remains on APE when token on unsupported chain is used as source token passed via prop', async () => {
    const { getState } = usePortalStore;
    customRender(
      <ApePortal
        tokenConfig={{
          defaultSourceToken: TestTokens.ZoraImagine,
        }}
      />,
      {},
    );

    await waitFor(() => {
      expectSourceAndDestinationTokens('APE', 'APE');
      expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
      expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    });
  });

  it('portal remains on APE when token on unsupported chain is used as destination token passed via prop', async () => {
    const { getState } = usePortalStore;
    customRender(
      <ApePortal
        tokenConfig={{
          defaultDestinationToken: TestTokens.ZoraImagine,
        }}
      />,
      {},
    );

    await waitFor(() => {
      expectSourceAndDestinationTokens('APE', 'APE');
      expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
      expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    });
  });

  it('portal uses both tokens when valid source and destination token passed via prop', async () => {
    const { getState } = usePortalStore;
    customRender(
      <ApePortal
        tokenConfig={{
          defaultSourceToken: TestTokens.PolyDai,
          defaultDestinationToken: TestTokens.OpWeth,
        }}
      />,
      {},
    );

    await waitFor(() => {
      expectSourceAndDestinationTokens('DAI', 'WETH');
      expect(getState().sourceToken.token.chainId).toBe(ChainId.POLYGON);
      expect(getState().destinationToken.token.chainId).toBe(ChainId.OPTIMISM);
    });
  });

  it('portal uses both tokens when they have matching chains and initial tab is swap', async () => {
    const { getState } = usePortalStore;
    customRender(
      <ApePortal
        tabConfig={[PortalType.Bridge, InitialPortalType.Swap]}
        tokenConfig={{
          defaultSourceToken: TestTokens.OpUsdt,
          defaultDestinationToken: TestTokens.OpWeth,
        }}
      />,
      {},
    );

    await waitFor(() => {
      expectSourceAndDestinationTokens('USDT', 'WETH');
      expect(getState().sourceToken.token.chainId).toBe(ChainId.OPTIMISM);
      expect(getState().destinationToken.token.chainId).toBe(ChainId.OPTIMISM);
    });
    const dismissButton = screen.queryByRole('button', {
      name: 'Ok',
    });
    expect(screen.getByText(/optimism/i)).toBeDefined();
    expect(dismissButton).toBeNull();
  });

  it('portal shows an error when tokens have NON-matching chains and initial tab is swap. Use defaults ETH -> APE ', async () => {
    const { getState } = usePortalStore;
    customRender(
      <ApePortal
        tabConfig={[PortalType.Bridge, InitialPortalType.Swap]}
        tokenConfig={{
          defaultSourceToken: TestTokens.PolyDai,
          defaultDestinationToken: TestTokens.OpWeth,
        }}
      />,
      {},
    );

    await waitFor(() => {
      expectSourceAndDestinationTokens('ETH', 'APE');
      expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
      expect(getState().destinationToken.token.chainId).toBe(ChainId.ETHEREUM);
    });
    const dismissButton = screen.queryByRole('button', {
      name: 'Ok',
    });
    expect(screen.getByText(/ethereum/i)).toBeDefined();
    expect(dismissButton).toBeDefined();
    expect(
      screen.getByText(
        /swap attempted with malformed token configuration. please contact support or try again./i,
      ),
    );
  });

  it('portal shows an error when tokens have unsupported chains (Arb) and initial tab is bridge. Use defaults APE -> APE', async () => {
    const { getState } = usePortalStore;
    customRender(
      <ApePortal
        tokenConfig={{
          defaultSourceToken: TestTokens.ZoraImagine,
          defaultDestinationToken: TestTokens.OpWeth,
        }}
      />,
      {},
    );

    await waitFor(() => {
      expectSourceAndDestinationTokens('APE', 'APE');
    });
    const dismissButton = screen.queryByRole('button', {
      name: 'Ok',
    });
    expect(dismissButton).toBeDefined();
    expect(screen.getByText(new RegExp(ERROR_MALFORMED_CONFIG, 'i')));
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
  });

  it('preserves the default pairings until user interaction', async () => {
    const { getState } = usePortalStore;
    customRender(<ApePortal />, {});
    const bridgeTabButton = screen.getByText(/bridge/i);
    const swapTabButton = screen.getByText(/swap/i);
    const switchTokenButton = screen.getByRole('button', {
      name: 'swap-source-destination',
    });
    expect(switchTokenButton).toBeDefined();
    expect(bridgeTabButton).toBeDefined();
    expect(swapTabButton).toBeDefined();
    // 1. Confirm default pairings for bridge tab
    await waitFor(() => {
      expectSourceAndDestinationTokens('APE', 'APE');
    });
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    // 2. Switch to swap tab and confirm default pairings
    await userEvent.click(swapTabButton);
    expect(screen.getByText(/ethereum/i)).toBeDefined();
    await waitFor(() => {
      expectSourceAndDestinationTokens('ETH', 'APE');
    });
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ETHEREUM);
    // 3. Switch back to bridge tab and confirm default pairings are preserved
    await userEvent.click(bridgeTabButton);
    await waitFor(() => {
      expectSourceAndDestinationTokens('APE', 'APE');
    });
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    // 4. Switch BACK to swap tab and switch tokens (user interaction with the tokens turns off default pairings)
    await userEvent.click(swapTabButton);
    // 5. Press the switch token button twice to interact but keep ETH as the source
    await userEvent.click(switchTokenButton);
    await userEvent.click(switchTokenButton);
    await userEvent.click(bridgeTabButton);
    // 6. Confirm default pairings are no longer preserved
    await waitFor(() => {
      expectSourceAndDestinationTokens('ETH', 'APE');
    });
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
  });

  it('does not allow the tokens to be swapped when destination token is locked ', async () => {
    customRender(
      <ApePortal
        tokenConfig={{
          defaultSourceToken: TestTokens.OpUsdt,
          defaultDestinationToken: TestTokens.OpWeth,
          lockDestinationToken: true,
        }}
      />,
      {},
    );
    const switchTokenButton = screen.getByRole('button', {
      name: 'swap-source-destination',
    });
    expect(switchTokenButton).toBeDefined();
    expect(switchTokenButton).toBeDisabled();
    await waitFor(() => {
      expectSourceAndDestinationTokens('USDT', 'WETH');
    });
    await userEvent.click(switchTokenButton);
    await waitFor(() => {
      expectSourceAndDestinationTokens('USDT', 'WETH');
    });
  });

  it('allows the tokens to be swapped when destination token is not locked ', async () => {
    customRender(
      <ApePortal
        tokenConfig={{
          defaultSourceToken: TestTokens.OpUsdt,
          defaultDestinationToken: TestTokens.OpWeth,
          lockDestinationToken: false,
        }}
      />,
      {},
    );
    const switchTokenButton = screen.getByRole('button', {
      name: 'swap-source-destination',
    });
    expect(switchTokenButton).toBeDefined();
    expect(switchTokenButton).toBeEnabled();
    await waitFor(() => {
      expectSourceAndDestinationTokens('USDT', 'WETH');
    });
    await userEvent.click(switchTokenButton);
    await waitFor(() => {
      expectSourceAndDestinationTokens('WETH', 'USDT');
    });
  });

  // This test seems incompatible with changes on 10-24-24 to restrict tokens - they are not
  //  populating properly in TokenSelector
  it.skip('preserves the stashed tokens as various interactions/errors occur', async () => {
    const { getState } = usePortalStore;
    customRender(<ApePortal />, {});
    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    const bridgeTabButton = screen.getByText(/bridge/i);
    const swapTabButton = screen.getByText(/swap/i);
    const switchTokenButton = screen.getByRole('button', {
      name: 'swap-source-destination',
    });
    // 1. Switch to the swap tab
    await userEvent.click(swapTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    // 2. Change the source token to ETH DAI
    const sourceTokenButton = within(
      screen.getByTestId('token-input-source'),
    ).getByRole('button', {
      name: /eth/i,
    });
    await userEvent.click(sourceTokenButton);
    const daiButton = screen.getByRole('button', {
      name: /dai/i,
    });
    await userEvent.click(daiButton);
    // 3. Confirm the source token is now DAI
    expect(
      within(screen.getByTestId('token-input-source')).getByRole('button', {
        name: /dai/i,
      }),
    ).toBeInTheDocument();
    // 4. Switch back to the bridge tab
    await userEvent.click(bridgeTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    // 5. Switch tokens and confirm APE APE is now the source
    await userEvent.click(switchTokenButton);
    expect(getState().sourceToken.token.chainId).toBe(ChainId.APE);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ETHEREUM);
    // 6. Switch back to the swap tab and expect _no_ error modal
    await userEvent.click(swapTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(
      screen.queryByText(/no other tokens found on this chain to swap/i),
    ).toBeNull();
    // 7. Switch chain to Optimism
    const chainButton = screen.getByRole('button', {
      name: /apechain/i,
    });
    await userEvent.click(chainButton);
    const optimismButton = screen.getByRole('button', {
      name: /optimism/i,
    });
    await userEvent.click(optimismButton);
    expect(getState().sourceToken.token.chainId).toBe(ChainId.OPTIMISM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.OPTIMISM);
    // 8. Switch back to the bridge tab and confirm DAI is the destination token
    await userEvent.click(bridgeTabButton);
    expect(
      within(screen.getByTestId('token-input-destination')).getByRole(
        'button',
        {
          name: /dai/i,
        },
      ),
    ).toBeInTheDocument();
    expectSourceAndDestinationTokens('ETH', 'DAI');
  });

  it('shows Poly MATIC as source on bridge and MATIC to USDC on swap when user wallet is on Polygon', async () => {
    const { getState } = usePortalStore;
    const config = setupConfig(polygon);
    render(
      <AllTheProviders
        wagmiConfig={config}
        apeConfig={{
          ...defaultApeConfig,
        }}
      >
        <ApePortal />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.POLYGON,
        connector: config.connectors[0],
      });
    });

    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    const bridgeTabButton = screen.getByText(/bridge/i);
    const swapTabButton = screen.getByText(/swap/i);
    expectSourceAndDestinationTokens('MATIC', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.POLYGON);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    // 1. Switch to the swap tab
    await userEvent.click(swapTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    // 2. Expect our hooks changed tokens to source MATIC -> dest USDC
    expectSourceAndDestinationTokens('MATIC', 'USDC');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.POLYGON);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.POLYGON);
    // 4. Switch back to the bridge tab
    await userEvent.click(bridgeTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expectSourceAndDestinationTokens('MATIC', 'APE');
  });

  it('shows Ethereum ETH as source on bridge and ETH to APE on swap when user wallet is on Ethereum', async () => {
    const { getState } = usePortalStore;
    const config = setupConfig(mainnet);
    render(
      <AllTheProviders
        wagmiConfig={config}
        apeConfig={{
          ...defaultApeConfig,
        }}
      >
        <ApePortal />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.ETHEREUM,
        connector: config.connectors[0],
      });
    });

    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    const bridgeTabButton = screen.getByText(/bridge/i);
    const swapTabButton = screen.getByText(/swap/i);
    expectSourceAndDestinationTokens('APE', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    await userEvent.click(swapTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expectSourceAndDestinationTokens('ETH', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ETHEREUM);
    await userEvent.click(bridgeTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expectSourceAndDestinationTokens('APE', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
  });

  it('shows Arbitum ETH as source on bridge and ETH to ARB on swap when user wallet is on Arbitum', async () => {
    const { getState } = usePortalStore;
    const config = setupConfig(arbitrum);
    render(
      <AllTheProviders
        wagmiConfig={config}
        apeConfig={{
          ...defaultApeConfig,
        }}
      >
        <ApePortal />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.ARBITRUM,
        connector: config.connectors[0],
      });
    });

    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    const bridgeTabButton = screen.getByText(/bridge/i);
    const swapTabButton = screen.getByText(/swap/i);
    expectSourceAndDestinationTokens('ETH', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ARBITRUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    await userEvent.click(swapTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expectSourceAndDestinationTokens('ETH', 'ARB');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ARBITRUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ARBITRUM);
    await userEvent.click(bridgeTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expectSourceAndDestinationTokens('ETH', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ARBITRUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
  });

  it('shows Ethereum APE as source on bridge and Ethereum APE to ETH on swap when user wallet is on ApeChain', async () => {
    const { getState } = usePortalStore;
    const config = setupConfig(apeChain);
    render(
      <AllTheProviders
        wagmiConfig={config}
        apeConfig={{
          ...defaultApeConfig,
        }}
      >
        <ApePortal />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.APE,
        connector: config.connectors[0],
      });
    });

    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    const bridgeTabButton = screen.getByText(/bridge/i);
    const swapTabButton = screen.getByText(/swap/i);
    expectSourceAndDestinationTokens('APE', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    await userEvent.click(swapTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expectSourceAndDestinationTokens('APE', 'ETH');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ETHEREUM);
    await userEvent.click(bridgeTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expectSourceAndDestinationTokens('APE', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
  });

  it('shows defaults when there is no wallet connected', async () => {
    const { getState } = usePortalStore;
    const config = setupConfig();
    render(
      <AllTheProviders
        wagmiConfig={config}
        apeConfig={{
          ...defaultApeConfig,
        }}
      >
        <ApePortal />
      </AllTheProviders>,
    );
    expect(screen.getByText(/connect wallet/i)).toBeDefined();
    const bridgeTabButton = screen.getByText(/bridge/i);
    const swapTabButton = screen.getByText(/swap/i);
    expectSourceAndDestinationTokens('APE', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    // 1. Switch to the swap tab
    await userEvent.click(swapTabButton);
    // 2. Expect our hooks changed tokens source ETH -> dest DAI
    expectSourceAndDestinationTokens('ETH', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ETHEREUM);
    // 4. Switch back to the bridge tab
    await userEvent.click(bridgeTabButton);
    expectSourceAndDestinationTokens('APE', 'APE');
  });

  // This test seems incompatible with changes on 10-24-24 to restrict tokens - they are not
  //  populating properly in TokenSelector
  it.skip('preserves the selected token in state after going to onramp', async () => {
    const { getState } = usePortalStore;
    customRender(<ApePortal />, {
      apeConfig: {
        ...defaultApeConfig,
        enableOnramp: true,
      },
    });
    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    const onrampTab = screen.getByTestId('tab-2');
    const swapTabButton = screen.getByText(/swap/i);
    const onrampTabButton = screen.getByText(/^onramp$/i);
    // 1. Switch to the swap tab
    await userEvent.click(swapTabButton);
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    // 2. Change the source token to ETH DAI
    const sourceTokenButton = within(
      screen.getByTestId('token-input-source'),
    ).getByRole('button', {
      name: /eth/i,
    });
    await userEvent.click(sourceTokenButton);
    const daiButton = screen.getByRole('button', {
      name: /^dai$/i,
    });
    await userEvent.click(daiButton);
    // 3. Confirm the source token is now DAI
    expect(
      within(screen.getByTestId('token-input-source')).getByRole('button', {
        name: /dai/i,
      }),
    ).toBeInTheDocument();
    // 4. Switch to the onramp tab
    await userEvent.click(onrampTabButton);
    // 5. Verify we are on the onramp tab
    await waitFor(() => {
      expect(screen.getByTestId(/aw-onramp-halliday/i)).toBeDefined();
    });
    expect(onrampTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    // 5. Switch back to the swap tab
    await userEvent.click(swapTabButton);
    // 6. Confirm the source token is still DAI
    expect(
      within(screen.getByTestId('token-input-source')).getByRole('button', {
        name: /dai/i,
      }),
    ).toBeInTheDocument();
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ETHEREUM);
  });

  it('renders to swap tab with default tokens when hash is set when user is on ETH mainnet', async () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      hash: '#swap',
    });
    const { getState } = usePortalStore;
    const config = setupConfig();
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
      useHashRouter: true,
    };
    customRender(
      <AllTheProviders apeConfig={apeConfig} wagmiConfig={config}>
        <ApePortal />
      </AllTheProviders>,
      {},
    );
    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(
      screen.getByRole('button', {
        name: /ethereum/i,
      }),
    ).toBeDefined();
    expectSourceAndDestinationTokens('ETH', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ETHEREUM);
  });

  it('renders to bridge tab with default tokens when hash is set when user is on ETH mainnet', async () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      hash: '#bridge',
    });
    const { getState } = usePortalStore;
    const config = setupConfig();
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
      useHashRouter: true,
    };
    customRender(
      <AllTheProviders apeConfig={apeConfig} wagmiConfig={config}>
        <ApePortal />
      </AllTheProviders>,
      {},
    );
    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    expect(bridgeTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(
      screen.queryByRole('button', {
        name: /ethereum/i,
      }),
    ).toBeNull();
    expectSourceAndDestinationTokens('APE', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ETHEREUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
  });

  it('renders to swap tab with default tokens when hash is set when user is on Apechain', async () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      hash: '#swap',
    });
    const { getState } = usePortalStore;
    const config = setupConfig(apeChain);
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
      useHashRouter: true,
    };
    render(
      <AllTheProviders wagmiConfig={config} apeConfig={apeConfig}>
        <ApePortal />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.APE,
        connector: config.connectors[0],
      });
    });

    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(
      screen.getByRole('button', {
        name: /apechain/i,
      }),
    ).toBeDefined();
    expectSourceAndDestinationTokens('APE', 'APE-USD');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.APE);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
  });

  it('renders to swap tab with default tokens when hash is set when user is on Polygon', async () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      hash: '#swap',
    });
    const { getState } = usePortalStore;
    const config = setupConfig(polygon);
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
      useHashRouter: true,
    };
    render(
      <AllTheProviders wagmiConfig={config} apeConfig={apeConfig}>
        <ApePortal />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.POLYGON,
        connector: config.connectors[0],
      });
    });

    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(
      screen.getByRole('button', {
        name: /polygon/i,
      }),
    ).toBeDefined();
    expectSourceAndDestinationTokens('MATIC', 'USDC');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.POLYGON);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.POLYGON);
  });

  it('ensures source token passed via props takes precedence over the users wallet on swap', async () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      hash: '#swap',
    });
    const { getState } = usePortalStore;
    const config = setupConfig();
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
      useHashRouter: true,
    };
    render(
      <AllTheProviders wagmiConfig={config} apeConfig={apeConfig}>
        <ApePortal
          tokenConfig={{
            defaultSourceToken: TestTokens.OpWeth,
          }}
        />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.POLYGON,
        connector: config.connectors[0],
      });
    });

    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(
      screen.getByRole('button', {
        name: /optimism/i,
      }),
    ).toBeDefined();
    expectSourceAndDestinationTokens('WETH', 'ETH');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.OPTIMISM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.OPTIMISM);
  });

  it('ensures destination token passed via props takes precedence over the users wallet on swap', async () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      hash: '#swap',
    });
    const { getState } = usePortalStore;
    const config = setupConfig();
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
      useHashRouter: true,
    };
    render(
      <AllTheProviders wagmiConfig={config} apeConfig={apeConfig}>
        <ApePortal
          tokenConfig={{
            defaultDestinationToken: TestTokens.OpWeth,
          }}
        />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.POLYGON,
        connector: config.connectors[0],
      });
    });

    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(
      screen.getByRole('button', {
        name: /optimism/i,
      }),
    ).toBeDefined();
    expectSourceAndDestinationTokens('ETH', 'WETH');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.OPTIMISM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.OPTIMISM);
  });

  it('ensures source token passed via props takes precedence over the users wallet on bridge', async () => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      hash: '#bridge',
    });
    const { getState } = usePortalStore;
    const config = setupConfig();
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
      useHashRouter: true,
    };
    render(
      <AllTheProviders wagmiConfig={config} apeConfig={apeConfig}>
        <ApePortal
          tokenConfig={{
            defaultSourceToken: TestTokens.OpWeth,
          }}
        />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.POLYGON,
        connector: config.connectors[0],
      });
    });

    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    expect(bridgeTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expectSourceAndDestinationTokens('WETH', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.OPTIMISM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
  });

  it.skip('ensures swap destination token passed via hash takes precedence over the users wallet and defaults', async () => {
    // TODO: Finish as a part of APEW-290
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      hash: '#swap/42161/0x912CE59144191C1204E64559FE8253a0e49E6548',
    });
    const { getState } = usePortalStore;
    const config = setupConfig();
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
      useHashRouter: true,
    };
    render(
      <AllTheProviders wagmiConfig={config} apeConfig={apeConfig}>
        <ApePortal
          tokenConfig={{
            defaultDestinationToken: TestTokens.OpWeth,
          }}
        />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.POLYGON,
        connector: config.connectors[0],
      });
    });
    const bridgeTab = screen.getByTestId('tab-0');
    const swapTab = screen.getByTestId('tab-1');
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    expect(swapTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(
      screen.getByRole('button', {
        name: /zora/i,
      }),
    ).toBeDefined();
    expectSourceAndDestinationTokens('ETH', 'ARB');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ARBITRUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.ARBITRUM);
  });

  it('locks destination token on the bridge after going to onramp', async () => {
    const { getState } = usePortalStore;
    const config = setupConfig(arbitrum);
    render(
      <AllTheProviders
        wagmiConfig={config}
        apeConfig={{
          ...defaultApeConfig,
          enableOnramp: true,
        }}
      >
        <ApePortal
          tokenConfig={{
            lockDestinationToken: true,
          }}
        />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.ARBITRUM,
        connector: config.connectors[0],
      });
    });
    const bridgeTab = screen.getByTestId('tab-0');
    const onrampTab = screen.getByTestId('tab-2');
    const onrampTabButton = screen.getByText(/onramp/i);
    expectSourceAndDestinationTokens('ETH', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ARBITRUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    // 1. The destination token should be locked and the switch button disabled
    const switchTokenButton = screen.getByRole('button', {
      name: 'swap-source-destination',
    });
    expect(switchTokenButton).toBeDefined();
    expect(switchTokenButton).toBeDisabled();
    const destinationTokenButton = within(
      screen.getByTestId('token-input-destination'),
    ).getByRole('button', {
      name: /ape/i,
    });
    expect(destinationTokenButton).toBeDefined();
    expect(destinationTokenButton).toBeDisabled();
    // 2. Switch to the onramp tab
    await userEvent.click(onrampTabButton);
    // 3. Verify we are on the onramp tab
    await waitFor(() => {
      expect(screen.getByTestId(/aw-onramp-halliday/i)).toBeDefined();
    });
    expect(onrampTab.getAttribute('class')).toMatch(SelectedTabClassRegex);
    expect(bridgeTab.getAttribute('class')).toMatch(UnselectedTabClassRegex);
    // 4. Switch back to the bridge tab
    await userEvent.click(bridgeTab);
    // 5. Confirm the destination token is still locked and is the same
    expect(destinationTokenButton).toBeDisabled();
    expect(switchTokenButton).toBeDisabled();
    expectSourceAndDestinationTokens('ETH', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ARBITRUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    // 6. Switch to the swap tab for good measure
    const swapTabButton = screen.getByText(/swap/i);
    await userEvent.click(swapTabButton);
    expectSourceAndDestinationTokens('ETH', 'ARB');
    // 7. Ensure the chain picker and destination token are disabled
    expect(switchTokenButton).toBeDisabled();
    expect(destinationTokenButton).toBeDisabled();
    const chainSelectorButton = screen.getByRole('button', {
      name: /arbitrum/i,
    });
    expect(chainSelectorButton).toBeDisabled();
  });

  it('does not update the locks destination token when double clicking the bridge tab button', async () => {
    const { getState } = usePortalStore;
    const config = setupConfig(arbitrum);
    render(
      <AllTheProviders
        wagmiConfig={config}
        apeConfig={{
          ...defaultApeConfig,
          enableOnramp: true,
        }}
      >
        <ApePortal
          tokenConfig={{
            lockDestinationToken: true,
          }}
        />
      </AllTheProviders>,
    );

    await act(async () => {
      await connect(config, {
        chainId: ChainId.ARBITRUM,
        connector: config.connectors[0],
      });
    });
    const bridgeTab = screen.getByTestId('tab-0');
    expectSourceAndDestinationTokens('ETH', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ARBITRUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    // 1. The destination token should be locked and the switch button disabled
    const switchTokenButton = screen.getByRole('button', {
      name: 'swap-source-destination',
    });
    expect(switchTokenButton).toBeDefined();
    expect(switchTokenButton).toBeDisabled();
    const destinationTokenButton = within(
      screen.getByTestId('token-input-destination'),
    ).getByRole('button', {
      name: /ape/i,
    });
    expect(destinationTokenButton).toBeDefined();
    expect(destinationTokenButton).toBeDisabled();
    // 2. Click the bridge tab while being on the bridge tab
    await userEvent.click(bridgeTab);
    // 3. Verify nothing changed
    expectSourceAndDestinationTokens('ETH', 'APE');
    expect(getState().sourceToken.token.chainId).toBe(ChainId.ARBITRUM);
    expect(getState().destinationToken.token.chainId).toBe(ChainId.APE);
    expect(switchTokenButton).toBeDefined();
    expect(switchTokenButton).toBeDisabled();
    expect(destinationTokenButton).toBeDefined();
    expect(destinationTokenButton).toBeDisabled();
  });
});
