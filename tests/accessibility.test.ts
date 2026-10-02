import { describe, expect, it } from 'vitest';

function luminance(hex: string): number {
  const channels = hex.replace('#', '').match(/.{2}/g)!.map((value) => parseInt(value, 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('high-priority palette contrast', () => {
  it('keeps secondary body copy and cyan UI labels above WCAG AA normal-text contrast on core surfaces', () => {
    const secondaryText = '#94A3B8';
    for (const surface of ['#05060C', '#0D1124', '#141829']) {
      expect(contrastRatio(secondaryText, surface), `${secondaryText} on ${surface}`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio('#00F2FE', surface), `cyan on ${surface}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('uses dark text on bright fuchsia/coral/gold action gradients for readable button labels', () => {
    const darkLabel = '#020617';
    for (const accent of ['#FF2A85', '#F43F5E', '#FFB800']) {
      expect(contrastRatio(darkLabel, accent), `${darkLabel} on ${accent}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
