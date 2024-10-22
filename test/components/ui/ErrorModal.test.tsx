import { act, render, screen } from '@testing-library/react';
import { describe } from 'vitest';
import ErrorModal from '../../../lib/components/ui/modal/ErrorModal';
import { useErrorStore } from '../../../lib/store/useErrorStore';

const TEST_ERROR_MESSAGE = 'Test error message';

describe('components/ui/ErrorModal', () => {
  test('should not render error modal when error is not set', () => {
    const { container } = render(<ErrorModal />);
    expect(container).toMatchInlineSnapshot(`<div />`);
  });

  test('should render error modal when error is set', () => {
    const errorMessage = 'Sample error message';
    useErrorStore.setState({
      error: errorMessage,
    });

    render(<ErrorModal />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen).toMatchSnapshot();
  });

  test('should call resetError when Ok button is clicked', () => {
    const resetErrorMock = vi.fn();
    useErrorStore.setState({
      error: 'Sample error message',
      resetError: resetErrorMock,
    });

    render(<ErrorModal />);

    const okButton = screen.getByRole('button', { name: 'Ok' });
    act(() => {
      okButton.click();
    });

    expect(resetErrorMock).toHaveBeenCalledTimes(1);
  });

  test('should call resetError when close button is clicked', () => {
    const resetErrorMock = vi.fn();
    useErrorStore.setState({
      error: TEST_ERROR_MESSAGE,
      resetError: resetErrorMock,
    });

    render(<ErrorModal />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    act(() => {
      closeButton.click();
    });

    expect(resetErrorMock).toHaveBeenCalledTimes(1);
  });

  test('should re-render to return nothing when error is reset', () => {
    useErrorStore.setState({
      error: TEST_ERROR_MESSAGE,
    });

    const { container } = render(<ErrorModal />);

    expect(screen.getByText(TEST_ERROR_MESSAGE)).toBeInTheDocument();

    act(() => {
      useErrorStore.setState({
        error: undefined,
      });
    });

    expect(screen.queryByText(TEST_ERROR_MESSAGE)).toBeNull();
    expect(container).toMatchInlineSnapshot(`<div />`);
  });
});
