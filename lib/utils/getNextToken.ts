import {
  getChainTokensInfo,
  getNativeTokenInfoOrFail,
  TokenId,
  TokenInfo,
} from '@decent.xyz/box-common';

export const NO_TOKENS_FOUND_ERROR =
  'No other tokens found on this chain to swap. You will now be shown Ethereum defaults.';

/**
 * Used to get the next token in the chain that is not the source token
 * If the source token is not the gas token then the gas token is returned
 * If the source token is the gas token then the USDC token is returned
 * If the USDC is not found the first token that is not the source token is returned
 * @param queryToken
 */
export const getChainNextToken = (
  queryToken: TokenId,
): TokenInfo | undefined => {
  const gasToken = getNativeTokenInfoOrFail(queryToken.chainId);
  const isGasToken: boolean = gasToken.address == queryToken.address;
  if (!isGasToken) {
    return gasToken;
  }

  const chainTokens = getChainTokensInfo(queryToken.chainId);
  if (!chainTokens) {
    return undefined;
  }

  const usdcToken = chainTokens.find((token) => token.name === 'USDC');
  if (usdcToken) {
    return usdcToken;
  }
  return chainTokens.find((token) => token.address !== queryToken.address);
};
