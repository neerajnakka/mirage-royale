import { afterEach, beforeEach, describe, expect, it } from 'vitest';
// @ts-ignore generated standalone ESM bundle used by Vercel at /api/game
import handler from '../api/game.js';
import { clearLocalRoomsForTesting } from '../src/lib/store';

interface FakeResponse {
  statusCode: number;
  payload?: Record<string, any>;
  ended: boolean;
  headers: Record<string, string>;
  setHeader(name: string, value: string): this;
  status(code: number): this;
  json(body: Record<string, any>): this;
  end(): this;
}

function makeResponse(): FakeResponse {
  return {
    statusCode: 200,
    ended: false,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

const ENV_KEYS = [
  'VERCEL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
] as const;
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

describe('bundled Vercel /api/game function', () => {
  beforeEach(() => {
    delete process.env.VERCEL;
    clearLocalRoomsForTesting();
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = originalEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    clearLocalRoomsForTesting();
  });

  it('loads its rules/store bundle and creates a room through the Node handler signature', async () => {
    const response = makeResponse();
    await handler({
      method: 'POST',
      body: { action: 'create_room', hostName: 'Vercel Smoke', avatar: '🦊', color: '#00F2FE', timerSeconds: 0 },
    }, response);

    expect(response.statusCode).toBe(200);
    expect(response.payload?.ok).toBe(true);
    expect(response.payload?.room.phase).toBe('lobby');
    expect(response.payload?.room.players[0].name).toBe('Vercel Smoke');
    expect(response.headers['Cache-Control']).toContain('no-store');
  });

  it('returns a clear JSON response when Vercel storage variables are missing', async () => {
    process.env.VERCEL = '1';
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    const response = makeResponse();

    await handler({
      method: 'POST',
      body: { action: 'create_room', hostName: 'Vercel Smoke', avatar: '🦊', color: '#00F2FE' },
    }, response);

    expect(response.statusCode).toBe(400);
    expect(response.payload?.ok).toBe(false);
    expect(response.payload?.error).toContain('Shared game storage is not connected yet');
  });
});
