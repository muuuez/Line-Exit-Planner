import { Suspense } from 'react';
import { Planner } from '@/components/planner';
export default function PlannerPage() { return <Suspense fallback={<main id="main" className="planner-page"><p>Opening your planner…</p></main>}><Planner /></Suspense>; }
