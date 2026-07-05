import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

beforeAll(() => {
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'scrollTo', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
  }
});

afterEach(() => {
  cleanup();
});




