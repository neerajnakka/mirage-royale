import { processGameRequest } from '../src/lib/store';
import { GameActionPayload } from '../src/lib/types';

// Vercel Serverless Function Handler (supports both Node IncomingMessage/ServerResponse and Web Request)
export default async function handler(req: any, res?: any) {
  // Handle Web Standard Request (Edge / modern Node runtime)
  if (typeof Request !== 'undefined' && req instanceof Request && !res) {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    }

    try {
      let payload: GameActionPayload;
      if (req.method === 'GET') {
        const url = new URL(req.url);
        const code = url.searchParams.get('code') || '';
        const playerId = url.searchParams.get('playerId') || undefined;
        payload = { action: 'get_room', code, playerId };
      } else {
        payload = (await req.json()) as GameActionPayload;
      }

      const result = await processGameRequest(payload);
      return new Response(JSON.stringify({ ok: true, ...result }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ ok: false, error: err?.message || 'Unexpected server error' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0',
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    }
  }

  // Handle Classic Vercel Node.js (req, res)
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    let payload: GameActionPayload;
    if (req.method === 'GET') {
      const code = (req.query?.code as string) || '';
      const playerId = (req.query?.playerId as string) || undefined;
      payload = { action: 'get_room', code, playerId };
    } else {
      payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    const result = await processGameRequest(payload);
    return res.status(200).json({ ok: true, ...result });
  } catch (err: any) {
    return res.status(400).json({
      ok: false,
      error: err?.message || 'Unexpected server error',
    });
  }
}
