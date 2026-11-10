import { NextResponse } from 'next/server';
import { plannerSchema } from '@/lib/schema';
import { calculate } from '@/lib/calc';
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Send a valid JSON body.', fieldErrors: {} }, { status: 400 }); }
  const parsed = plannerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please check the highlighted fields.', fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  return NextResponse.json(calculate(parsed.data), { headers: { 'Cache-Control': 'no-store' } });
}
