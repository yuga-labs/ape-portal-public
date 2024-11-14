import { ReactNode, useMemo } from 'react';
import { ApeContext } from './apeProvider.context.ts';
import { Address } from 'viem';

export interface ApeConfig {
  /** Callback that prompts the user to connect their wallet */
  openConnectModal: () => void;
  /** If configured, ALL bridge, swap or onramp transaction outputs will be sent to this address instead of the sender/payer. */
  destinationAddress?: Address | undefined;
  /** For use by Yuga Top Trader to enable some product specific behaviors. */
  isTopTrader?: boolean;
  /** Default to false, if true you can route to a specific tab within the portal using url hashes  **/
  useHashRouter?: boolean;
  /** Enable the On-Ramp tab in the widget, or the Buy component.
   * Requires prior approval from Yuga Labs or the onramp will not function due to CORS errors. */
  enableOnramp?: boolean;
  /* Allow users to select Solana and be redirected to solanaRedirectUrl */
  enableSolanaRedirect?: boolean;
  /* Url a user will be redirected to for Solana */
  solanaRedirectUrl?: string;
}

export interface ApeProviderProps {
  config: ApeConfig;
  children: ReactNode;
}

export const ApeProvider = ({ config, children }: ApeProviderProps) => {
  const value = useMemo(() => config, [config]);
  return <ApeContext.Provider value={value}>{children}</ApeContext.Provider>;
};
