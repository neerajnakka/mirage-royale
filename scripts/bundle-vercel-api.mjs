import { mkdir } from 'node:fs/promises';
import { build } from 'esbuild';

await mkdir('api', { recursive: true });
await build({
  entryPoints: ['src/server/gameHandler.ts'],
  outfile: 'api/game.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  external: ['node:*'],
  sourcemap: false,
  legalComments: 'none',
});

console.log('Bundled the Vercel game function into api/game.js.');
