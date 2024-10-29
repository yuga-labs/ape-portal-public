import { act, render, screen } from '@testing-library/react';
import { describe } from 'vitest';
import { ToolBar } from '../../../lib/components/ui/ToolBar';
import { AllTheProviders, customRender } from '../../index';
import { defaultApeConfig, setupConfig, TEST_ACCOUNT } from '../../utils';
import { connect } from 'wagmi/actions';
import { apeChain } from 'viem/chains';

describe('components/ui/ToolBar', () => {
  test('should render toolbar with default values', () => {
    const { container } = customRender(<ToolBar />, { chainId: undefined });
    expect(screen.getByRole('link', { name: 'Terms' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Support' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Transactions' })).toBeNull();
    expect(container).toMatchSnapshot();
  });

  test('should render toolbar with connected wallet', async () => {
    const config = setupConfig();
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ToolBar />
      </AllTheProviders>,
    );
    await act(async () => {
      await connect(config, {
        connector: config.connectors[0],
      });
    });
    expect(
      screen.getByRole('link', { name: 'Transactions' }),
    ).toBeInTheDocument();

    const anchor = screen
      .getByRole('link', { name: 'Transactions' })
      .closest('a');
    expect(anchor).toHaveProperty(
      'href',
      `https://www.decentscan.xyz/?address=${TEST_ACCOUNT.address}`,
    );

    expect(actionButton).toMatchSnapshot();
  });

  test('should allow user to Add Network when connected to a different chain', async () => {
    const config = setupConfig();
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ToolBar />
      </AllTheProviders>,
    );
    await act(async () => {
      await connect(config, {
        connector: config.connectors[0],
      });
    });
    expect(
      screen.getByRole('button', { name: 'Add Network' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Add Network' })).toBeEnabled();
    expect(actionButton).toMatchSnapshot();
  });

  test('should not allow user to Add Network when connected to ApeChain', async () => {
    const config = setupConfig(apeChain);
    const actionButton = render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <ToolBar />
      </AllTheProviders>,
    );
    await act(async () => {
      await connect(config, {
        connector: config.connectors[0],
      });
    });
    expect(
      screen.getByRole('button', { name: 'Add Network' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Add Network' })).toBeDisabled();
    expect(actionButton).toMatchSnapshot();
  });
});
