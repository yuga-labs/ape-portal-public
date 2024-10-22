import TokenDisplay from '../../../lib/components/ui/TokenDisplay';
import {
  ChainId,
  getChainNameOrFail,
  getNativeTokenInfoOrFail,
} from '@decent.xyz/box-common';
import { customRender } from '../../index';
import { screen } from '@testing-library/react';

const ethGasToken = getNativeTokenInfoOrFail(ChainId.ETHEREUM);
const chainName = getChainNameOrFail(ChainId.ETHEREUM);

describe('components/ui/TokenDisplay', () => {
  test('should render TokenDisplay', () => {
    const amount = '1.0';
    const amountUsd = '$100.00';
    const tokenDisplay = customRender(
      <TokenDisplay
        token={ethGasToken}
        animationVisible={true}
        amount={amount}
        amountUsd={amountUsd}
      />,
      {
        chainId: undefined,
      },
    );
    expect(screen.getByTestId('animation-pulse-token')).toBeInTheDocument();
    expect(
      screen.getByText(`${amount} ${ethGasToken.symbol}`),
    ).toBeInTheDocument();
    expect(screen.getByText(amountUsd)).toBeInTheDocument();
    expect(screen.getByText(chainName)).toBeInTheDocument();
    expect(tokenDisplay).toMatchSnapshot();
  });
  test('should not render animation if animationVisible is false', () => {
    const tokenDisplay = customRender(
      <TokenDisplay
        token={ethGasToken}
        animationVisible={false}
        amount="1.0"
        amountUsd="$100.00"
      />,
      {
        chainId: undefined,
      },
    );
    expect(
      screen.queryByTestId('animation-pulse-token'),
    ).not.toBeInTheDocument();
    expect(tokenDisplay).toMatchSnapshot();
  });
});
