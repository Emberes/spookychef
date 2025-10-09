import { normalizeIngredient } from './normalize';

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