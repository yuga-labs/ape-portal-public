import { render, screen, waitFor } from '@testing-library/react';
import { describe } from 'vitest';
import { NumberInputWithLabel } from '../../../lib/components/ui/NumberInput';
import userEvent from '@testing-library/user-event';

describe('components/ui/NumberInput', () => {
  test('should render number input with default value', () => {
    const { container } = render(
      <NumberInputWithLabel
        value="0"
        onChange={vi.fn()}
        loading={false}
        disabled={false}
        label="Amount"
      />,
    );
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  test('should render with placeholder', () => {
    render(
      <NumberInputWithLabel
        value=""
        onChange={vi.fn()}
        loading={false}
        disabled={false}
        label="Amount"
      />,
    );
    expect(screen.getByPlaceholderText('0')).toBeVisible();
  });

  test.each([
    { input: 'abc123', expectedOutput: '123' },
    { input: '1.234.567.89', expectedOutput: '1.23456789' },
    { input: '1,234.567,89', expectedOutput: '1.23456789' },
    { input: 'abcdef', expectedOutput: '' },
    { input: '1e27', expectedOutput: '127' },
    { input: '1-27', expectedOutput: '127' },
  ])('should sanitize non-numeric input: %s', ({ input, expectedOutput }) => {
    const onChange = vi.fn();
    userEvent.setup();
    render(
      <NumberInputWithLabel
        value="0"
        onChange={onChange}
        loading={false}
        disabled={false}
        label="Amount"
      />,
    );
    const inputElement = screen.getByRole('textbox');
    userEvent.type(inputElement, input);
    waitFor(() => expect(inputElement).toHaveValue(expectedOutput));
  });
});
