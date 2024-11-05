import { CrossIcon } from '../../icons/CrossIcon';
import { cn } from '../../../utils/utils';

function CloseButton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'aw-absolute aw-right-2 aw-top-2 aw-rounded-full aw-bg-apeAccent aw-duration-700 hover:aw-scale-125',
        className,
      )}
    >
      <CrossIcon size={28} />
    </div>
  );
}

export default CloseButton;
