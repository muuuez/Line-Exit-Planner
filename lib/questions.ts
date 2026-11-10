import type { PlannerInput } from './schema';
export function questionsForTelco(input: PlannerInput): string[] {
  return [
    ...(input.contractStatus === 'not_sure' ? ['Is there a minimum contract period, and exactly how many months remain?'] : []),
    ...(input.earlyTerminationFee === 'unknown' ? ['What is the exact early termination fee, including any device balance or clawbacks?'] : ['Can you confirm my early termination fee in writing?']),
    ...(input.promoPrice !== 'none' ? ['Is my price a promotion, when does it end, and what will I pay after it ends?'] : []),
    'Please give me a written final settlement amount to officially close this line.',
    'When will billing stop, and how can I obtain written confirmation that the account is closed?',
    'Please confirm my account status and outstanding balance in writing, even if bill reminders have stopped.',
    'Can late charges be waived if I settle now?',
    ...(input.lateFeeStatus === 'unknown' ? ['How are late charges calculated, and are there caps or additional charges?'] : []),
    ...(input.keepNumber ? ['Can I move my current number to prepaid, and what steps and charges apply?'] : ['Will my old number be released when the account closes?']),
  ];
}
