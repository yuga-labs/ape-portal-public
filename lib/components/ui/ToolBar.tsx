import { useAccount } from 'wagmi';
import { LINK_SUPPORT, LINK_TERMS } from '../../utils/constants';
import { useCallback } from 'react';

export const ToolBar = () => {
  const { address } = useAccount();

  const TransactionsLink = useCallback(() => {
    return address ? (
      <a
        href={`https://www.decentscan.xyz/?address=${address}`}
        target="_blank"
        className="aw-animate-in aw-zoom-in"
      >
        Transactions
      </a>
    ) : undefined;
  }, [address]);

  return (
    <div className="aw-mt-1 aw-flex aw-h-6 aw-w-full aw-flex-row aw-justify-center">
      <div className="aw-flex aw-flex-row aw-gap-x-8 aw-text-center aw-font-dmmono aw-text-xs aw-font-medium aw-leading-[14px] aw-text-white aw-underline aw-opacity-50">
        <a href={LINK_TERMS} target="_blank">
          Terms
        </a>
        <TransactionsLink />
        <a href={LINK_SUPPORT} target="_blank">
          Support
        </a>
      </div>
    </div>
  );
};
