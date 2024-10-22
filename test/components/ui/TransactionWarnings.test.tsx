import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionWarnings } from '../../../lib/components/ui/TransactionWarnings';
import { BridgeTransactionData } from '../../../lib/classes/BridgeTransactionData';
import { WARNING_PRICE_IMPACT } from '../../../lib/utils/constants';

const createBridgeTransactionData = (
  timeWarning?: string,
  slippagePercentage?: number,
  priceImpactWarning?: string,
) => {
  const bridgeTransactionData = new BridgeTransactionData();
  bridgeTransactionData.timeWarning = timeWarning;
  bridgeTransactionData.priceImpactWarning = priceImpactWarning;
  bridgeTransactionData.slippagePercentage = slippagePercentage ?? 1;
  return bridgeTransactionData;
};

const exampleTimeWarning = 'The estimated waiting time to bridge is 7 days.';
const examplePriceImpactWarning = WARNING_PRICE_IMPACT(0.023);

describe('components/ui/TransactionWarnings', () => {
  test('should return nothing if there are no warnings', async () => {
    const bridgeTransactionData = createBridgeTransactionData(undefined, 1);
    const transactionWarnings = render(
      <TransactionWarnings bridgeTransactionData={bridgeTransactionData} />,
    );
    // Expect an empty component, which with @testing-library/react.render
    //   seems to be an empty div
    expect(transactionWarnings.container).toMatchInlineSnapshot(`<div />`);
    expect(transactionWarnings).toMatchSnapshot();
  });

  test('should render warnings when isTopTrader is FALSE', async () => {
    const bridgeTransactionData = createBridgeTransactionData(
      exampleTimeWarning,
      1.01,
      examplePriceImpactWarning,
    );
    const destinationAddress = '0x1234567890123456789012345678901234567890';
    const transactionWarnings = render(
      <TransactionWarnings
        bridgeTransactionData={bridgeTransactionData}
        destinationAddress={destinationAddress}
      />,
    );
    const warningText = screen.getByText(exampleTimeWarning);
    const slippageText = screen.getByText(
      /slippage higher than 1% may be frontrun and result in unfavorable prices/i,
    );
    const receiverAddressText = screen.getByText(
      /funds will be sent to a different wallet address! 0x1234...7890/i,
    );
    const priceImpactText = screen.getByText(examplePriceImpactWarning);

    expect(warningText).toBeDefined();
    expect(slippageText).toBeDefined();
    expect(priceImpactText).toBeDefined();
    expect(receiverAddressText).toBeDefined();
    expect(transactionWarnings).toMatchSnapshot();
  });

  test('should render warnings when isTopTrader is TRUE', async () => {
    const bridgeTransactionData = createBridgeTransactionData(
      exampleTimeWarning,
      1.01,
      examplePriceImpactWarning,
    );
    const destinationAddress = '0x1234567890123456789012345678901234567890';
    const transactionWarnings = render(
      <TransactionWarnings
        bridgeTransactionData={bridgeTransactionData}
        destinationAddress={destinationAddress}
        isTopTrader={true}
      />,
    );
    const warningText = screen.getByText(exampleTimeWarning);
    const slippageText = screen.getByText(
      /slippage higher than 1% may be frontrun and result in unfavorable prices/i,
    );
    const receiverAddressText = screen.getByText(
      /funds will arrive in your top trader wallet and will be ready for you to enter top trader tournaments/i,
    );
    const priceImpactText = screen.getByText(examplePriceImpactWarning);

    expect(warningText).toBeDefined();
    expect(slippageText).toBeDefined();
    expect(priceImpactText).toBeDefined();
    expect(receiverAddressText).toBeDefined();
    expect(transactionWarnings).toMatchSnapshot();
  });

  test('should render warnings without slippage', async () => {
    const bridgeTransactionData = createBridgeTransactionData(
      exampleTimeWarning,
      undefined,
      examplePriceImpactWarning,
    );
    const destinationAddress = '0x1234567890123456789012345678901234567890';
    const transactionWarnings = render(
      <TransactionWarnings
        bridgeTransactionData={bridgeTransactionData}
        destinationAddress={destinationAddress}
      />,
    );
    const warningText = screen.getByText(exampleTimeWarning);
    const receiverAddressText = screen.getByText(
      /funds will be sent to a different wallet address! 0x1234...7890/i,
    );
    const priceImpactText = screen.getByText(examplePriceImpactWarning);

    expect(warningText).toBeDefined();
    expect(priceImpactText).toBeDefined();
    expect(receiverAddressText).toBeDefined();
    expect(transactionWarnings).toMatchSnapshot();
  });

  test('should render warnings without receiver address', async () => {
    const bridgeTransactionData = createBridgeTransactionData(
      exampleTimeWarning,
      1.01,
      examplePriceImpactWarning,
    );
    const transactionWarnings = render(
      <TransactionWarnings bridgeTransactionData={bridgeTransactionData} />,
    );
    const warningText = screen.getByText(exampleTimeWarning);
    const slippageText = screen.getByText(
      /slippage higher than 1% may be frontrun and result in unfavorable prices/i,
    );
    const priceImpactText = screen.getByText(examplePriceImpactWarning);

    expect(warningText).toBeDefined();
    expect(slippageText).toBeDefined();
    expect(priceImpactText).toBeDefined();
    expect(transactionWarnings).toMatchSnapshot();
  });

  test('should render price impact warning only', async () => {
    const bridgeTransactionData = createBridgeTransactionData(
      undefined,
      1.01,
      examplePriceImpactWarning,
    );
    const transactionWarnings = render(
      <TransactionWarnings bridgeTransactionData={bridgeTransactionData} />,
    );
    const priceImpactText = screen.getByText(examplePriceImpactWarning);

    expect(priceImpactText).toBeDefined();
    expect(transactionWarnings).toMatchSnapshot();
  });
});
