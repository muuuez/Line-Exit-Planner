# Line Exit Planner

A scenario calculator that helps Malaysian mobile customers understand the possible cost of moving from postpaid to prepaid.

It compares three choices over the same period: **wait out the contract**, **officially terminate early**, or **get a new prepaid number while leaving the old line unresolved**.

## The problem

Getting a new number does not automatically tell you what happened to the old account. Someone might stop using a postpaid line while bills and late charges continue under their name.

Line Exit Planner makes that trade-off easier to understand. It turns entered figures into a side-by-side comparison and gives users questions to confirm with their provider before deciding what to do.

## What the app does

- Collects monthly postpaid fees, remaining contract months, termination fees, promotion details, prepaid costs, setup costs and late charges.
- Compares the estimated total cost of all three paths over at least 12 months, or the remaining contract period if longer.
- Shows cumulative monthly costs in a chart and an accessible table.
- Highlights the lowest estimate in the selected scenario, including ties.
- Identifies when abandoning first costs more than terminating, and separately when it first costs more than both alternatives.
- Shows assumed values and lets users compare scenarios when information is unknown.
- Generates a provider checklist that can be copied, plus a downloadable plain-text summary.

## How to use it

1. Start with your own numbers, or load the clearly labelled fictional example.
2. Enter what you know. If you are unsure, choose “I don't know”; for remaining months, enter a labelled guess.
3. Compare the three paths and read the assumptions alongside the totals.
4. Try the alternative scenarios to see whether the lowest-cost path changes.
5. Take the checklist to your provider, confirm the missing details, then update your numbers.

Wanting to keep your number changes the notes and checklist, not the calculation. A physical SIM purchase is not always needed: the setup-cost field can be RM 0.00. The current simplified model applies the same entered setup cost once to every path.

## Are the results based on real provider data?

**The arithmetic is calculated, but the inputs are not independently verified.** The app uses only numbers entered by the user and clearly fictional sample values. It has no connection to any telco, billing account, plan database or external data service. No real provider names, logos or plan prices are included.

A lowest-cost result means **lowest under the selected assumptions**, not a guaranteed cheapest option or an official settlement quote. Totals on the abandonment path include modelled unpaid bills, not just cash spent on the new line.

## What happens when you choose “I don't know”?

| Unknown | Assumption used |
| --- | --- |
| Contract status or duration | Your guess of 0–36 remaining months sets the comparison period. |
| Termination fee | Compare a fictional RM 0.00 fee with current monthly fee × max(remaining months, 1). |
| Future postpaid price | Compare an unchanged price with a fictional 25% increase after month 3. |
| Monthly late charge | Compare a fictional RM 10.00 monthly charge with RM 0.00. |

If termination fee, future price and late charge are all unknown, the app calculates **eight combinations**. The first displayed combination uses the low termination fee, unchanged price and RM 10.00 sample late charge. It is not a prediction of what is most likely.

These scenarios are illustrations, not probabilities or guaranteed minimum/maximum charges. Your actual outcome may fall outside them. **The more information is unknown, the more the result depends on assumptions.** The tool helps identify which questions matter; it cannot supply your provider's answers.

## How the three paths are calculated

All paths use the same period: the greater of the entered remaining months and 12 months. All money is displayed in RM with two decimal places.

| Path | Modelled costs |
| --- | --- |
| **Wait it out** | Postpaid until the remaining period ends, one setup charge, then prepaid for the rest of the comparison. Entered promotional price changes apply from the month after the promotion ends. |
| **Terminate early** | Termination fee and setup charge at the start, plus prepaid every month. A percentage fee is applied to the original monthly postpaid fee × remaining months. |
| **Abandon the line** | Setup charge and prepaid from the start, plus the old line's original monthly fee for the entered remaining months and a flat late charge each month from month 2 to the end of the comparison. |

With zero remaining months, the waiting path switches immediately and includes its setup cost at month zero. The chart and table show running totals, including this starting point.

The crossover is the **first** month abandonment strictly exceeds another path. Later price changes can change that ordering again. If no crossover appears, that means none within the comparison period; it does not describe later months.

## Fictional example

Suppose a customer enters:

- Postpaid: RM 80.00 per month, with 8 months remaining.
- Promotion: the current price lasts 3 more months, then rises to RM 100.00.
- Fixed termination fee: RM 240.00.
- Prepaid budget: RM 30.00 per month.
- Setup cost: RM 10.00.
- Monthly late charge: RM 10.00.

Over the same 12 months:

| Path | Calculation | Total |
| --- | --- | --- |
| Wait | (3 × RM 80.00) + (5 × RM 100.00) + RM 10.00 + (4 × RM 30.00) | **RM 870.00** |
| Terminate | RM 240.00 + RM 10.00 + (12 × RM 30.00) | **RM 610.00** |
| Abandon | RM 10.00 + (12 × RM 30.00) + (8 × RM 80.00) + (11 × RM 10.00) | **RM 1,120.00** |

Termination has the lowest estimate in this example. Abandonment first exceeds both alternatives in month 3. The difference between the highest and lowest totals is RM 510.00.

These are fictional demonstration figures, not actual plan prices or a quote for any customer.

## Important limitations

- **Old-line monthly billing is modelled only for the entered remaining months.** This is not a claim that billing stops when a minimum period ends. Actual billing could continue longer. With zero remaining months, the model adds no old-line monthly fees and may substantially understate abandonment costs.
- Promotion changes affect the waiting path only. The abandonment model uses the original postpaid fee, although real prices may change too.
- Late charges are flat, non-compounding and uncapped in the model, with one charge per month rather than one charge per unpaid bill. Actual rules may differ.
- Existing arrears, taxes, device balances, promotional clawbacks, deposits, refunds, prorated bills and other unentered charges are not independently calculated.
- Costs after the comparison period are excluded. Stopped email reminders or the end of a contract period do not establish account closure or settlement.
- Number retention, conversion eligibility, settlement amounts and possible waivers must be confirmed with the provider. The lowest estimate is not a recommendation to leave an account unresolved.

## Privacy

No login or database is used. The app keeps inputs and results in page memory and sends the numbers to its own stateless calculation endpoint. It does not save inputs in browser storage, log request bodies, or use analytics or trackers.

Hosting infrastructure may retain request metadata or other information according to its configuration and policies. Copies and downloaded summaries are created only when the user chooses those actions.

## About this repository

This repository contains the web interface, shared input validation, pure calculation functions, generated provider checklist, stateless API and calculation unit tests. It is built with Next.js App Router, React, TypeScript, Tailwind CSS, Zod, Recharts and Vitest.

Its purpose is to make uncertain costs understandable and help users ask better questions—not to replace an official answer from their provider.

> Estimates only, based on the numbers you enter. Not financial or legal advice. Confirm terms with your provider.
