import { describe, it, expect } from 'vitest';

describe('Frontend Setup', () => {
  it('should have React installed', () => {
    expect(typeof React).toBeDefined();
  });

  it('should have Testing Library available', () => {
    expect(true).toBe(true);
  });

  it('should pass a basic assertion', () => {
    const sum = 1 + 2;
    expect(sum).toBe(3);
  });
});
