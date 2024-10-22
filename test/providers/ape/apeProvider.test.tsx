import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { customRender } from '../../../test';
import userEvent from '@testing-library/user-event';
import { ApeConfig, ApePortal } from '../../../lib';
import { usePortalStore } from '../../../lib/store/usePortalStore.ts';

const resetStore = () => {
  const { getState, setState } = usePortalStore;
  const initialState = getState();
  setState(initialState);
};

describe('Ape Provider', () => {
  beforeEach(() => {
    userEvent.setup();
    vi.clearAllMocks();
    resetStore();
  });

  afterEach(() => {
    cleanup();
  });

  const mockOpenModal = vi.fn();

  it('without custom defaults show ETH $APE to APECHAIN $APE', async () => {
    const { getState } = usePortalStore;
    const apeConfig: ApeConfig = {
      openConnectModal: mockOpenModal,
    };
    customRender(<ApePortal />, {
      apeConfig,
    });
    const apeButtons = screen.getAllByRole('button', {
      name: /APE/,
    });
    expect(apeButtons).toHaveLength(2);
    expect(getState().destinationToken.amount).toBe('');
    expect(getState().sourceToken.amount).toBe('');
  });
});
