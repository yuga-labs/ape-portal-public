import { PortalType } from '../../utils/constants';
import { TokenSwap } from '../ui/TokenSwap';
import { PortalProps } from '../ui/types';

export function Bridge({
  showBranding = false,
  className,
  tokenConfig,
}: PortalProps) {
  return (
    <TokenSwap
      showBranding={showBranding}
      portalType={PortalType.Bridge}
      tokenConfig={tokenConfig}
      className={className}
    />
  );
}
