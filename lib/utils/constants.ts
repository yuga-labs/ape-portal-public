/** Public API key for decent bridge transactions. */
export const PUBLIC_DECENT_API_KEY_BRIDGE = '5b16c3d2f402cf381547ae9e25288661';
/** Public API key for decent bridge transactions on ZkSync. */
export const PUBLIC_DECENT_API_KEY_BRIDGE_ZKSYNC =
  '5ad9d291d2bc79ff3e8a70b19af1b008';
/** Public API key for decent bridge transactions on non-EVM chains. */
export const PUBLIC_DECENT_API_KEY_BRIDGE_NONEVM =
  '5d2c564e48f6c3164ba84d8b496cd3f4';
/** Public API key for decent swap transactions. */
export const PUBLIC_DECENT_API_KEY_SWAP = '9f508f9bca269deff7bf10e411c511e2';
/** Public API key for decent swap transactions on ZkSync. */
export const PUBLIC_DECENT_API_KEY_SWAP_ZKSYNC =
  '1f176278b6817a0cb99486eff70244fb';
/** Public API key for decent swap transactions on non-EVM chains. */
export const PUBLIC_DECENT_API_KEY_SWAP_NONEVM =
  '53a8c79040dc8bdfda45ba9b6bafa653';
/** Public API key for decent specific to Yuga Top Trader. */
export const PUBLIC_DECENT_API_KEY_TOPTRADER =
  '1df7f3f3fa58b923cc5133740f79dbc2';
/** Public API key for decent specific to Yuga Top Trader on ZkSync. */
export const PUBLIC_DECENT_API_KEY_TOPTRADER_ZKSYNC =
  'c06cacef27629aac37f91cc91b093af0';
/** Public API key for decent specific to Yuga Top Trader on non-EVM chains. */
export const PUBLIC_DECENT_API_KEY_TOPTRADER_NONEVM =
  'aa436d6d2183ef16f5a328bfe950ccfa';
/** Public API key for Halliday fiat onramp. */
export const PUBLIC_HALLIDAY_API_KEY = 'a025acde-b8e1-40ee-a153-fd85d7e0f35b';

export const SECONDS_IN_MINUTE = 60;
export const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE;
export const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
export const WARNING_THRESHOLD_FIVE_MINUTES = 5 * SECONDS_IN_MINUTE;
/** Price impact at or above this amount will trigger a warning in the bridge/swap UI. */
export const WARNING_THRESHOLD_PRICE_IMPACT = 0.02;
/** Price impact at or above this amount will block bridge/swap transaction button. */
export const DISABLE_BUTTON_THRESHOLD_PRICE_IMPACT = 0.1;

export enum InputType {
  Source = 'source',
  Destination = 'destination',
}

export enum PortalType {
  Bridge = 'bridge',
  Swap = 'swap',
  OnRamp = 'onramp',
}

export enum InitialPortalType {
  Bridge = 'initial_bridge',
  Swap = 'initial_swap',
  OnRamp = 'initial_onramp',
}

export const DefaultTabConfig: TabConfig = [
  InitialPortalType.Bridge,
  PortalType.Swap,
  PortalType.OnRamp,
];

export type TabConfig =
  | [InitialPortalType, PortalType, PortalType]
  | [PortalType, InitialPortalType, PortalType]
  | [PortalType, PortalType, InitialPortalType]
  | [PortalType, PortalType, PortalType]
  | [PortalType, PortalType]
  | [InitialPortalType, PortalType]
  | [PortalType, InitialPortalType];

export const LINK_SUPPORT = 'https://help.apeportal.xyz';
export const LINK_TERMS = 'https://terms.apeportal.xyz';

export const WARNING_PRICE_IMPACT = (rawPriceImpact: number): string =>
  `You will receive ${(rawPriceImpact * 100).toFixed(1)}% less than the amount sent (in USD equivalent). Try sending smaller amounts to reduce price impact.`;
