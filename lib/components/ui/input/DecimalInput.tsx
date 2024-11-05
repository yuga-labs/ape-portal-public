import { useCallback } from 'react';
import { JSX } from 'react';
export type DecimalInputProps = JSX.IntrinsicElements['input'] & {
  value: string;
  onChangeSanitized: (value: string) => void;
  maxDecimals?: number;
};

export const DecimalInput = ({
  value,
  onChangeSanitized,
  placeholder,
  min,
  maxDecimals,
  ...props
}: DecimalInputProps) => {
  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      /* eslint-disable unicorn/prefer-string-replace-all */
      // Sanitize input to only include numbers and decimals
      let sanitized = e.target.value
        .replace(',', '.') // Step 1: Replace commas with periods
        .replace(/[^\d.]/g, '') // Step 2: Remove non-digit and non-period characters
        .replace(/(\..*?)\.+/g, '$1'); // Step 3: Remove all periods after the first one
      // Step 4: Limit the number of decimal places
      if (maxDecimals !== undefined) {
        const [integer, decimal] = sanitized.split('.');
        if (decimal && decimal.length > maxDecimals) {
          sanitized = `${integer}.${decimal.slice(0, maxDecimals)}`;
        }
      }
      /* eslint-enable unicorn/prefer-string-replace-all */
      onChangeSanitized(sanitized);
    },
    [onChangeSanitized, maxDecimals],
  );

  return (
    <input
      inputMode="decimal"
      min={min ?? 0}
      placeholder={placeholder ?? 'Amount'}
      value={value}
      onChange={handleOnChange}
      onPaste={(event) => {
        const paste = event.clipboardData.getData('text');
        const regExp = new RegExp(/[+e\-]/gi);
        if (regExp.test(paste)) {
          event.preventDefault();
        }
      }}
      onKeyDown={(event) =>
        ['e', 'E', '+', '-'].includes(event.key) && event.preventDefault()
      }
      {...props}
    />
  );
};
