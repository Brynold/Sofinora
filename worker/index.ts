import { DurableObject } from 'cloudflare:workers';

const ACTIVE_WINDOW_MS = 45_000;
const MAX_BODY_BYTES = 256;
const VISITOR_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PresenceResult = {
  activeSessions: number;
  expiresInSeconds: number;
  measuredAt: string;
};

export class ActiveVisitorCounter extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS active_visitors (
          visitor_id TEXT PRIMARY KEY,
          last_seen INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_active_visitors_last_seen
          ON active_visitors(last_seen);
      `);
    });
  }

  async heartbeat(visitorId: string): Promise<PresenceResult> {
    if (!VISITOR_ID_PATTERN.test(visitorId)) {
      throw new Error('Invalid visitor ID');
    }

    const now = Date.now();
    const cutoff = now - ACTIVE_WINDOW_MS;

    this.ctx.storage.sql.exec('DELETE FROM active_visitors WHERE last_seen < ?', cutoff);
    this.ctx.storage.sql.exec(
      `INSERT INTO active_visitors (visitor_id, last_seen)
       VALUES (?, ?)
       ON CONFLICT(visitor_id) DO UPDATE SET last_seen = excluded.last_seen`,
      visitorId,
      now,
    );

    const { count } = this.ctx.storage.sql
      .exec<{ count: number }>('SELECT COUNT(*) AS count FROM active_visitors')
      .one();

    return {
      activeSessions: count,
      expiresInSeconds: ACTIVE_WINDOW_MS / 1000,
      measuredAt: new Date(now).toISOString(),
    };
  }
}

const jsonHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
};

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== '/api/presence') {
      return new Response('Not Found', { status: 404 });
    }

    if (request.method !== 'POST') {
      return Response.json(
        { error: 'Method not allowed' },
        { status: 405, headers: { ...jsonHeaders, Allow: 'POST' } },
      );
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return Response.json({ error: 'Request body is too large' }, { status: 413, headers: jsonHeaders });
    }

    try {
      const body: unknown = await request.json();
      const visitorId =
        typeof body === 'object' && body !== null && 'visitorId' in body
          ? (body as { visitorId?: unknown }).visitorId
          : undefined;

      if (typeof visitorId !== 'string' || !VISITOR_ID_PATTERN.test(visitorId)) {
        return Response.json({ error: 'A valid visitor ID is required' }, { status: 400, headers: jsonHeaders });
      }

      const counter = env.ACTIVE_VISITORS.getByName('site-wide-presence');
      const result = await counter.heartbeat(visitorId);
      return Response.json(result, { headers: jsonHeaders });
    } catch (error) {
      console.error(JSON.stringify({
        message: 'Presence heartbeat failed',
        error: error instanceof Error ? error.message : String(error),
      }));
      return Response.json({ error: 'Presence service is temporarily unavailable' }, { status: 503, headers: jsonHeaders });
    }
  },
} satisfies ExportedHandler<Env>;
