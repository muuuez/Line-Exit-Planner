import { ArrowUpRight, Check, Clock3, LogOut, Unplug } from 'lucide-react';
import { TextScribble } from '@/components/ui/text-scribble';
import { calculate, formatMoney } from '@/lib/calc';
import { fictionalExample } from '@/lib/schema';

/** A fictional route map: it illustrates choices, not a provider recommendation. */
export function ExitRouteExample() {
  const example = calculate(fictionalExample);
  const captions = ['Stay until the contract ends', 'Settle up. Move to prepaid.', 'New number. Old account.'];
  const icons = [Clock3, LogOut, Unplug];
  return <div className="exit-map">
    <div className="exit-map-heading"><span className="eyebrow">PICK YOUR NEXT TURN</span><span className="sample-tag">Fictional example</span></div>
    <div className="exit-map-origin"><span /> One postpaid plan. Three possible exits.</div>
    <div className="exit-map-routes">
      <svg className="exit-map-lines" viewBox="0 0 80 360" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path className="exit-map-branch branch-wait" d="M12 180H25Q38 180 38 166V74Q38 60 52 60H80" />
        <path className="exit-map-branch branch-exit" d="M12 180H80" />
        <path className="exit-map-branch branch-abandon" d="M12 180H25Q38 180 38 194V286Q38 300 52 300H80" />
      </svg>
      <div className="exit-map-options">{example.paths.map((p, i) => {
        const best = p.id === example.cheapestPath;
        const Icon = icons[i];
        return <div className={`exit-option ${best ? 'exit-option-best' : ''}`} key={p.id}>
          <div className="exit-option-heading"><span className="exit-route-icon"><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></span><strong>{p.name}</strong>{best && <ArrowUpRight size={18} aria-hidden="true" />}</div>
          <p>{captions[i]}</p>
          <div className="exit-option-bottom"><span className="exit-option-price">{best ? formatMoney(p.total) : <TextScribble type="strike-through" color="#ff7a18" trigger="view" iterations={2} strokeWidth={1.4} duration={0.8} delay={i === 0 ? 0.4 : 0.75}>{formatMoney(p.total)}</TextScribble>}</span>{best && <span className="best-tag"><Check size={12} aria-hidden="true" /> Lowest estimate</span>}</div>
        </div>;
      })}</div>
    </div>
    <div className="exit-map-footer"><span>12 months, side by side</span><strong>RM 510.00 between the highest and lowest.</strong></div>
    <p className="exit-map-caption">Illustrative figures, not a quote. Orange strokes mark higher costs, not discounts.</p>
  </div>;
}
