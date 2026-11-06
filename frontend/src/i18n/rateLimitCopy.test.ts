import { describe, expect, it } from 'vitest';
import viMessages from './vi.json';
import viCustom from './vi-custom.json';

const rateCopy = [
  viMessages['1,420 req/s'],
  viMessages['Peak: 68.4k req/s'],
  viMessages[
    'determines your maximum burst velocity (requests per second) to protect against traffic spikes and ensure fair availability.'
  ],
  viMessages['Real-time throughput across global edge nodes (Requests / sec)'],
  viCustom['RPS: 4,820 req/s across edge nodes'],
  viCustom['req/sec'],
  viCustom['req/sec rate limit'],
];

describe('rate limit copy uses the backend minute window', () => {
  it('does not describe plan or burst limits as per second', () => {
    for (const text of rateCopy) {
      expect(text).toBeTruthy();
      expect(text).not.toMatch(/giây|\/s\b|req\/s/);
      expect(text).toMatch(/phút/);
    }
  });
});
