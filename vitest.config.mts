import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    env: {
      MAILGUN_API_KEY: 'test-key',
      MAILGUN_DOMAIN: 'mg.example.test',
      MAILGUN_URL: 'https://api.mailgun.test',
      FROM_EMAIL_ADDRESS: '"Mieux Voter" <postmaster@mg.example.test>',
      REPLY_TO_EMAIL_ADDRESS: 'app@example.test',
    },
  },
});
