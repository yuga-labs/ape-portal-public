import { DecentBridgeStatus, TokenConfig } from '../../types';

interface TransactionCallbackArgs {
  chainId: number;
  transactionHash?: string;
  details?: DecentBridgeStatus;
}

export interface TransactionCallbacks {
  /** Optional callback. Triggered when a bridge or swap transaction completes successfully. */
  onTransactionSuccess?: (args: Partial<TransactionCallbackArgs>) => void;
  /** Optional callback. Triggered when a bridge or swap transaction fails. */
  onTransactionError?: (args: Partial<TransactionCallbackArgs>) => void;
}

export interface PortalProps extends TransactionCallbacks {
  /** Controls whether branding elements, such as a border and logo,
   * are displayed at the top of the component. */
  showBranding?: boolean;
  tokenConfig?: TokenConfig;
  className?: string;
  /** Controls whether some style adjustments are made to accommodate hosting in TabGroup. */
  isTabHosted?: boolean;
}
