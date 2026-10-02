import { describe, expect, it } from 'vitest';
import { TRIVIA_PROMPTS, TRIVIA_SOURCES } from '../src/lib/prompts';

describe('researched trivia dossiers', () => {
  it('has at least three sourced prompts per category and a verifiable source URL for every fact', () => {
    const categories = new Map<string, number>();
    for (const prompt of TRIVIA_PROMPTS) {
      categories.set(prompt.category, (categories.get(prompt.category) || 0) + 1);
      const source = TRIVIA_SOURCES[prompt.id];
      expect(source, `${prompt.id} should have a source`).toBeTruthy();
      expect(source.label.length).toBeGreaterThan(8);
      expect(new URL(source.url).protocol).toBe('https:');
    }
    expect(TRIVIA_PROMPTS.length).toBeGreaterThanOrEqual(24);
    for (const count of categories.values()) expect(count).toBeGreaterThanOrEqual(4);
  });

  it('has unique prompt IDs, a real blank, and non-empty truth for every dossier', () => {
    const ids = TRIVIA_PROMPTS.map((prompt) => prompt.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const prompt of TRIVIA_PROMPTS) {
      expect(prompt.question).toContain('_____');
      expect(prompt.truth.trim().length).toBeGreaterThan(0);
      expect(prompt.houseDecoys.length).toBeGreaterThanOrEqual(3);
    }
  });
});
