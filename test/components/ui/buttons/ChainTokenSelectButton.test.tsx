import { TokenTransactionData } from '../../../../lib/classes/TokenTransactionData';
import {
  ChainTokenSelectButtonProps,
  ChainTokenSelectTrigger,
} from '../../../../lib/components/ui/ChainTokenSelectTrigger.tsx';
import { ChainId, getNativeTokenInfoOrFail } from '@decent.xyz/box-common';
import { customRender } from '../../../index';
import { screen } from '@testing-library/react';

const ethGasToken = getNativeTokenInfoOrFail(ChainId.ETHEREUM);

const getProps = ({ isBridge = false } = {}): ChainTokenSelectButtonProps => ({
  currentToken: new TokenTransactionData(ethGasToken, '0'),
  isBridge,
});

describe('components/ui/buttons/ChainTokenSelectButton', () => {
  test('should render ChainTokenSelectButton', () => {
    const chainTokenSelectButton = customRender(
      <ChainTokenSelectTrigger {...getProps()} />,
      { chainId: undefined },
    );
    expect(screen.getByText(ethGasToken.symbol)).toBeInTheDocument();
    expect(chainTokenSelectButton).toMatchSnapshot();
  });
  test('should not render ChainIcon if not isBridge', () => {
    const chainTokenSelectButton = customRender(
      <ChainTokenSelectTrigger {...getProps()} />,
      { chainId: undefined },
    );
    expect(screen.queryByTestId('chain-icon')).not.toBeInTheDocument();
    expect(chainTokenSelectButton).toMatchSnapshot();
  });
  test('should only render ChainIcon if isBridge', () => {
    const chainTokenSelectButton = customRender(
      <ChainTokenSelectTrigger {...getProps({ isBridge: true })} />,
      { chainId: undefined },
    );
    expect(screen.getByTestId('chain-icon')).toBeInTheDocument();
    expect(chainTokenSelectButton).toMatchSnapshot();
  });
});
