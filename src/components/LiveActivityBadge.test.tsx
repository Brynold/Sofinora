import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LiveActivityBadge from './LiveActivityBadge';

describe('LiveActivityBadge', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('shows the real active visitor count returned by the presence service', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ activeSessions: 3 }),
    }));

    render(<LiveActivityBadge />);

    expect(screen.getByText('connecting')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
    expect(screen.getByText('active now')).toBeInTheDocument();
    expect(screen.getByText('Anonymous active sessions')).toBeInTheDocument();
  });

  it('does not display a fabricated count when the service is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    render(<LiveActivityBadge />);

    await waitFor(() => expect(screen.getByText('live count unavailable')).toBeInTheDocument());
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
