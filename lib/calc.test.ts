import { describe, expect, it } from 'vitest';
import { calculate } from './calc';
import { fictionalExample } from './schema';

const base = { ...fictionalExample, promoPrice: 'none' as const };
describe('line exit calculations', () => {
  it('compares a fixed-fee contract across a common horizon', () => {
    const r = calculate(base);
    expect(r.horizon).toBe(12);
    expect(r.paths.map(p => p.total)).toEqual([770, 610, 1120]);
    expect(r.cheapestPath).toBe('B');
    expect(r.savingsVsWorst).toBe(510);
    expect(r.paths.every(p => p.cumulative.length === 13)).toBe(true);
    expect(r.paths[0].cumulative[8]).toBe(650);
  });
  it('switches immediately without a minimum contract and ignores stale remaining months', () => {
    const r = calculate({ ...base, contractStatus: 'no_minimum_contract', earlyTerminationValue: 0 });
    expect(r.monthsRemaining).toBe(0);
    expect(r.paths.map(p => p.total)).toEqual([370, 370, 480]);
    expect(r.paths[0].cumulative[0]).toBe(10);
  });
  it('calculates a percent of the current monthly fee times remaining months', () => {
    const r = calculate({ ...base, earlyTerminationFee: 'percent', earlyTerminationValue: 50 });
    expect(r.paths[1].total).toBe(690);
  });
  it('exposes unknown termination fees as clearly assumed scenarios', () => {
    const r = calculate({ ...base, earlyTerminationFee: 'unknown' });
    expect(r.scenarios).toHaveLength(2);
    expect(r.scenarios.map(s => s.paths[1].total)).toEqual([370, 1010]);
    expect(r.scenarios.every(s => s.assumptions.some(a => a.includes('Assumed fictional')))).toBe(true);
    expect(r.questionsForTelco.some(q => q.includes('exact early termination fee'))).toBe(true);
  });
  it('applies a known promotion increase from the month after it ends, to the waiting path', () => {
    const r = calculate(fictionalExample);
    expect(r.paths[0].cumulative[3]).toBe(240);
    expect(r.paths[0].cumulative[4]).toBe(340);
    expect(r.paths.map(p => p.total)).toEqual([870, 610, 1120]);
  });
  it('finds the first strict crossover and separately the most-expensive month', () => {
    const r = calculate(base);
    expect(r.crossoverMonth).toBe(3);
    expect(r.abandonmentMostExpensiveMonth).toBe(3);
    expect(r.paths[2].cumulative[2]).toBeLessThan(r.paths[1].cumulative[2]);
    expect(r.paths[2].cumulative[3]).toBeGreaterThan(r.paths[1].cumulative[3]);
  });
  it('handles zero remaining months without dropping the SIM charge', () => {
    const r = calculate({ ...base, monthsRemaining: 0, earlyTerminationValue: 0, lateFeePerMonth: 0 });
    expect(r.paths.map(p => p.total)).toEqual([370, 370, 370]);
    expect(r.crossoverMonth).toBeNull();
    expect(r.abandonmentMostExpensiveMonth).toBeNull();
    expect(r.savingsVsWorst).toBe(0);
  });
  it('returns all unknown fee and price combinations plus guessed-month and late-fee assumptions', () => {
    const r = calculate({ ...base, contractStatus: 'not_sure', earlyTerminationFee: 'unknown', promoPrice: 'unknown', lateFeeStatus: 'unknown' });
    expect(r.scenarios).toHaveLength(8);
    expect(r.scenarios[2].paths[0].total).toBe(870);
    expect(r.assumptions.some(a => a.includes('your guess'))).toBe(true);
    expect(r.assumptions.some(a => a.includes('RM 10.00'))).toBe(true);
  });
  it('uses a 36-month horizon for a longer contract', () => {
    const r = calculate({ ...base, monthsRemaining: 36 });
    expect(r.horizon).toBe(36);
    expect(r.paths[0].total).toBe(2890);
    expect(r.paths[0].cumulative).toHaveLength(37);
  });
  it('compares an unknown sample late charge with a no-charge illustration', () => {
    const r = calculate({ ...base, lateFeeStatus: 'unknown' });
    expect(r.scenarios.map(s => s.paths[2].total)).toEqual([1120, 1010]);
    expect(r.scenarios[0].paths[0].total).toBe(r.scenarios[1].paths[0].total);
  });
  it.each([
    { postpaidMonthlyFee: -1 }, { monthsRemaining: 37 }, { monthsRemaining: 1.5 },
    { earlyTerminationFee: 'percent', earlyTerminationValue: 101 },
    { postpaidMonthlyFee: '80' }, { prepaidMonthlyCost: NaN },
    { monthsRemaining: undefined }, { earlyTerminationValue: undefined },
    { promoPrice: 'known', priceAfterPromo: undefined }, { lateFeePerMonth: undefined },
  ])('rejects invalid input: %j', patch => {
    expect(() => calculate({ ...base, ...patch })).toThrow();
  });
  it('rounds cumulative currency values to cents', () => {
    const r = calculate({ ...base, postpaidMonthlyFee: 0.1, prepaidMonthlyCost: 0.2 });
    expect(r.paths[0].total).toBe(11.6);
  });
});
