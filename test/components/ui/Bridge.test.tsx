import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Bridge } from '../../../lib';
import { customRender } from '../../index.tsx';
import userEvent from '@testing-library/user-event';

describe('Bridge Component', () => {
  beforeEach(() => {
    userEvent.setup();
  });

  it.each([true, false])(
    'renders correctly with showBranding=%s',
    (showBranding) => {
      customRender(<Bridge showBranding={showBranding} />, {});
      expect(screen.getByTestId('token-input-source')).toBeVisible();
      expect(screen.getByText(/connect wallet/i)).toBeVisible();
      expect(screen.getByText(/connect wallet/i)).toBeEnabled();
    },
  );

  it.each([true, false])(
    'shows the token / chain modal when the token button is clicked with showBranding=%s',
    async (showBranding) => {
      customRender(<Bridge showBranding={showBranding} />, {});
      userEvent.click(
        within(screen.getByTestId('token-input-source')).getByRole('button', {
          name: /ape/i,
        }),
      );
      await waitFor(() => {
        expect(screen.getByText(/select network/i)).toBeVisible();
      });
      // TODO: Figure out how to test that the original `token-input-source` button is obscured by
      //  the modal. `toBeVisible` doesn't work because the button is still in the DOM and did not
      //  have any CSS changes; it is just obscured by the radix modal.
      const modal = screen.getByRole('dialog');
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(modal).toBeVisible();
      expect(closeButton).toBeVisible();
    },
  );
});
