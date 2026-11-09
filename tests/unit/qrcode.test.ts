import { describe, expect, it, vi } from 'vitest';

import { buildQRCodesPDF } from '../../services/qrcode';

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(
      async () =>
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    ),
  },
}));

const pdfHeader = (doc: Awaited<ReturnType<typeof buildQRCodesPDF>>) =>
  Buffer.from(doc.output('arraybuffer') as ArrayBuffer)
    .subarray(0, 5)
    .toString('latin1');

describe('buildQRCodesPDF', () => {
  it('produces a valid single-page PDF', async () => {
    const doc = await buildQRCodesPDF([
      new URL('https://app.mieuxvoter.fr/vote/abc'),
    ]);

    expect(doc.getNumberOfPages()).toBe(1);
    expect(pdfHeader(doc)).toBe('%PDF-');
    expect(
      (doc.output('arraybuffer') as ArrayBuffer).byteLength
    ).toBeGreaterThan(100);
  });

  it('starts a new page when the 24-code grid is full', async () => {
    const voteUrls = Array.from(
      { length: 25 },
      (_, index) => new URL(`https://app.mieuxvoter.fr/vote/${index}`)
    );

    const doc = await buildQRCodesPDF(voteUrls);

    expect(doc.getNumberOfPages()).toBe(2);
  });

  it('still produces a PDF with no URLs', async () => {
    const doc = await buildQRCodesPDF([]);

    expect(doc.getNumberOfPages()).toBe(1);
    expect(pdfHeader(doc)).toBe('%PDF-');
  });
});
