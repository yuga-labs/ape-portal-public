import { usePortalStore } from '../../../store/usePortalStore.ts';
import { useShallow } from 'zustand/react/shallow';

export const MaxButton = ({
  tokenBalance,
  disabled,
}: {
  tokenBalance: string;
  disabled?: boolean;
}) => {
  const { maxOutSourceToken } = usePortalStore(
    useShallow((state) => ({
      maxOutSourceToken: state.maxOutSourceToken,
    })),
  );

  return (
    <button
      onClick={() => {
        maxOutSourceToken(tokenBalance);
      }}
      className="aw-justify-center aw-rounded-lg aw-bg-black/80 aw-p-1.5 hover:aw-scale-105 disabled:aw-cursor-not-allowed"
      disabled={disabled}
    >
      <div className="aw-text-center aw-text-sm aw-font-bold aw-uppercase aw-leading-[14px] aw-tracking-wide aw-text-blue-500">
        MAX
      </div>
    </button>
  );
};
