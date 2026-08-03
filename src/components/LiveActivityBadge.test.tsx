import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LiveActivityBadge from './LiveActivityBadge';

describe('LiveActivityBadge', () => {
  it('shows an illustrative activity preview within the 200–300 range', () => {
    render(<LiveActivityBadge />);

    expect(screen.getByText('247')).toBeInTheDocument();
    expect(screen.getByText('activity preview')).toBeInTheDocument();
    expect(screen.getByText('Illustrative visitor activity')).toBeInTheDocument();
  });

  it('does not describe the preview as a live user count', () => {
    render(<LiveActivityBadge />);

    expect(screen.queryByText('active now')).not.toBeInTheDocument();
    expect(screen.queryByText('Anonymous active sessions')).not.toBeInTheDocument();
  });
});
