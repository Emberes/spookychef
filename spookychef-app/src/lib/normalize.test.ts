import { normalizeIngredient } from './normalize';
import { jaccardSimilarity, levenshteinDistance } from './similarity';

describe('normalizeIngredient', () => {
  it('should normalize ingredient names', () => {
    expect(normalizeIngredient(' Lök ')).toBe('onion');
    expect(normalizeIngredient('Gul lök')).toBe('yellow-onion');
    expect(normalizeIngredient('rödlök')).toBe('red-onion');
    expect(normalizeIngredient('Paprika')).toBe('bell pepper');
    expect(normalizeIngredient('Röd Paprika')).toBe('red-bell-pepper');
    expect(normalizeIngredient('grön paprika')).toBe('green-bell-pepper');
    expect(normalizeIngredient('Bönor')).toBe('beans');
    expect(normalizeIngredient('Svarta Bönor')).toBe('black-beans');
    expect(normalizeIngredient('kidneybönor')).toBe('kidney-beans');
    expect(normalizeIngredient('Grädde')).toBe('cream');
    expect(normalizeIngredient('vispgrädde')).toBe('whipping-cream');
  });

  it('should handle ingredients without aliases', () => {
    expect(normalizeIngredient('Tomat')).toBe('tomat');
    expect(normalizeIngredient(' Gurka ')).toBe('gurka');
  });
});

describe('jaccardSimilarity', () => {
  it('should calculate Jaccard similarity correctly for identical sets', () => {
    const set1 = new Set(['apple', 'banana', 'orange']);
    const set2 = new Set(['apple', 'banana', 'orange']);
    expect(jaccardSimilarity(set1, set2)).toBe(1);
  });

  it('should calculate Jaccard similarity correctly for different sets', () => {
    const set1 = new Set(['apple', 'banana']);
    const set2 = new Set(['banana', 'orange']);
    expect(jaccardSimilarity(set1, set2)).toBe(1 / 3);
  });

  it('should calculate Jaccard similarity correctly for disjoint sets', () => {
    const set1 = new Set(['apple', 'banana']);
    const set2 = new Set(['orange', 'grape']);
    expect(jaccardSimilarity(set1, set2)).toBe(0);
  });

  it('should handle empty sets', () => {
    const set1 = new Set<string>();
    const set2 = new Set(['apple', 'banana']);
    expect(jaccardSimilarity(set1, set2)).toBe(0);
  });
});

describe('levenshteinDistance', () => {
  it('should calculate Levenshtein distance correctly for identical strings', () => {
    expect(levenshteinDistance('kitten', 'kitten')).toBe(0);
  });

  it('should calculate Levenshtein distance correctly for different strings', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
  });

  it('should calculate Levenshtein distance correctly for empty strings', () => {
    expect(levenshteinDistance('', 'sitting')).toBe(7);
    expect(levenshteinDistance('kitten', '')).toBe(6);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('should calculate Levenshtein distance correctly for transpositions', () => {
    expect(levenshteinDistance('flaw', 'lawn')).toBe(2);
  });
});