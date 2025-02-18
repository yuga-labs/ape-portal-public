import { cn } from '../../utils/utils';
import { DecimalInput } from './input/DecimalInput';

export const NumberInputWithLabel = ({
  value,
  onChange,
  loading,
  disabled,
  label,
  maxDecimals,
}: {
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  disabled: boolean;
  label: string;
  maxDecimals?: number;
}) => {
  return (
    <div className="aw-flex aw-flex-1 aw-flex-col aw-justify-between">
      <div className="aw-font-dmmono aw-text-[14px] aw-font-medium aw-uppercase aw-leading-normal aw-tracking-widest aw-text-text-secondary">
        {label}
      </div>
      <DecimalInput
        placeholder="0"
        className={cn(
          'aw-block aw-w-full aw-self-stretch aw-text-ellipsis aw-placeholder-text-secondary/70 aw-bg-transparent aw-font-dmsans aw-text-[25px] md:aw-text-[35px] aw-font-medium aw-leading-[14px] aw-text-text-primary [appearance:aw-textfield] focus:aw-border-indigo-500 focus:aw-outline-none focus:aw-ring-indigo-500 disabled:aw-opacity-50 [&::-webkit-inner-spin-button]:aw-appearance-none [&::-webkit-outer-spin-button]:aw-appearance-none',
          { 'aw-animate-pulse': loading },
        )}
        value={value}
        disabled={disabled}
        onChangeSanitized={onChange}
        maxDecimals={maxDecimals}
      />
    </div>
  );
};
