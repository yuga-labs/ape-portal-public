import { ChainIcon, TokenLogo } from '@decent.xyz/box-ui';
import { ArrowDown } from '../icons/ArrowDown.tsx';
import { TokenTransactionData } from '../../classes/TokenTransactionData.ts';
import { cn } from '../../utils/utils.ts';

export interface ChainTokenSelectButtonProps {
  currentToken: TokenTransactionData;
  isBridge: boolean;
}

export const ChainTokenSelectTrigger = ({
  currentToken,
  isBridge,
}: ChainTokenSelectButtonProps) => {
  return (
    <div
      className={cn(
        'aw-flex md:aw-h-14 aw-h-12 aw-items-center aw-text-text-primary aw-rounded-full aw-border-t-2 aw-border-primaryLight md:aw-px-4 aw-pl-2 aw-shadow-xl disabled:aw-cursor-not-allowed disabled:aw-opacity-80',
      )}
    >
      <div className="aw-relative aw-z-0 aw-mr-2">
        <TokenLogo
          token={currentToken.token}
          className={cn(
            'aw-size-8 aw-rounded-full aw-bg-white aw-p-1 md:aw-size-10',
            {
              'aw-mr-3': isBridge,
            },
          )}
        />
        {isBridge && (
          <div data-testid="chain-icon">
            <ChainIcon
              chainId={currentToken.token.chainId}
              className="aw-absolute aw-bottom-0 aw-right-0 aw-aspect-square aw-size-4 aw-rounded-full aw-shadow aw-shadow-black aw-duration-500 aw-animate-in aw-zoom-in md:aw-size-[22px]"
            />
          </div>
        )}
      </div>
      <span className={'aw-text-[16px] aw-uppercase md:aw-text-[22px]'}>
        {currentToken.token.symbol}
      </span>
      <ArrowDown size={35} />
    </div>
  );
};
