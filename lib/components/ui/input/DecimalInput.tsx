import { useCallback } from 'react';
import { JSX } from 'react';
export type DecimalInputProps = JSX.IntrinsicElements['input'] & {
  value: string;
  onChangeSanitized: (value: string) => void;
};

export const DecimalInput = ({
  value,
  onChangeSanitized,
  placeholder,
  min,
  ...props
}: DecimalInputProps) => {
  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      /* eslint-disable unicorn/prefer-string-replace-all */
      // Sanitize input to only include numbers and decimals
      const sanitized = e.target.value
        .replace(',', '.') // Step 1: Replace commas with periods
        .replace(/[^\d.]/g, '') // Step 2: Remove non-digit and non-period characters
        .replace(/(\..*?)\.+/g, '$1'); // Step 3: Remove all periods after the first one
      /* eslint-enable unicorn/prefer-string-replace-all */
      onChangeSanitized(sanitized);
    },
    [onChangeSanitized],
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
