const PRESENCE_WORKER_URL = 'https://sofinora.brynold1997.workers.dev/api/presence';

export const onRequest = async ({ request }) => {
  const upstreamRequest = new Request(PRESENCE_WORKER_URL, request);
  return fetch(upstreamRequest);
};
