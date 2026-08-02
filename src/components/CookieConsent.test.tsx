import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import CookieConsent from './CookieConsent';
import {
  COOKIE_CONSENT_NAME,
  OPEN_COOKIE_SETTINGS_EVENT,
  THEME_COOKIE_NAME,
  deleteCookie,
  getCookie,
  setCookie,
} from '../utils/cookies';

describe('CookieConsent', () => {
  beforeEach(() => {
    deleteCookie(COOKIE_CONSENT_NAME);
    deleteCookie(THEME_COOKIE_NAME);
  });

  afterEach(() => {
    cleanup();
    deleteCookie(COOKIE_CONSENT_NAME);
    deleteCookie(THEME_COOKIE_NAME);
  });

  it('stores preference consent and allows settings to be reopened', () => {
    render(<CookieConsent />);

    expect(screen.getByRole('dialog', { name: /choose how this site remembers you/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Allow preferences' }));

    expect(getCookie(COOKIE_CONSENT_NAME)).toBe('preferences');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT)));
    expect(screen.getByRole('dialog', { name: /choose how this site remembers you/i })).toBeInTheDocument();
  });

  it('removes the optional theme cookie when necessary-only is selected', () => {
    setCookie(THEME_COOKIE_NAME, 'dark', 365);
    render(<CookieConsent />);

    fireEvent.click(screen.getByRole('button', { name: 'Necessary only' }));

    expect(getCookie(COOKIE_CONSENT_NAME)).toBe('necessary');
    expect(getCookie(THEME_COOKIE_NAME)).toBeNull();
  });
});
