import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext';
import ShareReportButton from './ShareReportButton';

const originalShare = navigator.share;

afterEach(() => {
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: originalShare,
  });
  vi.restoreAllMocks();
});

describe('ShareReportButton', () => {
  it('shares the result, takeaways, and calculator URL', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });
    window.history.pushState({}, '', '/calculators/sip');

    render(
      <ThemeProvider>
        <h1>SIP Calculator</h1>
        <ShareReportButton
          summary="The projected value is ₹10,00,000."
          details={['Monthly investment: ₹10,000']}
        />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /share this calculation report/i }));

    await waitFor(() => expect(share).toHaveBeenCalledOnce());
    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      title: 'SIP Calculator — Sofinora',
      text: expect.stringContaining('The projected value is ₹10,00,000.'),
      url: 'http://localhost:3000/calculators/sip',
    }));
    expect(share.mock.calls[0][0].text).toContain('Monthly investment: ₹10,000');
    expect(await screen.findByText('Shared')).toBeInTheDocument();
  });
});
