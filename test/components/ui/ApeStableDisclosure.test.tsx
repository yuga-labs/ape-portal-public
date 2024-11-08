import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { ApeStableDisclosure } from '../../../lib/components/ui/ApeStableDisclosure';
import {
  ApeEthOmnichainContract,
  ApeUsdOmnichainContract,
} from '../../../lib/utils/utils';
import { zeroAddress } from 'viem';
import userEvent from '@testing-library/user-event';

describe('ApeStableDisclosure', () => {
  const renderComponent = (
    props: Partial<React.ComponentProps<typeof ApeStableDisclosure>> = {},
  ) => {
    const defaultProps = {
      isSourceToken: false,
      tokenAddress: zeroAddress,
      tokenUsdValue: '0',
    };
    return render(<ApeStableDisclosure {...defaultProps} {...props} />);
  };

  test('should not render anything if isSourceToken is true', () => {
    renderComponent({ isSourceToken: true });
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('should not render anything if token is not ApeUSD or ApeETH', () => {
    renderComponent();
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('should still render disclosure even if token amount USD is 0', () => {
    renderComponent({
      tokenAddress: ApeUsdOmnichainContract,
      tokenUsdValue: '0',
    });
    const warningIcon = screen.getByRole('img');
    expect(warningIcon).toBeDefined();
  });

  test('should render warning icon with correct tooltip for ApeUSD', async () => {
    userEvent.setup();
    renderComponent({
      tokenAddress: ApeUsdOmnichainContract,
      tokenUsdValue: '10',
    });
    const warningIcon = screen.getByRole('img');
    expect(warningIcon).toBeDefined();
    userEvent.hover(warningIcon);
    await waitFor(() =>
      expect(
        screen.queryByText(
          'The underlying price of APE-USD is correlated with DAI.',
        ),
      ).toBeDefined(),
    );
  });

  test('should render warning icon with correct tooltip for ApeETH', async () => {
    userEvent.setup();
    renderComponent({
      tokenAddress: ApeEthOmnichainContract,
      tokenUsdValue: '10',
    });
    const warningIcon = screen.getByRole('img');
    expect(warningIcon).toBeDefined();
    userEvent.hover(warningIcon);
    await waitFor(() =>
      expect(
        screen.queryByText(
          'The underlying price of APE-ETH is correlated with Liquid Staked ETH (stETH).',
        ),
      ).toBeDefined(),
    );
  });
});
