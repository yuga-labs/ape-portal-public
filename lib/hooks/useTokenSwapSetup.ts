import { useTransactionConfig } from './useTransactionConfig.ts';
import { PortalType } from '../utils/constants.ts';
import { TokenConfig } from '../types.ts';
import { useHashParams } from './useHashParams.ts';
import { useConfigTokenDefaults } from './useConfigTokenDefaults.ts';

export const useTokenSwapSetup = (
  portalType: PortalType,
  tokenConfig?: TokenConfig,
) => {
  const useBoxActionArgs = useTransactionConfig();
  // This hook must be called after useTransactionConfig to not
  // conflict with input state initialization in that hook
  const { usingHashOrLoading } = useHashParams(portalType);
  useConfigTokenDefaults(portalType, usingHashOrLoading, tokenConfig);
  return useBoxActionArgs;
};
