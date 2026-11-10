import { z } from 'zod';

const money = z.number().finite().min(0).max(1_000_000);
export const plannerSchema = z.object({
  postpaidMonthlyFee: money,
  contractStatus: z.enum(['has_minimum_contract', 'no_minimum_contract', 'not_sure']),
  monthsRemaining: z.number().int().min(0).max(36).optional(),
  earlyTerminationFee: z.enum(['fixed', 'percent', 'unknown']),
  earlyTerminationValue: money.optional(),
  promoPrice: z.enum(['none', 'known', 'unknown']),
  promoMonthsLeft: z.number().int().min(0).max(36).optional(),
  priceAfterPromo: money.optional(),
  prepaidMonthlyCost: money,
  newSimCost: money.default(10),
  lateFeeStatus: z.enum(['known', 'unknown']),
  lateFeePerMonth: money.optional(),
  keepNumber: z.boolean(),
}).superRefine((v, ctx) => {
  const required = (field: keyof typeof v, message: string) => { if (v[field] === undefined) ctx.addIssue({ code: 'custom', path: [field], message }); };
  if (v.contractStatus !== 'no_minimum_contract') required('monthsRemaining', 'Enter remaining months, or your best guess.');
  if (v.earlyTerminationFee !== 'unknown') required('earlyTerminationValue', 'Enter the termination amount or percentage.');
  if (v.earlyTerminationFee === 'percent' && (v.earlyTerminationValue ?? 0) > 100) ctx.addIssue({ code: 'custom', path: ['earlyTerminationValue'], message: 'Percentage must be between 0 and 100.' });
  if (v.promoPrice === 'known') { required('promoMonthsLeft', 'Enter when the promotion ends.'); required('priceAfterPromo', 'Enter the price after the promotion.'); }
  if (v.lateFeeStatus === 'known') required('lateFeePerMonth', 'Enter the monthly late charge.');
});
export type PlannerInput = z.infer<typeof plannerSchema>;
export const fictionalExample: PlannerInput = { postpaidMonthlyFee: 80, contractStatus: 'has_minimum_contract', monthsRemaining: 8, earlyTerminationFee: 'fixed', earlyTerminationValue: 240, promoPrice: 'known', promoMonthsLeft: 3, priceAfterPromo: 100, prepaidMonthlyCost: 30, newSimCost: 10, lateFeeStatus: 'known', lateFeePerMonth: 10, keepNumber: true };
