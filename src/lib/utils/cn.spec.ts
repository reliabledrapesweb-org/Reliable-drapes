import { describe, expect, test } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  test('merges simple class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  test('handles tailwind class conflicts with proper precedence', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  test('handles conditional classes with falsy values', () => {
    const condition1 = false;
    const condition2 = null;
    expect(cn('base', condition1 && 'false-class', condition2 && 'null-class')).toBe('base');
  });

  test('merges multiple tailwind utilities correctly', () => {
    const result = cn('bg-white', 'border-2', 'rounded-lg', 'shadow-md');
    expect(result).toContain('bg-white');
    expect(result).toContain('border-2');
    expect(result).toContain('rounded-lg');
    expect(result).toContain('shadow-md');
  });

  test('handles empty input gracefully', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  test('overrides responsive breakpoint classes', () => {
    expect(cn('text-sm', 'md:text-base', 'md:text-lg')).toBe('text-sm md:text-lg');
  });
});
