import {
  TokenInputModule,
  TokenInputModuleProps,
} from '../../../lib/components/ui/TokenInputModule';
import {
  AllTheProviders,
  customRender,
  setupConfig,
  TEST_ADDRESS,
} from '../../index';
import { act, screen } from '@testing-library/react';
import { PortalType } from '../../../lib/utils/constants';
import { defaultApeConfig } from '../../utils';
import { connect } from 'wagmi/actions';
import { shortenAddress } from '../../../lib/utils/utils';
import { MotionGlobalConfig } from 'framer-motion';
import { mainnet } from 'wagmi/chains';

const getProps = ({
  srcToken = false,
  selectType = PortalType.Bridge,
} = {}): TokenInputModuleProps => ({
  isSourceToken: srcToken,
  selectType,
  loading: false,
});

MotionGlobalConfig.skipAnimations = true;

describe('components/ui/TokenInputModule', () => {
  test('should render TokenInputModule', () => {
    const tokenDisplay = customRender(<TokenInputModule {...getProps()} />, {
      chainId: undefined,
    });
    expect(tokenDisplay).toMatchSnapshot();
  });
  test('should only render MaxButton when srcToken is true', () => {
    const tokenDisplay = customRender(
      <TokenInputModule {...getProps({ srcToken: true })} />,
      {
        chainId: undefined,
      },
    );
    expect(screen.getByText('MAX')).toBeInTheDocument();
    expect(tokenDisplay).toMatchSnapshot();
  });
  test('should render MaxButton disabled if wallet is NOT connected', () => {
    const tokenDisplay = customRender(
      <TokenInputModule {...getProps({ srcToken: true })} />,
      {
        chainId: undefined,
      },
    );
    expect(screen.getByText('MAX')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'MAX' })).toBeDisabled();
    expect(tokenDisplay).toMatchSnapshot();
  });
  test('should render MaxButton enabled if wallet is connected', async () => {
    const config = setupConfig();
    const tokenDisplay = customRender(
      <AllTheProviders apeConfig={defaultApeConfig} wagmiConfig={config}>
        <TokenInputModule {...getProps({ srcToken: true })} />
      </AllTheProviders>,
      {
        chainId: undefined,
      },
    );
    await act(async () => {
      await connect(config, {
        chainId: mainnet.id,
        connector: config.connectors[0],
      });
    });

    expect(screen.getByText('MAX')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'MAX' })).toBeEnabled();
    expect(tokenDisplay).toMatchSnapshot();
  });
  test('should NOT show destination wallet address next to Balance when srcToken is true', () => {
    const config = setupConfig();
    const apeConfig = {
      ...defaultApeConfig,
      destinationAddress: TEST_ADDRESS,
    };
    const tokenDisplay = customRender(
      <AllTheProviders apeConfig={apeConfig} wagmiConfig={config}>
        <TokenInputModule {...getProps({ srcToken: true })} />
      </AllTheProviders>,
      {
        chainId: undefined,
      },
    );

    expect(screen.getByText('Balance:')).toBeInTheDocument();
    expect(tokenDisplay).toMatchSnapshot();
  });
  test('should show destination wallet address Balance when srcToken is false', () => {
    const config = setupConfig();
    const apeConfig = {
      ...defaultApeConfig,
      destinationAddress: TEST_ADDRESS,
    };
    const tokenDisplay = customRender(
      <AllTheProviders apeConfig={apeConfig} wagmiConfig={config}>
        <TokenInputModule {...getProps({ srcToken: false })} />
      </AllTheProviders>,
      {
        chainId: undefined,
      },
    );

    const shortAddress = shortenAddress(TEST_ADDRESS);
    expect(screen.getByText(`Balance ${shortAddress}:`)).toBeInTheDocument();
    expect(tokenDisplay).toMatchSnapshot();
  });
});
