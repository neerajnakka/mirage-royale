import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { processGameRequest } from './src/lib/store';
import { GameActionPayload } from './src/lib/types';

function gameServerMiddlewarePlugin(): Plugin {
  const handleApiRequest = async (req: any, res: any, next: any) => {
    const urlPath = (req.url || '').split('?')[0];
    if (urlPath !== '/api/game') {
      return next();
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    try {
      let payload: GameActionPayload;
      if (req.method === 'GET') {
        const fullUrl = new URL(req.url || '', 'http://localhost');
        const code = fullUrl.searchParams.get('code') || '';
        const playerId = fullUrl.searchParams.get('playerId') || undefined;
        payload = { action: 'get_room', code, playerId };
      } else {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(Buffer.from(chunk));
        }
        const rawBody = Buffer.concat(chunks).toString('utf-8');
        payload = JSON.parse(rawBody || '{}') as GameActionPayload;
      }

      const result = await processGameRequest(payload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: true, ...result }));
    } catch (err: any) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          ok: false,
          error: err?.message || 'Unexpected error processing game action',
        })
      );
    }
  };

  return {
    name: 'mirage-royale-api-middleware',
    configureServer(server) {
      server.middlewares.use(handleApiRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApiRequest);
    },
  };
}

export default defineConfig({
  plugins: [react(), gameServerMiddlewarePlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
});
