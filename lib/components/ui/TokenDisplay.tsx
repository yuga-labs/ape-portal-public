import { getChainName, TokenInfo } from '@decent.xyz/box-common';
import { ChainIcon, TokenLogo } from '@decent.xyz/box-ui';
import pulse from '../../assets/lotties/pulse.json';
import Lottie from 'lottie-react';
import { cn } from '../../utils/utils';

function TokenDisplay({
  token,
  animationVisible,
  amount,
  amountUsd,
  showChain = true,
  left = false,
}: {
  token: TokenInfo;
  animationVisible: boolean;
  amount: string;
  amountUsd: string;
  showChain?: boolean;
  left?: boolean;
}) {
  return (
    <div
      className={cn('aw-relative aw-flex aw-w-1/2 aw-items-center', {
        'aw-justify-end': !left,
        'aw-justify-start': left,
      })}
    >
      <div
        className={
          'aw-relative aw-flex aw-items-center aw-justify-center aw-px-3'
        }
      >
        <TokenLogo
          className={
            'aw-z-40 aw-aspect-square aw-size-[50px] aw-min-h-[50px] aw-min-w-[50px] aw-rounded-full aw-bg-white aw-p-1'
          }
          token={token}
        />
        {showChain && (
          <ChainIcon
            chainId={token.chainId}
            className="aw-absolute aw-bottom-0 aw-right-[10px] aw-z-50 aw-aspect-square aw-size-5 aw-rounded-full aw-shadow aw-shadow-black"
          />
        )}
        <div
          className={
            'aw-absolute aw-mt-40 aw-flex aw-w-full aw-flex-col aw-justify-center aw-gap-y-[6px] aw-overflow-visible aw-text-nowrap aw-text-center aw-uppercase aw-text-white  aw-opacity-100'
          }
        >
          <div className="aw-flex aw-justify-center aw-font-mono aw-text-[11px] aw-leading-[14px] aw-tracking-[1.1px] aw-opacity-50">
            {getChainName(token.chainId) ?? 'Unknown'}
          </div>
          <div className="aw-flex aw-justify-center aw-font-dmsans aw-text-[16px] aw-leading-[14px] aw-tracking-[0.32px]">
            {amount} {token.symbol}
          </div>
          <div className="aw-flex aw-justify-center aw-font-dmsans aw-text-[12px] aw-leading-[14px] aw-tracking-[1.2px] aw-opacity-50">
            {amountUsd}
          </div>
        </div>
        {animationVisible && (
          <div
            className="aw-absolute aw-z-60 aw-w-[200%] md:aw-w-[300%]"
            data-testid="animation-pulse-token"
          >
            <Lottie animationData={pulse} loop={true} />
          </div>
        )}
      </div>
    </div>
  );
}

export default TokenDisplay;
