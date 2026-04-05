import { describe, it, expect } from 'vitest'

/**
 * Example Frontend Test
 * This is a simple test to verify the testing framework works
 */
describe('Math Operations', () => {
  it('should add numbers correctly', () => {
    expect(1 + 2).toBe(3)
  })

  it('should subtract numbers correctly', () => {
    expect(5 - 2).toBe(3)
  })

  it('should multiply numbers correctly', () => {
    expect(3 * 4).toBe(12)
  })
})

describe('Array Operations', () => {
  it('should handle array operations', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  it('should filter arrays correctly', () => {
    const arr = [1, 2, 3, 4, 5]
    const filtered = arr.filter(x => x > 2)
    expect(filtered).toEqual([3, 4, 5])
  })
})

describe('String Operations', () => {
  it('should handle string concatenation', () => {
    const greeting = 'Hello' + ' ' + 'World'
    expect(greeting).toBe('Hello World')
  })

  it('should check if string includes text', () => {
    const text = 'Testing is important'
    expect(text).toContain('Testing')
  })
})
