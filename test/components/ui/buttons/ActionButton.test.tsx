import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import {
  ActionButton,
  ActionButtonProps,
} from '../../../../lib/components/ui/buttons/ActionButton';
import { PortalType } from '../../../../lib/utils/constants';
import { AllTheProviders, customRender } from '../../../index';
import { defaultApeConfig, setupConfig } from '../../../utils';
import { connect } from 'wagmi/actions';
import {
  defaultBridgeSourceToken,
  usePortalStore,
} from '../../../../lib/store/usePortalStore.ts';
import { useBridgeStore } from '../../../../lib/store/useBridgeStore';
import {
  BridgeError,
  HIGH_IMPACT_ERROR,
  humanReadableBridgeError,
} from '../../../../lib/types';
import { TokenTransactionData } from '../../../../lib/classes/TokenTransactionData.ts';
import { polygon } from 'wagmi/chains';

const getProps = ({
  portal = PortalType.Swap,
  disabled = false,
} = {}): ActionButtonProps => ({
  disabled,
  portal: portal,
  action: vi.fn(),
});

const defaultNetworkId = defaultBridgeSourceToken.chainId;
const setupConfigForDefaultNetwork = () => {
  const config = setupConfig();
  config.chains[0].id = defaultNetworkId;
  return config;
};

const resetStore = () => {
  const { getState, setState } = usePortalStore;
  const initialState = getState();
  setState(initialState);
};

describe('components/ui/buttons/ActionButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  test('should say Connect Wallet when not wallet is not connected', async () => {
    const actionButton = customRender(<ActionButton {...getProps()} />, {
      chainId: undefined,
    });
    expect(screen.getByText('Connect Wallet')).toBeDefined();
    expect(screen.getByText('Connect Wallet')).toBeEnabled();
    expect(actionButton).toMatchSnapshot();
  });
  test('should be enabled in Connect Wallet state even if prop disabled=true', async () => {
    const actionButton = customRender(
      <ActionButton {...getProps({ disabled: true })} />,
      {
        chainId: undefined,
      },
    );
    expect(screen.getByText('Connect Wallet')).toBeDefined();
    expect(screen.getByText('Connect Wallet')).toBeEnabled();
    expect(actionButton).toMatchSnapshot();
  });
  test('should say Switch Network when wallet is connected to wrong network', async () => {
    const config = setupConfig(polygon);
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ActionButton {...getProps({ disabled: true })} />
      </AllTheProviders>,
    );
    await act(async () => {
      await connect(config, {
        chainId: polygon.id,
        connector: config.connectors[0],
      });
    });
    const defaultNetworkId = defaultBridgeSourceToken.chainId;
    expect(
      screen.getByText(`Switch Network to ${defaultNetworkId}`),
    ).toBeDefined();
    expect(
      screen.getByText(`Switch Network to ${defaultNetworkId}`),
    ).toBeEnabled();
    expect(actionButton).toMatchSnapshot();
  });
  test('should say Swap when wallet is connected to correct network', async () => {
    // Set source token amount to trigger button text change from `Enter Amount`
    usePortalStore.setState({
      sourceToken: new TokenTransactionData(defaultBridgeSourceToken, '1'),
    });
    const config = setupConfigForDefaultNetwork();
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ActionButton {...getProps()} />
      </AllTheProviders>,
    );
    await act(async () => {
      await connect(config, {
        chainId: defaultNetworkId,
        connector: config.connectors[0],
      });
    });
    expect(screen.getByText('Swap')).toBeDefined();
    expect(actionButton).toMatchSnapshot();
  });
  test('should say Enter Amount before source and destination token amounts are set', async () => {
    const config = setupConfigForDefaultNetwork();
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ActionButton {...getProps()} />
      </AllTheProviders>,
    );
    await act(async () => {
      await connect(config, {
        chainId: defaultNetworkId,
        connector: config.connectors[0],
      });
    });
    expect(screen.getByText('Enter Amount')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Enter Amount' })).toBeDisabled();
    expect(actionButton).toMatchSnapshot();
  });
  test('should say Bridge when wallet is connected to correct network', async () => {
    // Set source token amount to trigger button text change from `Enter Amount`
    usePortalStore.setState({
      sourceToken: new TokenTransactionData(defaultBridgeSourceToken, '1'),
    });
    const config = setupConfig();
    config.chains[0].id = defaultNetworkId;
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ActionButton {...getProps({ portal: PortalType.Bridge })} />
      </AllTheProviders>,
    );
    await act(async () => {
      await connect(config, {
        chainId: defaultNetworkId,
        connector: config.connectors[0],
      });
    });
    expect(screen.getByText('Bridge')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Bridge' })).toBeEnabled();
    expect(actionButton).toMatchSnapshot();
  });
  test('should be enabled if wallet is not connected', async () => {
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={setupConfig()}>
        <ActionButton {...getProps({ portal: PortalType.Bridge })} />
      </AllTheProviders>,
    );
    expect(
      screen.getByRole('button', { name: 'Connect Wallet' }),
    ).toBeEnabled();
    expect(actionButton).toMatchSnapshot();
  });
  test('should be disabled when disabled prop is true and wallet is connected', async () => {
    const config = setupConfigForDefaultNetwork();
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ActionButton
          {...getProps({ portal: PortalType.Bridge, disabled: true })}
          disabled={true}
        />
      </AllTheProviders>,
    );
    await act(async () => {
      await connect(config, {
        chainId: defaultNetworkId,
        connector: config.connectors[0],
      });
    });
    expect(screen.getByRole('button', { name: 'Enter Amount' })).toBeDisabled();
    expect(actionButton).toMatchSnapshot();
  });
  test('should be disabled when store waitingForTokenApprovalTxConfirm is true', async () => {
    const config = setupConfigForDefaultNetwork();
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ActionButton {...getProps()} />
      </AllTheProviders>,
    );
    await act(async () => {
      useBridgeStore.setState({
        waitingForTokenApprovalTxConfirm: true,
      });

      await connect(config, {
        chainId: defaultNetworkId,
        connector: config.connectors[0],
      });
    });
    expect(
      screen.getByRole('button', { name: 'Transaction is confirming...' }),
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Transaction is confirming...' }),
    ).toBeDisabled();
    expect(actionButton).toMatchSnapshot();
  });
  test.each(Object.entries(humanReadableBridgeError))(
    'should be disabled when bridgeError is set to %s',
    async (key, value) => {
      const config = setupConfigForDefaultNetwork();
      const actionButton = render(
        <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
          <ActionButton {...getProps()} />
        </AllTheProviders>,
      );
      await act(async () => {
        useBridgeStore.setState({
          bridgeError: key as BridgeError,
        });

        await connect(config, {
          chainId: defaultNetworkId,
          connector: config.connectors[0],
        });
      });
      expect(
        screen.getByRole('button', {
          name: value,
        }),
      ).toBeDefined();
      expect(
        screen.getByRole('button', {
          name: value,
        }),
      ).toBeDisabled();
      expect(actionButton).toMatchSnapshot();
    },
  );
  test('should say Approve token for spend when isTokenApprovalRequired is true', async () => {
    // Set source token amount to trigger button text change from `Enter Amount`
    usePortalStore.setState({
      sourceToken: new TokenTransactionData(defaultBridgeSourceToken, '1'),
    });
    const config = setupConfigForDefaultNetwork();
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ActionButton {...getProps()} />
      </AllTheProviders>,
    );
    await act(async () => {
      useBridgeStore.setState({
        isTokenApprovalRequired: true,
      });

      await connect(config, {
        chainId: defaultNetworkId,
        connector: config.connectors[0],
      });
    });
    expect(screen.getByText('Approve token for spend')).toBeDefined();
    expect(screen.getByText('Approve token for spend')).toBeEnabled();
    expect(actionButton).toMatchSnapshot();
  });
  test('should say Waiting for signature when waitingForSignature is true', async () => {
    // Set source token amount to trigger button text change from `Enter Amount`
    usePortalStore.setState({
      sourceToken: new TokenTransactionData(defaultBridgeSourceToken, '1'),
    });
    const config = setupConfigForDefaultNetwork();
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ActionButton {...getProps()} />
      </AllTheProviders>,
    );
    await act(async () => {
      useBridgeStore.setState({
        waitingForSignature: true,
      });

      await connect(config, {
        chainId: defaultNetworkId,
        connector: config.connectors[0],
      });
    });
    expect(screen.getByText('Waiting for signature')).toBeDefined();
    expect(screen.getByText('Waiting for signature')).toBeEnabled();
    expect(actionButton).toMatchSnapshot();
  });
  test('should show price impact warning when bridgeErrorMessage is set', async () => {
    // Set source token amount to trigger button text change from `Enter Amount`
    usePortalStore.setState({
      sourceToken: new TokenTransactionData(defaultBridgeSourceToken, '1'),
    });
    const config = setupConfigForDefaultNetwork();
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ActionButton {...getProps()} />
      </AllTheProviders>,
    );
    await act(async () => {
      useBridgeStore.setState({
        highImpactError: true,
      });

      await connect(config, {
        chainId: defaultNetworkId,
        connector: config.connectors[0],
      });
    });
    expect(
      screen.getByRole('button', { name: HIGH_IMPACT_ERROR }),
    ).toBeDisabled();
    expect(actionButton).toMatchSnapshot();
  });

  test('should show price impact warning even if token requires approval', async () => {
    // Set source token amount to trigger button text change from `Enter Amount`
    usePortalStore.setState({
      sourceToken: new TokenTransactionData(defaultBridgeSourceToken, '1'),
    });
    const config = setupConfigForDefaultNetwork();
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ActionButton {...getProps()} />
      </AllTheProviders>,
    );
    await act(async () => {
      useBridgeStore.setState({
        highImpactError: true,
        isTokenApprovalRequired: true,
      });

      await connect(config, {
        chainId: defaultNetworkId,
        connector: config.connectors[0],
      });
    });
    expect(
      screen.getByRole('button', { name: HIGH_IMPACT_ERROR }),
    ).toBeDisabled();
    expect(screen.queryByText('Approve token for spend')).toBeNull();
    expect(actionButton).toMatchSnapshot();
  });
});
