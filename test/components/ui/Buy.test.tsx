import { act, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Buy } from '../../../lib/components/buy/buy';
import { AllTheProviders, customRender } from '../../index';
import { defaultApeConfig, setupConfig } from '../../utils';
import { connect } from 'wagmi/actions';
import { ApeConfig, PortalType } from '../../../lib';

describe('components/buy/Buy', () => {
  test('should hide iframe when wallet is not connected', () => {
    customRender(<Buy portalType={PortalType.OnRamp} />, {
      chainId: undefined,
    });
    const iframe = screen.queryByTestId('aw-onramp-halliday');
    expect(iframe).toHaveClass('aw-hidden');
    expect(
      screen.getByText(/please connect your wallet to/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/proceed with the onramp./i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Connect Wallet' }),
    ).toBeVisible();
  });

  test('should show iframe when wallet is connected', async () => {
    const config = setupConfig();
    render(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <Buy portalType={PortalType.OnRamp} />
      </AllTheProviders>,
    );
    await act(async () => {
      await connect(config, {
        connector: config.connectors[0],
      });
    });
    const iframe = screen.getByTestId('aw-onramp-halliday');
    expect(iframe).not.toHaveClass('aw-hidden');
    // Ensure connect wallet elements are not present
    expect(
      screen.queryByText('Connect your wallet to proceed.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Connect Wallet' }),
    ).not.toBeInTheDocument();
  });

  test('should show error when onramp is not enabled', () => {
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: false,
    };
    customRender(<Buy />, { apeConfig });
    expect(screen.getByText('Onramp is not enabled.')).toBeVisible();
  });

  test('show not show error if onramp is enabled', () => {
    const apeConfig: ApeConfig = {
      ...defaultApeConfig,
      enableOnramp: true,
    };
    customRender(<Buy />, { apeConfig });
    expect(
      screen.queryByText('Onramp is not enabled.'),
    ).not.toBeInTheDocument();
  });
});
