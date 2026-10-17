import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Tự động dọn dẹp DOM và Storage sau mỗi test case
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
});

// Polyfill window.matchMedia cho jsdom
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
