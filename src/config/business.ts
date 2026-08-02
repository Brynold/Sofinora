export const businessConfig = {
  starterPackPrice: 199,
  starterPackPaymentUrl: (import.meta.env.VITE_STARTER_PACK_PAYMENT_URL || '').trim(),
  supportEmail: (import.meta.env.VITE_SUPPORT_EMAIL || '').trim(),
  publicSiteUrl: (import.meta.env.VITE_PUBLIC_SITE_URL || '').trim().replace(/\/$/, ''),
  registrationEndpoint: import.meta.env.MODE === 'test'
    ? ''
    : (import.meta.env.VITE_REGISTRATION_ENDPOINT || '').trim(),
  feedbackEnabled: import.meta.env.MODE === 'test'
    ? true
    : import.meta.env.VITE_FEEDBACK_ENABLED === 'true',
};

export const trackCommerceEvent = (eventName: string, details: Record<string, string | number> = {}) => {
  window.dispatchEvent(new CustomEvent('finplanner:commerce', {
    detail: { eventName, ...details },
  }));

  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.('event', eventName, details);
};
