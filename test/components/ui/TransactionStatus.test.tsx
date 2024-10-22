import { beforeEach, describe, expect, test } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionStatus from '../../../lib/components/ui/TransactionStatus.tsx';
import { useBridgeStore } from '../../../lib/store/useBridgeStore.ts';
import { usePortalStore } from '../../../lib/store/usePortalStore.ts';
import { BridgeTransactionData } from '../../../lib/classes/BridgeTransactionData.ts';
import { AllTheProviders, customRender, setupConfig } from '../../index';
import { defaultApeConfig } from '../../utils.ts';
import { useDecentScan } from '@decent.xyz/box-hooks';

const TEST_TX_HASH = '0x1234567890123456789012345678901234567890';

// This mock is additive to the empty mock in test/index.tsx.
const mockedDecentScan = vi.mocked(useDecentScan);

describe('components/ui/TransactionStatus', () => {
  beforeEach(() => {
    userEvent.setup();
    useBridgeStore.setState({
      bridgeTransactionHash: TEST_TX_HASH,
    });

    mockedDecentScan.mockReturnValue({
      data: {
        status: 'Processing',
        transaction: {
          status: 'Processing',
        },
      },
      isLoading: false,
      error: new Error('Failed to fetch transaction'),
      isValidating: false,
    });
  });

  test('should render status with bridge copy', async () => {
    const isSwap = false;
    const transactionStatus = render(<TransactionStatus isSwap={isSwap} />);
    const viewTransactionButton = screen.getByText(/view transaction/i);
    const viewTransactionLink = viewTransactionButton.closest('a');
    const bridgingText = screen.getByText(/bridging/i);
    // Match testnet and mainnet
    const chainText = screen.getByText(/^apechain.*/i);
    const coinTextSource = screen.getAllByText(/0 ape/i);
    const coinTextDestination = screen.getAllByText(/0 ape/i);
    const supportText = screen.getByText(/bridge support/i);

    await act(async () => {
      await userEvent.click(viewTransactionButton);
    });

    // Estimated time should be hidden since it is undefined
    const estimatedTimeElement = screen.queryByText(/estimated time/i);
    const parentElement = estimatedTimeElement?.parentElement;
    expect(parentElement).toBeDefined();
    expect(parentElement?.tagName).toBe('DIV');
    expect(parentElement?.classList.contains('aw-invisible')).toBe(true);

    expect(viewTransactionLink).toHaveProperty('target', '_blank');
    expect(viewTransactionLink).toHaveProperty(
      'href',
      `https://www.decentscan.xyz/?chainId=1&txHash=${TEST_TX_HASH}`,
    );
    expect(viewTransactionButton).toBeVisible();
    expect(bridgingText).toBeVisible();
    expect(chainText).toBeVisible();
    expect(coinTextSource).toBeDefined();
    expect(coinTextDestination).toBeDefined();
    expect(supportText).toBeDefined();
    expect(transactionStatus).toMatchSnapshot();
  });

  test('estimated time is visible in waiting for signature state', async () => {
    useBridgeStore.setState({
      waitingForSignature: true,
    });
    const bridgeTransactionData = new BridgeTransactionData();
    bridgeTransactionData.estimatedTxTime = 30;
    usePortalStore.setState({
      bridgeTransactionData,
    });
    const isSwap = false;
    const transactionStatus = customRender(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={setupConfig()}>
        <TransactionStatus isSwap={isSwap} />
      </AllTheProviders>,
      {
        chainId: undefined,
      },
    );
    const estimatedTimeElement = screen.getByText(/estimated time/i);
    const actualTimeElement = screen.getByText(/30 seconds/i);
    const parentElement = estimatedTimeElement.parentElement;
    expect(parentElement).toBeDefined();
    expect(actualTimeElement).toBeDefined();
    expect(parentElement?.tagName).toBe('DIV');
    expect(parentElement?.classList.contains('aw-invisible')).toBe(false);
    expect(transactionStatus).toMatchSnapshot();
  });

  test('estimated time is visible in processing state', async () => {
    const bridgeTransactionData = new BridgeTransactionData();
    bridgeTransactionData.estimatedTxTime = 30;
    usePortalStore.setState({
      bridgeTransactionData,
    });
    const isSwap = false;
    const transactionStatus = customRender(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={setupConfig()}>
        <TransactionStatus isSwap={isSwap} />
      </AllTheProviders>,
      {
        chainId: undefined,
      },
    );
    const processingText = screen.getByText(/processing transaction/i);
    const estimatedTimeElement = screen.getByText(/estimated time/i);
    const actualTimeElement = screen.getByText(/30 seconds/i);
    const parentElement = estimatedTimeElement.parentElement;

    expect(processingText).toBeVisible();
    expect(parentElement).toBeDefined();
    expect(actualTimeElement).toBeVisible();
    expect(parentElement?.tagName).toBe('DIV');
    expect(parentElement?.classList.contains('aw-invisible')).toBe(false);
    expect(transactionStatus).toMatchSnapshot();
  });

  test('should render status with swap copy', async () => {
    const isSwap = true;
    const transactionStatus = render(<TransactionStatus isSwap={isSwap} />);
    const viewTransactionButton = screen.getByText(/view transaction/i);
    const swapText = screen.getByText(/swapping/i);
    const supportText = screen.getByText(/swap support/i);
    expect(viewTransactionButton).toBeVisible();
    expect(swapText).toBeVisible();
    expect(supportText).toBeDefined();
    expect(transactionStatus).toMatchSnapshot();
  });

  test('escape key DOES NOT close modal if showCloseButton is FALSE', async () => {
    const isSwap = false;
    const transactionStatus = customRender(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={setupConfig()}>
        <TransactionStatus isSwap={isSwap} />
      </AllTheProviders>,
      {
        chainId: undefined,
      },
    );
    const modal = screen.getByRole('dialog');
    const closeButton = screen.queryByRole('button', { name: /close/i });
    expect(modal).toBeVisible();
    expect(closeButton).toBeNull();
    userEvent.keyboard('[Escape]');
    expect(modal).toBeVisible();
    expect(transactionStatus).toMatchSnapshot();
  });

  test('escape key DOES close modal if showCloseButton is TRUE', async () => {
    const isSwap = false;

    // Mock useDecentScan to return an error state for the TX
    mockedDecentScan.mockReturnValue({
      data: {
        status: 'Failed',
        transaction: {
          status: 'Failed',
        },
      },
      isLoading: false,
      error: new Error('Failed to fetch transaction'),
      isValidating: false,
    });

    const transactionStatus = render(<TransactionStatus isSwap={isSwap} />);
    const modal = screen.getByRole('dialog');
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(modal).toBeVisible();
    expect(closeButton).toBeVisible();
    // Send escape key
    await userEvent.keyboard('[Escape]');
    // Expect modal is dismissed
    expect(modal).not.toBeVisible();
    expect(closeButton).not.toBeVisible();
    expect(transactionStatus).toMatchSnapshot();
  });
});
