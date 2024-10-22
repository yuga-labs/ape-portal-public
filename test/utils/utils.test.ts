import {
  cn,
  readableAmount,
  secondsToReadableTime,
  shortenAddress,
} from '../../lib/utils/utils';

describe('cn', () => {
  it('should concatenate class names correctly', () => {
    const result = cn('aw-text-sm', 'aw-text-lg', 'aw-font-bold');
    expect(result).toBe('aw-text-lg aw-font-bold');
  });

  it('should handle falsy values correctly', () => {
    const result = cn('aw-text-sm', '', undefined, false, 0);
    expect(result).toBe('aw-text-sm');
  });
});

describe('shortenAddress', () => {
  it('should shorten the address correctly', () => {
    const address = '0x1234567890abcdef';
    const result = shortenAddress(address);
    expect(result).toBe('0x1234...cdef');
  });
});

describe('readableAmount', () => {
  describe('readableAmount', () => {
    it('should truncate the amount to the specified number of decimals', () => {
      const testCases = [
        { amount: 0.123_456_789, decimals: 5, expected: '0.12346' },
        { amount: 12_345_678_912_345, decimals: 5, expected: '12345678912345' },
        {
          amount: '123456789123.12345678912345',
          decimals: 5,
          expected: '123456789123.12',
        },
        { amount: 0.000_01, decimals: 5, expected: '0.00001' },
        { amount: 0.000_001, decimals: 5, expected: '<0.00001' },
        { amount: 0, decimals: 5, expected: '0' },
      ];

      for (const { amount, decimals, expected } of testCases) {
        const result = readableAmount(amount, decimals);
        expect(result).toBe(expected);
      }
    });
  });
});

describe('secondsToReadableTime', () => {
  const testCases = [
    { seconds: 1, expected: '1 second' },
    { seconds: 30, expected: '30 seconds' },
    { seconds: 90, expected: '1 minute' },
    { seconds: 120, expected: '2 minutes' },
    { seconds: 3599, expected: '59 minutes' },
    { seconds: 3600, expected: '1 hour' },
    { seconds: 86_399, expected: '23 hours' },
    { seconds: 86_400, expected: '1 day' },
    { seconds: 172_800, expected: '2 days' },
  ];

  for (const { seconds, expected } of testCases) {
    it(`should return the time in the correct format for ${seconds} seconds`, () => {
      const result = secondsToReadableTime(seconds);
      expect(result).toBe(expected);
    });
  }
});
