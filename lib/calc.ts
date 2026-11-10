import { plannerSchema, type PlannerInput } from './schema';
import { questionsForTelco } from './questions';

export type PathId = 'A' | 'B' | 'C';
export type PathResult = { id: PathId; name: string; total: number; cumulative: number[]; notes: string[]; reason: string };
export type Scenario = { id: string; label: string; assumptions: string[]; paths: PathResult[]; cheapestPath: PathId; crossoverMonth: number | null; abandonmentMostExpensiveMonth: number | null; savingsVsWorst: number };
const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const formatMoney = (n: number) => `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function calculate(raw: unknown) {
  const input = plannerSchema.parse(raw);
  const r = input.contractStatus === 'no_minimum_contract' ? 0 : input.monthsRemaining!;
  const horizon = Math.max(r, 12);
  const baseAssumptions = [
    'Unpaid bills may keep building. Real treatment depends on your provider.',
    `All paths use the same ${horizon}-month horizon. Old-line billing is modelled for ${r} months only; real billing could continue beyond this.`,
    'Late charges are modelled as one flat monthly charge from month 2 to the end of the horizon, without compounding or a cap.',
    'The entered SIM / prepaid setup cost is charged once on every path. A physical SIM is not always required; enter RM 0.00 if no setup charge applies. Number retention affects notes only. Taxes, device balances and other unentered charges are excluded.',
    'Promotion changes apply to the waiting path. The abandonment model uses the original postpaid fee; your provider may change that fee too.',
    ...(input.contractStatus === 'not_sure' ? [`Assumed: ${r} months remaining, using your guess. This horizon and all totals depend on that guess.`] : []),
  ];
  const fees = input.earlyTerminationFee === 'unknown' ? [{ label: 'Low fee', value: 0 }, { label: 'High fee', value: input.postpaidMonthlyFee * Math.max(r, 1) }] : [{ label: '', value: input.earlyTerminationFee === 'percent' ? input.earlyTerminationValue! / 100 * input.postpaidMonthlyFee * r : input.earlyTerminationValue! }];
  const prices = input.promoPrice === 'unknown' ? [{ label: 'Price stays the same', after: input.postpaidMonthlyFee, months: 0 }, { label: 'Price goes up', after: input.postpaidMonthlyFee * 1.25, months: 3 }] : [{ label: '', after: input.promoPrice === 'known' ? input.priceAfterPromo! : input.postpaidMonthlyFee, months: input.promoMonthsLeft ?? 0 }];
  const lateCharges = input.lateFeeStatus === 'unknown' ? [{ label: 'Sample late charge', value: 10 }, { label: 'No late charge', value: 0 }] : [{ label: '', value: input.lateFeePerMonth! }];
  const scenarios: Scenario[] = [];
  for (const fee of fees) for (const price of prices) for (const late of lateCharges) {
    const assumptions = [...baseAssumptions];
    if (input.lateFeeStatus === 'unknown') assumptions.push(`Assumed fictional late charge: ${formatMoney(late.value)} per month. Compare the RM 10.00 sample with a no-charge illustration; neither is a provider estimate or a bound.`);
    if (input.earlyTerminationFee === 'unknown') assumptions.push(`Assumed fictional ${fee.label.toLowerCase()}: ${formatMoney(fee.value)}. The high case is one monthly fee × max(remaining months, 1); these are illustrations, not bounds on your real fee.`);
    if (input.promoPrice === 'unknown') assumptions.push(price.label === 'Price goes up' ? `Assumed fictional increase: 25% after month 3, to ${formatMoney(price.after)}. Actual increases may differ.` : 'Assumed: the postpaid price stays the same.');
    const a = [0], b = [0], c = [0];
    // Month zero records an immediate prepaid switch when there is no wait.
    if (r === 0) a[0] = input.newSimCost;
    for (let m = 1; m <= horizon; m++) {
      const postpaid = m > price.months ? price.after : input.postpaidMonthlyFee;
      a.push(round(a[m - 1] + (m <= r ? postpaid : input.prepaidMonthlyCost) + (r > 0 && m === r ? input.newSimCost : 0)));
      b.push(round(b[m - 1] + input.prepaidMonthlyCost + (m === 1 ? fee.value + input.newSimCost : 0)));
      c.push(round(c[m - 1] + input.prepaidMonthlyCost + (m === 1 ? input.newSimCost : 0) + (m <= r ? input.postpaidMonthlyFee : 0) + (m >= 2 ? late.value : 0)));
    }
    const paths: PathResult[] = [
      { id: 'A', name: 'Wait it out', total: a[horizon], cumulative: a, reason: r ? `Keep paying postpaid for ${r} months, then switch to prepaid.` : 'No remaining wait: switch to prepaid immediately.', notes: ['Confirm the end date and formally close or migrate the account.', ...(input.keepNumber ? ['Ask whether a prepaid migration can retain your number.'] : [])] },
      { id: 'B', name: 'Terminate early', total: b[horizon], cumulative: b, reason: `Pay ${formatMoney(fee.value)} to exit, then use prepaid from month 1.`, notes: ['Request a final settlement and written account closure.', ...(input.keepNumber ? ['Arrange number migration before closing the line.'] : ['Your old number may be released.'])] },
      { id: 'C', name: 'Abandon the line', total: c[horizon], cumulative: c, reason: 'Prepaid starts now, while old-line bills and late charges accumulate.', notes: ['Old-line monthly fees are modelled only through the entered remaining months; actual billing could continue longer.', 'Stopping email reminders does not establish account closure or settlement.', 'An unresolved account remains under your name.', 'Possible future surprise bills; unpaid balances still need settlement.', 'A new prepaid number does not close the old account.', ...(input.keepNumber ? ['This path uses a new number; your old number may be lost.'] : [])] },
    ];
    const ordered = [...paths].sort((x, y) => x.total - y.total);
    scenarios.push({ id: `scenario-${scenarios.length}`, label: [fee.label, price.label, late.label].filter(Boolean).join(' / ') || 'Your numbers', assumptions, paths, cheapestPath: ordered[0].id, crossoverMonth: b.findIndex((value, m) => m > 0 && c[m] > value) === -1 ? null : b.findIndex((value, m) => m > 0 && c[m] > value), abandonmentMostExpensiveMonth: a.findIndex((value, m) => m > 0 && c[m] > value && c[m] > b[m]) === -1 ? null : a.findIndex((value, m) => m > 0 && c[m] > value && c[m] > b[m]), savingsVsWorst: round(ordered[2].total - ordered[0].total) });
  }
  return { horizon, monthsRemaining: r, ...scenarios[0], scenarios, questionsForTelco: questionsForTelco(input), hasUnknowns: input.contractStatus === 'not_sure' || input.earlyTerminationFee === 'unknown' || input.promoPrice === 'unknown' || input.lateFeeStatus === 'unknown' };
}
export type CalculationResult = ReturnType<typeof calculate>;
