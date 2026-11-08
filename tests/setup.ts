import path from 'node:path';

(globalThis as typeof globalThis & { __dirname?: string }).__dirname =
  path.join(process.cwd(), 'functions', 'send-emails');
