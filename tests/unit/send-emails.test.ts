import i18next from 'i18next';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock('mailgun.js', () => ({
  default: class {
    client() {
      return { messages: { create: createMock } };
    }
  },
}));

import { handler } from '../../functions/send-emails/index';

const recipients = {
  'alice@example.test': {
    title: 'Best proposal',
    urlVote: 'https://app.mieuxvoter.fr/vote/a',
    urlResult: 'https://app.mieuxvoter.fr/result/a',
  },
  'bob@example.test': {
    title: 'Best proposal',
    urlVote: 'https://app.mieuxvoter.fr/vote/b',
    urlResult: 'https://app.mieuxvoter.fr/result/b',
  },
};

type Response = {
  statusCode: number;
  body?: string;
  headers?: Record<string, string>;
};

const validPayload = (overrides: Record<string, unknown> = {}) => ({
  recipients,
  question: 'Best proposal?',
  action: 'invite',
  locale: 'en',
  ...overrides,
});

const send = async (
  body: unknown,
  httpMethod = 'POST'
): Promise<Response> =>
  (await handler(
    { httpMethod, body: JSON.stringify(body), headers: {} } as never,
    {} as never
  )) as unknown as Response;

beforeAll(async () => {
  await vi.waitFor(() => expect(i18next.isInitialized).toBe(true), {
    timeout: 5000,
  });
});

beforeEach(() => {
  createMock.mockReset();
  createMock.mockResolvedValue({ status: 200, message: 'Queued' });
});

describe('send-emails handler', () => {
  it('rejects non-POST requests', async () => {
    const response = await send({}, 'GET');

    expect(response.statusCode).toBe(405);
    expect(response.headers).toEqual({ Allow: 'POST' });
  });

  it('requires recipients', async () => {
    const response = await send({ ...validPayload(), recipients: undefined });

    expect(response).toMatchObject({
      statusCode: 422,
      body: 'The list of recipients is missing.',
    });
  });

  it('requires a question', async () => {
    const response = await send({ ...validPayload(), question: undefined });

    expect(response).toMatchObject({
      statusCode: 422,
      body: 'The question is missing.',
    });
  });

  it('requires a known action', async () => {
    const response = await send({ ...validPayload(), action: 'unknown' });

    expect(response).toMatchObject({ statusCode: 422, body: 'Unknown action.' });
  });

  it('requires a known locale', async () => {
    const response = await send({ ...validPayload(), locale: 'de' });

    expect(response).toMatchObject({ statusCode: 422, body: 'Unknown locale.' });
  });

  it('sends an English invite with localized templates', async () => {
    const response = await send(validPayload());

    expect(response.statusCode).toBe(200);
    expect(createMock).toHaveBeenCalledTimes(1);

    const [domain, mail] = createMock.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(domain).toBe('mg.example.test');
    expect(mail.to).toEqual(Object.keys(recipients));
    expect(mail.subject).toBe('[Invitation to vote] "Best proposal?"');
    expect(mail['o:tag']).toBe('invite');
    expect(mail['recipient-variables']).toBe(JSON.stringify(recipients));
    expect(mail.txt).toContain('Hi there!');
    expect(mail.html).toContain('<!DOCTYPE html>');
    expect(mail.txt).not.toContain('{{');
    expect(mail.html).not.toContain('{{');
  });

  it('sends a French invite', async () => {
    const response = await send(validPayload({ locale: 'fr' }));

    expect(response.statusCode).toBe(200);

    const [, mail] = createMock.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(mail.subject).toBe('[Invitation à voter] "Best proposal?"');
    expect(mail.txt).toContain('Bonjour !');
    expect(mail.txt).not.toContain('Hi there!');
  });

  it('sends an admin link email', async () => {
    const response = await send(validPayload({ action: 'admin' }));

    expect(response.statusCode).toBe(200);

    const [, mail] = createMock.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(mail.subject).toBe('Manage your election');
    expect(mail['o:tag']).toBe('admin');
    expect(mail.txt).toContain('admin link');
  });

  it('forwards Mailgun non-200 responses', async () => {
    createMock.mockResolvedValue({
      status: 500,
      message: 'Boom',
      details: 'broken',
    });

    const response = await send(validPayload());

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body ?? '{}')).toMatchObject({
      message: 'Boom',
      details: 'broken',
    });
  });

  it('handles Mailgun exceptions', async () => {
    createMock.mockRejectedValue(new Error('network down'));

    const response = await send(validPayload());

    expect(response.statusCode).toBe(422);
    expect(JSON.parse(response.body ?? '{}').status).toBe('423');
  });
});
