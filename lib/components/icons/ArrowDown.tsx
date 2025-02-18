import { cn } from '../../utils/utils.ts';

export const ArrowDown = ({ size = 24, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(props.className, 'aw-fill-none')}
      viewBox="0 0 24 24"
    >
      <g id="arrow-down">
        <path
          id="Vector"
          d="M8 10L12 14L16 10"
          stroke="white"
          className={'aw-stroke-text-primary'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
