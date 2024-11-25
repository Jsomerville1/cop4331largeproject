// jest.setup.ts

import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// Store the original window.location
const originalLocation = window.location;

// Override window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    ...originalLocation,
    href: '', // Initial mock URL
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
});

// Assign to globalThis.importMeta with the complete structure
globalThis.importMeta = {
  env: {
    MODE: 'test', // Set the desired mode for testing
    API_URL: 'http://copteam22.xyz:5000', // Example additional variable
    BASE_URL: '/', // Required by Vite
    DEV: false,    // Required by Vite
    PROD: false,   // Required by Vite
    SSR: false,    // Required by Vite
    // Add any other environment variables your application requires
  },
  url: '', // Mock URL
  glob: jest.fn(),
  globEager: jest.fn(),
  globImport: jest.fn(),
  jest: jest, // Reference to Jest's API
  resolve: (path: string) => path, // Simple resolve function
  dirname: '/fake/dirname', // Mock dirname
  filename: '/fake/filename', // Mock filename
} as unknown as ImportMeta;

// Optional: Reset mocks before each test
beforeEach(() => {
  fetchMock.resetMocks();
  jest.clearAllMocks();
});
