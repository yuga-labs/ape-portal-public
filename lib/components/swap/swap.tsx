import { PortalType } from '../../utils/constants';
import { TokenSwap } from '../ui/TokenSwap';
import { PortalProps } from '../ui/types';

export function Swap({
  showBranding = false,
  tokenConfig,
  className,
}: PortalProps) {
  return (
    <TokenSwap
      showBranding={showBranding}
      portalType={PortalType.Swap}
      tokenConfig={tokenConfig}
      className={className}
    />
  );
}
