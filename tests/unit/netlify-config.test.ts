import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { parse } from 'smol-toml';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const requireConfig = createRequire(import.meta.url);

const netlifyConfig = parse(
  fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8')
) as {
  functions?: { included_files?: string[] };
};

describe('Netlify function bundle', () => {
  const includedFiles = netlifyConfig.functions?.included_files ?? [];

  it('includes the i18n config file', () => {
    expect(includedFiles).toContain('next-i18next.config.js');
  });

  it('includes the locale files', () => {
    expect(includedFiles).toContain('public/locales/**');
  });
});

describe('next-i18next runtime config', () => {
  const config = requireConfig(path.join(root, 'next-i18next.config.js')) as {
    localePath: string;
  };

  it('resolves localePath from the project root', () => {
    expect(config.localePath).toBe(path.join(root, 'public/locales'));
  });

  it.each(['en', 'fr'])('has the %s resource namespace', (locale) => {
    expect(
      fs.existsSync(path.join(root, 'public/locales', locale, 'resource.json'))
    ).toBe(true);
  });
});
