export type CookieConsentLevel = 'necessary' | 'preferences';

export const COOKIE_CONSENT_NAME = 'finplanner_cookie_consent';
export const THEME_COOKIE_NAME = 'finplanner_theme';
export const COOKIE_CONSENT_EVENT = 'finplanner-cookie-consent-changed';
export const OPEN_COOKIE_SETTINGS_EVENT = 'finplanner-open-cookie-settings';

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(prefix));

  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
};

export const setCookie = (name: string, value: string, maxAgeDays: number): void => {
  if (typeof document === 'undefined') return;

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const maxAge = Math.round(maxAgeDays * 24 * 60 * 60);
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
};

export const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const getCookieConsent = (): CookieConsentLevel | null => {
  const value = getCookie(COOKIE_CONSENT_NAME);
  return value === 'necessary' || value === 'preferences' ? value : null;
};

export const saveCookieConsent = (level: CookieConsentLevel): void => {
  setCookie(COOKIE_CONSENT_NAME, level, 180);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: level }));
};

export const preferencesAllowed = (): boolean => getCookieConsent() === 'preferences';

