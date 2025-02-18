import { ArrowOutbound } from '../../icons/ArrowOutbound.tsx';
import { cn } from '../../../utils/utils.ts';
import { BaseButton } from './BaseButton.tsx';

export const LinkButton = ({ text, url }: { text: string; url: string }) => {
  return (
    <a href={url} target="_blank">
      <BaseButton>
        <div
          className={cn(
            'aw-flex aw-w-full aw-flex-1 aw-flex-row aw-items-center aw-text-text-primary aw-justify-center aw-gap-x-4 aw-text-center aw-tracking-[1.4px]',
          )}
        >
          {text}
          <ArrowOutbound size={10} />
        </div>
      </BaseButton>
    </a>
  );
};
