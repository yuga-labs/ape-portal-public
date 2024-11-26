import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { ApeStableDisclosure } from '../../../lib/components/ui/ApeStableDisclosure';
import {
  ApeEthOmnichainContract,
  ApeUsdOmnichainContract,
  UsdcArbMainnetContract,
  UsdcEthMainnetContract,
} from '../../../lib/utils/utils';
import { Address, zeroAddress } from 'viem';
import userEvent from '@testing-library/user-event';
import { ChainId } from '@decent.xyz/box-common';

describe('ApeStableDisclosure', () => {
  const renderComponent = (
    props: Partial<React.ComponentProps<typeof ApeStableDisclosure>> = {},
  ) => {
    const defaultProps = {
      isSourceToken: false,
      sourceTokenAddress: zeroAddress as Address,
      sourceTokenChainId: ChainId.ETHEREUM,
      destinationTokenAddress: zeroAddress as Address,
      destinationTokenChainId: ChainId.APE,
    };
    return render(<ApeStableDisclosure {...defaultProps} {...props} />);
  };

  test('should not render anything if isSourceToken is true', () => {
    renderComponent({
      isSourceToken: true,
      sourceTokenAddress: UsdcEthMainnetContract,
      sourceTokenChainId: ChainId.ETHEREUM,
      destinationTokenAddress: ApeUsdOmnichainContract,
    });
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('should not render anything if token is not ApeUSD or ApeETH', () => {
    renderComponent();
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('should still render disclosure even if token amount USD is 0', () => {
    renderComponent({
      destinationTokenAddress: ApeEthOmnichainContract,
    });
    const warningIcon = screen.getByRole('img');
    expect(warningIcon).toBeDefined();
  });

  test('should render warning icon with correct tooltip for ETH-USDC -> APE-APEUSD', async () => {
    userEvent.setup();
    renderComponent({
      sourceTokenAddress: UsdcEthMainnetContract,
      sourceTokenChainId: ChainId.ETHEREUM,
      destinationTokenAddress: ApeUsdOmnichainContract,
    });
    const warningIcon = screen.getByRole('img');
    expect(warningIcon).toBeDefined();
    userEvent.hover(warningIcon);
    await waitFor(() =>
      expect(
        screen.queryByText('For a 1:1 conversion, use DAI to apeUSD'),
      ).toBeDefined(),
    );
  });

  test('should render warning icon with correct tooltip for ARB-USDC -> APE-APEUSD', async () => {
    userEvent.setup();
    renderComponent({
      sourceTokenAddress: UsdcArbMainnetContract,
      sourceTokenChainId: ChainId.ARBITRUM,
      destinationTokenAddress: ApeUsdOmnichainContract,
    });
    const warningIcon = screen.getByRole('img');
    expect(warningIcon).toBeDefined();
    userEvent.hover(warningIcon);
    await waitFor(() =>
      expect(
        screen.queryByText('For a 1:1 conversion, use DAI to apeUSD'),
      ).toBeDefined(),
    );
  });

  test('should render warning icon with correct tooltip for ETH-ETH -> APE-APEETH', async () => {
    userEvent.setup();
    renderComponent({
      destinationTokenAddress: ApeEthOmnichainContract,
    });
    const warningIcon = screen.getByRole('img');
    expect(warningIcon).toBeDefined();
    userEvent.hover(warningIcon);
    await waitFor(() =>
      expect(
        screen.queryByText('For a 1:1 conversion, use stETH to apeETH'),
      ).toBeDefined(),
    );
  });

  test('should render warning icon with correct tooltip for ARB-ETH -> APE-APEETH', async () => {
    userEvent.setup();
    renderComponent({
      sourceTokenAddress: zeroAddress as Address,
      sourceTokenChainId: ChainId.ARBITRUM,
      destinationTokenAddress: ApeEthOmnichainContract,
    });
    const warningIcon = screen.getByRole('img');
    expect(warningIcon).toBeDefined();
    userEvent.hover(warningIcon);
    await waitFor(() =>
      expect(
        screen.queryByText('For a 1:1 conversion, use stETH to apeETH'),
      ).toBeDefined(),
    );
  });
});
