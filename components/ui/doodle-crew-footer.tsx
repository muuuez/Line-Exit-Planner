"use client";

import * as React from "react";

/** Deterministic layout keeps server markup and first client render identical. */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export function layoutWord(advances: number[], tracking: number, fontSize: number) {
  const x: number[] = [], w: number[] = [];
  let at = 0;
  const gap = (Number.isFinite(tracking) ? tracking : 0) * fontSize;
  advances.forEach((advance, i) => {
    const a = Number.isFinite(advance) && advance > 0 ? advance : 0;
    x.push(at); w.push(a); at += a + (i < advances.length - 1 ? gap : 0);
  });
  return { x, w, width: Math.max(0, at) };
}
export type Seat = "front" | "top" | "behind";
export function seatPoint(seat: Seat, letterX: number, letterW: number, cap: number, offset: number, scale: number) {
  return { x: letterX + letterW * (0.5 + (Number.isFinite(offset) ? offset : 0)), y: seat === "top" ? -cap : seat === "behind" ? -cap + 30 * scale : 0 };
}
export function lookAt(ex: number, ey: number, tx: number, ty: number, max: number, reach: number) {
  const dx = tx - ex, dy = ty - ey, d = Math.hypot(dx, dy);
  if (!Number.isFinite(d) || d < 1e-6 || max <= 0) return { x: 0, y: 0 };
  const k = max * Math.min(1, d / Math.max(1e-6, reach)) / d;
  return { x: dx * k, y: dy * k };
}
export type Floater = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; fall: number; phase: number; pop: number };
export function stepFloater(f: Floater, dt: number, t: number, w: number, h: number, px: number, py: number, radius: number, rand: () => number): Floater {
  const step = clamp(Number.isFinite(dt) ? dt : 0, 0, 0.05), m = 40;
  if (f.pop > 0) {
    f.pop -= step;
    if (f.pop <= 0) { f.pop = 0; f.x = rand() * w; f.y = -m; f.vx = 0; f.vy = f.fall; }
    return f;
  }
  const dx = f.x - px, dy = f.y - py, d = Math.hypot(dx, dy);
  if (Number.isFinite(d) && d < radius && d > 0.01) {
    const k = (1 - d / radius) ** 2 * 2400;
    f.vx += dx / d * k * step; f.vy += dy / d * k * step;
    f.vr += (dx > 0 ? 1 : -1) * k * 0.004 * step;
  }
  const ease = Math.min(1, step * 2.4);
  f.vx += (Math.sin(t * 0.7 + f.phase) * 14 - f.vx) * ease;
  f.vy += (f.fall - f.vy) * ease;
  f.vr += (Math.sin(f.phase * 3) * 18 - f.vr) * Math.min(1, step * 0.8);
  f.x += f.vx * step; f.y += f.vy * step; f.rot = (f.rot + f.vr * step) % 360;
  if (f.y > h + m) { f.y = -m; f.x = rand() * w; } else if (f.y < -m * 3) f.y = h + m;
  if (f.x < -m) f.x = w + m; else if (f.x > w + m) f.x = -m;
  return f;
}
export function timeline(letters: number, crew: number, words: number, actions: number) {
  const L = Math.max(0, Math.floor(letters) || 0), C = Math.max(0, Math.floor(crew) || 0);
  const W = Math.max(0, Math.floor(words) || 0), A = Math.max(0, Math.floor(actions) || 0);
  const letter = (i: number) => 160 + i * 80;
  const crewStart = letter(Math.max(0, L - 1)) + 420;
  const member = (j: number) => crewStart + j * 130;
  const doodles = crewStart + Math.max(0, C - 1) * 65;
  const word = (k: number) => crewStart + 260 + k * 45;
  const action = (k: number) => word(W) + 120 + k * 110;
  return { ground: 60, letter, crewStart, member, doodles, word, action, total: Math.max(member(Math.max(0, C - 1)) + 720, action(Math.max(0, A - 1)) + 600, letter(Math.max(0, L - 1)) + 560) };
}

export type CrewKind = "yeti" | "kid" | "bird" | "cat" | "ghost" | "mushroom";
export type DoodleKind = "flame" | "sandwich" | "star" | "heart" | "bolt" | "sparkle" | "spiral" | "plane";
export type DoodleCrewPreset = "auto" | "paper" | "night" | "riso" | "sunny";
export interface CrewMember { kind: CrewKind; letter: number; seat?: Seat; offset?: number; scale?: number; flip?: boolean; name?: string; says?: string }
export interface FooterLink { label: string; href?: string }
export interface FooterColumn { title: string; links: FooterLink[] }
export interface FooterAction { label: string; href?: string; icon?: DoodleKind; variant?: "solid" | "outline"; onClick?: () => void }
export interface DoodleCrewFooterProps {
  wordmark?: string; brand?: string; blurb?: string; tagline?: string; columns?: FooterColumn[];
  actions?: FooterAction[]; copyright?: string; legal?: FooterLink[]; socials?: FooterLink[];
  backToTop?: boolean; crew?: CrewMember[]; doodles?: DoodleKind[]; doodleCount?: number;
  preset?: DoodleCrewPreset; palette?: { background?: string; ink?: string; accent?: string };
  minimal?: boolean; fontFamily?: string; serifFamily?: string; tracking?: number; interactive?: boolean; height?: string; className?: string;
}
const PRESETS = {
  auto: { background: "#eef1e7", ink: "#24543f", accent: "#ff7a18" },
  paper: { background: "#f8f9f5", ink: "#24543f", accent: "#ff7a18" },
  night: { background: "#20382c", ink: "#f8f9f5", accent: "#ff9d52" },
  riso: { background: "#f1eee4", ink: "#24543f", accent: "#c87536" },
  sunny: { background: "#f3dfad", ink: "#294832", accent: "#cd6326" },
};
const DEFAULT_CREW: CrewMember[] = [
  { kind: "bird", letter: 1, seat: "top", offset: -.1, scale: .9, name: "The planner", says: "Compare the same months." },
  { kind: "cat", letter: 6, seat: "front", offset: .9, scale: .72, name: "The careful customer", says: "New number. Old bill? Ask first." },
  { kind: "ghost", letter: 3, seat: "behind", offset: -.08, scale: .78, name: "The reminder", says: "Not sure? Try another scenario." },
];
const DEFAULT_DOODLES: DoodleKind[] = ["flame", "star", "plane", "heart", "sandwich", "bolt", "sparkle", "star"];
const DOODLE_COLORS: Record<DoodleKind, string> = {
  flame: "#ff7a1a", sandwich: "#f2c48d", star: "#efbd36", heart: "#ee7291",
  bolt: "#edbc37", sparkle: "#88c8d7", spiral: "#7fa56b", plane: "#f8f9f5",
};
const DEFAULT_ACTIONS: FooterAction[] = [{ label: "Plan my exit", href: "/planner", variant: "solid" }, { label: "Try fictional numbers", href: "/planner?example=1", variant: "outline" }];
type Eye = { x: number; y: number; r: number; pupil: number; max: number };
type Art = { k: number; box: { l: number; r: number; t: number; b: number }; eyes: Eye[]; seat: Seat; body: () => React.ReactNode; front?: () => React.ReactNode; idle?: string };
const ART: Record<CrewKind, Art> = {
  bird: {
    k: 1.22, box: { l: -34, r: 30, t: -62, b: 2 }, seat: "top", idle: "dcf-peck",
    eyes: [{ x: 3, y: -30, r: 4.6, pupil: 2.3, max: 2 }, { x: 12, y: -31, r: 4.6, pupil: 2.3, max: 2 }],
    body: () => <><path className="n" d="M-5 0V-7M-9 0H-1M5 0V-7M1 0H9" /><path d="M-17-16C-26-18-31-14-33-9C-26-10-20-8-15-10Z" /><path d="M-18-14C-20-30-10-40 2-40C16-40 22-28 20-16C18-6 8-4 0-4C-10-4-17-8-18-14Z" /><path className="n" d="M-11-25C-3-26 1-18-3-13C-9-12-15-17-11-25Z" /><path className="a" d="M19-30L29-27 19-23ZM-3-38L4-59 12-37Z" /><circle cx="4" cy="-60" r="2.8" /></>,
  },
  cat: {
    k: 1.06, box: { l: -30, r: 52, t: -110, b: 4 }, seat: "front",
    eyes: [{ x: 10, y: -76, r: 6, pupil: 2.8, max: 2.6 }],
    body: () => <><ellipse className="dcf-shadow" cy="2" rx="32" ry="4" /><g className="dcf-tail"><path d="M18-4C42-4 52-24 46-44C44-51 36-53 34-46C40-30 34-16 16-14Z" /><path className="n" d="M40-16l5 4M45-30l6 1M43-42l6-3" /></g><path d="M-22 0C-28-18-24-42-14-52H14C24-42 28-18 22 0C10 3-10 3-22 0Z" /><path className="n" d="M-8-30-9-1M8-30 9-1" /><path d="M-16 1C-16-5-3-5-3 1ZM3 1C3-5 16-5 16 1Z" /><path className="a" d="M-18-55C-6-49 6-49 18-55L17-46C6-40-6-40-17-46ZM9-45 18-32 6-37Z" /><path d="M-22-86-25-107-7-96ZM8-96 23-108 22-86Z" /><path d="M-26-70C-28-88-16-98 0-98C16-98 28-88 26-70C24-56 12-50 0-50C-12-50-24-56-26-70Z" /><path className="n" d="M-26-80C-14-83 4-87 25-93" /><ellipse className="k" cx="-10" cy="-76" rx="7.5" ry="6.5" /><path className="k" d="M-2.5-68H2.5L0-64.5Z" /><path className="n" d="M0-64.5C-1-60.5-5-60.5-6-62.5M0-64.5C1-60.5 5-60.5 6-62.5M-15-66-29-68M-15-63-28-59M15-66 29-68M15-63 28-59" /></>,
  },
  ghost: {
    k: 1.3, box: { l: -26, r: 26, t: -70, b: 0 }, seat: "behind", idle: "dcf-bob",
    eyes: [{ x: -8, y: -44, r: 6.5, pupil: 3.2, max: 3 }, { x: 9, y: -44, r: 6.5, pupil: 3.2, max: 3 }],
    body: () => <><path d="M-23-14V-40C-23-59-12-67 0-67C12-67 23-59 23-40V-14C12-10-12-10-23-14Z" /><path className="n thin" d="M-16-56C-12-61-6-63-2-63" /><path className="k" d="M-5-33C-3-27 4-27 6-33Z" /></>,
    front: () => <><path d="M-25-32C-27-38-21-42-17-38C-15-42-10-41-10-36L-11-30C-15-28-22-28-25-32ZM25-32C27-38 21-42 17-38C15-42 10-41 10-36L11-30C15-28 22-28 25-32Z" /></>,
  },
  mushroom: {
    k: 1.12, box: { l: -27, r: 27, t: -56, b: 4 }, seat: "front", idle: "dcf-sway",
    eyes: [{ x: -4.5, y: -16, r: 0, pupil: 1.9, max: 1.3 }, { x: 4.5, y: -16, r: 0, pupil: 1.9, max: 1.3 }],
    body: () => <><path className="n" d="M-10-15-17-9M10-15 17-11" /><path d="M-10 0C-12-10-10-22-8-28H8C10-22 12-10 10 0C4 2-4 2-10 0Z" /><path className="a" d="M-25-28C-27-45-12-55 0-55C12-55 27-45 25-28C14-23-14-23-25-28Z" /><circle cx="-12" cy="-40" r="4.2" /><circle cx="6" cy="-46" r="3.4" /><circle cx="15" cy="-34" r="3" /><path className="n" d="M-2-10Q0-6 2-10" /></>,
  },
  kid: {
    k: 1.28, box: { l: -30, r: 30, t: -88, b: 42 }, seat: "top",
    eyes: [{ x: -6, y: -58, r: 0, pupil: 2.5, max: 1.8 }, { x: 6.5, y: -58, r: 0, pupil: 2.5, max: 1.8 }],
    body: () => <><path d="M-15-6H-3L-6 30H-15ZM3-6H15L22 27 12 30Z" /><path className="k" d="M-17 30Q-24 42-14 41H-2Q3 36-5 30ZM11 29Q5 41 16 40L26 38Q31 34 22 27Z" /><path d="M-20-4C-22-20-18-38-10-44H10C18-38 22-20 20-4Z" /><path className="n thick" d="M-19-14H19M-18-26H18M-14-36H14" /><path className="n" d="M-18-36Q-32-23-26-3M18-36Q33-25 28-4" /><circle cy="-60" r="17" /><path className="a" d="M-15-70C-14-87 14-87 15-70ZM-27-68Q0-82 27-68Q0-58-27-68Z" /><path className="n" d="M-5-50Q0-44 5-50" /></>,
  },
  yeti: {
    k: 1, box: { l: -72, r: 60, t: -140, b: 6 }, seat: "front",
    eyes: [{ x: -15, y: -86, r: 8, pupil: 3.6, max: 3.6 }, { x: 13, y: -88, r: 8, pupil: 3.6, max: 3.6 }],
    body: () => <><ellipse className="dcf-shadow" cy="2" rx="54" ry="5" /><path d="M-30-104Q-49-118-40-138L-13-114ZM18-114Q35-133 47-133Q43-110 32-101Z" /><path d="M-44-2C-54-28-54-66-42-90C-32-110-14-118 2-118C22-118 40-108 48-88C58-64 58-28 48-2C30 4-26 4-44-2Z" /><path className="n" d="M-48-62Q0-40 49-26M-50-52Q0-30 49-16" /><path d="M-46-60C-62-50-63-29-51-19Q-36-11-40-28Q-45-39-36-52ZM46-58C61-46 61-26 51-18Q35-10 40-26Q45-38 37-50Z" /><path className="n" d="M-23-98-9-96M6-98 20-100M-12-70Q0-57 12-71" /><path d="M-37-2Q-36-24-16-7Q-15 6-37-2ZM37-2Q36-24 16-7Q15 6 37-2Z" /></>,
  },
};

function Doodle({ kind }: { kind: DoodleKind }) {
  switch (kind) {
    case "star": return <path className="a" d="M0-13 3.6-4.4 13-4 5.8 2.2 8.2 12 0 6.6-8.2 12-5.8 2.2-13-4-3.6-4.4Z" />;
    case "plane": return <><path d="M-13-1 13-10 4 12 0 3Z" /><path className="n" d="M0 3 13-10M0 3-2 9 2 5" /></>;
    case "bolt": return <path className="a" d="M3-14-8 2H-1L-4 14 8-3H1Z" />;
    case "sparkle": return <path className="a" d="M0-13Q1-1 13 0Q1 1 0 13Q-1 1-13 0Q-1-1 0-13Z" />;
    case "heart": return <path className="a" d="M0 11C-6 6-13 1-13-5C-13-10-8-13-4-11Q-1-10 0-6Q1-10 4-11C8-13 13-10 13-5C13 1 6 6 0 11Z" />;
    case "flame": return <><path className="a" d="M0 14C-9 14-12 6-10 0Q-4-6-4-12Q5-6 2-1Q5-4 5-8C10-3 11 4 8 9Q5 14 0 14Z" /><path style={{ fill: "#ffd23f" }} d="M0 11C-5 11-6 7-4 4Q-1 1-1-3Q5 2 3 6Q7 4 5 9Q3 12 0 11Z" /></>;
    case "sandwich": return <><path className="a" d="M-13-1Q-14-14 0-11Q14-14 13-1ZM-13 5H13L12 10H-12Z" /><path style={{ fill: "#ffd23f" }} d="M-12 1H12V5H4L2 9 0 5H-12Z" /><path fill="none" stroke="#639c4b" strokeWidth="2.5" d="M-13 1q2 3 4 0t4 0t4 0t4 0t4 0t4 0" /></>;
    case "spiral": return <path className="n" d="M0 0C2-2 4 0 3 3C1 6-4 5-5 1C-6-4-1-8 4-7C9-5 10 2 7 6" />;
  }
}
const FONT_SIZE = 200;
const DEFAULT_FONT = 'Georgia, "Times New Roman", serif';
const estimate = (word: string) => ({ advances: Array.from(word).map(c => (c === " " ? .3 : /[IJ1]/.test(c) ? .42 : /[MW]/.test(c) ? .98 : .76) * FONT_SIZE), caps: Array.from(word).map(() => .73 * FONT_SIZE), cap: .73 * FONT_SIZE });
const useIso = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
function FooterLinks({ links }: { links: FooterLink[] }) { return <>{links.map(l => l.href ? <a key={l.label} href={l.href}>{l.label}</a> : <span key={l.label}>{l.label}</span>)}</>; }

export default function DoodleCrewFooter({
  wordmark = "OFFRAMP", brand = "Offramp", blurb = "A little clarity before your next move.",
  tagline = "Your next chapter starts with a clearer choice.", columns = [], actions = DEFAULT_ACTIONS,
  copyright = "Offramp · Made for clearer decisions.", legal = [], socials = [], backToTop = true,
  crew = DEFAULT_CREW, doodles = DEFAULT_DOODLES, doodleCount = 6, preset = "auto", palette,
  fontFamily = DEFAULT_FONT, serifFamily = DEFAULT_FONT, tracking = -.035, interactive = true,
  height = "540px", className, minimal = false,
}: DoodleCrewFooterProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const word = wordmark.toUpperCase();
  const chars = React.useMemo(() => Array.from(word), [word]);
  const colors = { ...PRESETS[preset], ...palette };
  const rootRef = React.useRef<HTMLElement>(null), svgRef = React.useRef<SVGSVGElement>(null), worldRef = React.useRef<HTMLDivElement>(null);
  const eyeRefs = React.useRef<(SVGGElement | null)[][]>([]), doodleRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const [metrics, setMetrics] = React.useState(() => estimate(word));
  const [play, setPlay] = React.useState(false), [visible, setVisible] = React.useState(false);
  const [reduced, setReduced] = React.useState(false), [paused, setPaused] = React.useState(false);
  const [talking, setTalking] = React.useState(-1), [hop, setHop] = React.useState(-1);
  const talkTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const hopFrame = React.useRef(0);
  const pointer = React.useRef({ x: NaN, y: NaN });
  const floaters = React.useRef<Floater[]>([]);
  const storyboardStart = React.useRef(0);

  useIso(() => {
    let alive = true;
    const run = () => {
      if (!alive) return;
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = `900 ${FONT_SIZE}px ${fontFamily}`;
      let prev = 0;
      const advances = chars.map((_, i) => { const current = ctx.measureText(chars.slice(0, i + 1).join("")).width; const a = current - prev; prev = current; return a; });
      const caps = chars.map(c => ctx.measureText(c).actualBoundingBoxAscent || .73 * FONT_SIZE);
      setMetrics({ advances, caps, cap: ctx.measureText(word).actualBoundingBoxAscent || .73 * FONT_SIZE });
    };
    run(); document.fonts?.ready.then(run).catch(() => {});
    document.fonts?.addEventListener("loadingdone", run);
    return () => { alive = false; document.fonts?.removeEventListener("loadingdone", run); };
  }, [word, chars, fontFamily]);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches); update();
    mq.addEventListener("change", update); return () => mq.removeEventListener("change", update);
  }, []);
  React.useEffect(() => {
    const root = rootRef.current; if (!root) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); setPlay(true); return; }
    const observer = new IntersectionObserver(entries => {
      const inView = entries.some(e => e.isIntersecting); setVisible(inView); if (inView) setPlay(true);
    }, { threshold: .05 });
    observer.observe(root); return () => observer.disconnect();
  }, []);
  React.useEffect(() => () => { if (talkTimer.current) clearTimeout(talkTimer.current); cancelAnimationFrame(hopFrame.current); }, []);

  const layout = React.useMemo(() => layoutWord(metrics.advances, tracking, FONT_SIZE), [metrics, tracking]);
  const placed = React.useMemo(() => crew.flatMap((m, i) => {
    if (!chars.length) return [];
    const art = ART[m.kind], li = clamp(Math.floor(m.letter) || 0, 0, chars.length - 1);
    const scale = metrics.cap / 144 * art.k * (m.scale ?? 1), seat = m.seat ?? art.seat;
    // Seat on the actual glyph, rather than the tallest capital in the word.
    const point = seatPoint(seat, layout.x[li], layout.w[li], metrics.caps[li], m.offset ?? 0, scale);
    if (seat === "top" && m.kind !== "bird") point.y -= art.box.b * scale;
    return [{ i, m, art, seat, scale, flip: m.flip ? -1 : 1, ...point }];
  }), [crew, chars.length, metrics.cap, metrics.caps, layout]);
  const view = React.useMemo(() => {
    let l = 0, r = layout.width, t = -metrics.cap, b = 30;
    for (const p of placed) {
      const bx = p.flip > 0 ? [p.art.box.l, p.art.box.r] : [-p.art.box.r, -p.art.box.l];
      l = Math.min(l, p.x + bx[0] * p.scale); r = Math.max(r, p.x + bx[1] * p.scale);
      t = Math.min(t, p.y + p.art.box.t * p.scale); b = Math.max(b, p.y + p.art.box.b * p.scale);
    }
    return { x: l - 28, y: t - 28, w: r - l + 56, h: b - t + 56 };
  }, [layout, metrics.cap, placed]);
  const ground = React.useMemo(() => {
    const x0 = view.x + 6, x1 = view.x + view.w - 6;
    let d = 'M' + x0.toFixed(1) + ' 6';
    for (let k = 1; k <= 14; k++) {
      const x = x0 + (x1 - x0) * k / 14;
      d += ' Q' + (x - (x1 - x0) / 28).toFixed(1) + ' ' + (6 + (hash(k * 3.1) - .5) * 5).toFixed(1) + ' ' + x.toFixed(1) + ' ' + (6 + (hash(k * 7.7) - .5) * 2).toFixed(1);
    }
    let tufts = '';
    for (let k = 0; k < 22; k++) {
      const x = x0 + 20 + hash(k * 11.3) * (x1 - x0 - 40), scale = .7 + hash(k * 5.9) * .6;
      tufts += 'M' + x.toFixed(1) + ' 6l' + (2 * scale).toFixed(1) + ' ' + (-9 * scale).toFixed(1) + 'M' + (x + 3 * scale).toFixed(1) + ' 6l' + scale.toFixed(1) + ' ' + (-12 * scale).toFixed(1) + 'M' + (x + 6 * scale).toFixed(1) + ' 6l' + (-scale).toFixed(1) + ' ' + (-7 * scale).toFixed(1);
    }
    const pebbles = Array.from({ length: 9 }, (_, k) => ({ x: x0 + 40 + hash(k * 17.1) * (x1 - x0 - 80), y: 14 + hash(k * 2.3) * 8, r: 2 + hash(k * 9.4) * 2.6 }));
    return { d, tufts, pebbles };
  }, [view]);
  const doodleList = React.useMemo(() => Array.from({ length: doodles.length ? clamp(Math.floor(doodleCount) || 0, 0, 40) : 0 }, (_, i) => ({ kind: doodles[i % doodles.length], size: 22 + hash(i * 4.7) * 12 })), [doodles, doodleCount]);
  const words = tagline.split(/\s+/).filter(Boolean), tl = timeline(chars.length, placed.length, words.length, actions.length);

  useIso(() => {
    const world = worldRef.current; if (!world) return;
    const size = () => {
      const { width: w, height: h } = world.getBoundingClientRect();
      floaters.current = doodleList.map((_, i) => ({ x: (.05 + hash(i * 9.1) * .9) * w, y: hash(i * 3.3) * h * .6, vx: 0, vy: 0, rot: hash(i * 1.7) * 50, vr: 0, fall: 9 + hash(i * 2.9) * 12, phase: hash(i * 8.3) * Math.PI * 2, pop: 0 }));
      floaters.current.forEach((f, i) => { const el = doodleRefs.current[i]; if (el) el.style.transform = `translate(${f.x}px,${f.y}px) rotate(${f.rot}deg)`; });
    };
    size(); if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(size); ro.observe(world); return () => ro.disconnect();
  }, [doodleList]);

  React.useEffect(() => {
    if (!visible || reduced || paused) return;
    let raf = 0, last = performance.now();
    if (!storyboardStart.current) storyboardStart.current = last;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const svg = svgRef.current, world = worldRef.current;
      if (svg) {
        const matrix = svg.getScreenCTM();
        const target = matrix && interactive && Number.isFinite(pointer.current.x) ? new DOMPoint(pointer.current.x, pointer.current.y).matrixTransform(matrix.inverse()) : null;
        placed.forEach(p => p.art.eyes.forEach((eye, e) => {
          const ex = p.x + eye.x * p.scale * p.flip, ey = p.y + eye.y * p.scale;
          const o = lookAt(ex, ey, target?.x ?? (minimal ? ex : p.x + Math.sin(now / 2200 + p.i) * 220), target?.y ?? ey, eye.max, 220);
          const blink = !minimal && Math.sin(now / 1000 + p.i * 2) > .998 ? .12 : 1;
          eyeRefs.current[p.i]?.[e]?.setAttribute("transform", `translate(${(o.x * p.flip).toFixed(2)} ${(eye.y * (1 - blink) + o.y).toFixed(2)}) scale(1 ${blink})`);
        }));
      }
      if (world && (storyboardStart.current === 0 || now - storyboardStart.current > tl.doodles)) {
        const box = world.getBoundingClientRect();
        floaters.current.forEach((f, i) => {
          stepFloater(f, dt, now / 1000, box.width, box.height, interactive ? pointer.current.x - box.left : NaN, interactive ? pointer.current.y - box.top : NaN, 85, Math.random);
          const el = doodleRefs.current[i];
          if (el) { el.style.transform = `translate(${f.x.toFixed(1)}px,${f.y.toFixed(1)}px) rotate(${f.rot.toFixed(1)}deg)`; el.style.opacity = f.pop > 0 ? "0" : ".75"; }
        });
      }
    };
    raf = requestAnimationFrame(frame); return () => cancelAnimationFrame(raf);
  }, [visible, reduced, paused, interactive, placed, minimal, tl.doodles]);

  const poke = (index: number) => {
    if (!interactive) return;
    setTalking(index); setHop(-1); cancelAnimationFrame(hopFrame.current);
    if (!reduced && !paused) hopFrame.current = requestAnimationFrame(() => setHop(index));
    if (talkTimer.current) clearTimeout(talkTimer.current);
    talkTimer.current = setTimeout(() => { setTalking(-1); setHop(-1); }, 5000);
  };
  const pct = (v: number, base: number, span: number) => `${(v - base) / span * 100}%`;
  const renderCrew = (p: typeof placed[number], front = false) => <g key={`${p.i}-${front}`} transform={`translate(${p.x} ${p.y}) scale(${p.scale * p.flip} ${p.scale})`}>
    <g className={`dcf-arrive dcf-arrive-${p.seat}`} style={{ "--d": `${tl.member(p.i)}ms` } as React.CSSProperties}><g className={hop === p.i ? "dcf-hopper is-hop" : "dcf-hopper"}><g className={`dcf-art ${p.art.idle ?? ""}`}>
      {front ? p.art.front?.() : <>{p.art.body()}{p.art.eyes.map((eye, e) => <g key={e} ref={el => { (eyeRefs.current[p.i] ??= [])[e] = el; }}>{eye.r > 0 && <circle cx={eye.x} cy={eye.y} r={eye.r} />}<circle className="k" cx={eye.x} cy={eye.y} r={eye.pupil} /></g>)}</>}
    </g></g></g>
  </g>;
  const active = talking >= 0 ? placed.find(p => p.i === talking) : undefined;
  return <footer ref={rootRef} className={`dcf ${minimal ? "dcf-minimal" : ""} ${className ?? ""}`} data-play={play || reduced ? "1" : "0"} data-paused={paused || reduced || !visible ? "1" : "0"} data-interactive={interactive ? "1" : "0"} style={{ "--dcf-bg": colors.background, "--dcf-ink": colors.ink, "--dcf-accent": colors.accent, "--dcf-serif": serifFamily, minHeight: height } as React.CSSProperties} onPointerMove={e => { pointer.current = { x: e.clientX, y: e.clientY }; }} onPointerLeave={() => { pointer.current = { x: NaN, y: NaN }; }}>
    {!minimal && <div className="dcf-top"><div><span className="dcf-brandname">{brand}</span>{blurb && <p>{blurb}</p>}</div><span className="dcf-invitation">Tap a little character. Get a little clarity.</span>{columns.length > 0 && <nav className="dcf-cols" aria-label="Footer navigation">{columns.map(c => <div key={c.title}><h3>{c.title}</h3><FooterLinks links={c.links} /></div>)}</nav>}</div>}
    <div className="dcf-world" ref={worldRef}>
      <div className="dcf-stage"><h2 className="dcf-sr">{wordmark}</h2>
        <svg ref={svgRef} className="dcf-svg" viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} aria-hidden="true">
          <defs><filter id={`${uid}-ink`} x="-3%" y="-4%" width="106%" height="108%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="11" result="edge" /><feDisplacementMap in="SourceGraphic" in2="edge" scale="1.8" xChannelSelector="R" yChannelSelector="G" /></filter></defs>
          <g aria-hidden="true"><path className="dcf-ground" d={ground.d} pathLength="1" /><path className="dcf-grass" d={ground.tufts} />{ground.pebbles.map((p, i) => <ellipse key={i} className="dcf-pebble" cx={p.x} cy={p.y} rx={p.r * 1.5} ry={p.r} />)}</g>
          {placed.filter(p => p.seat === "behind").map(p => renderCrew(p))}
          {chars.map((c, i) => <g className="dcf-letter" key={i} style={{ "--d": `${tl.letter(i)}ms`, "--r": `${(hash(i * 2.3) - .5) * 7}deg` } as React.CSSProperties}><g className="dcf-glyph"><text x={layout.x[i]} y="0" fontSize={FONT_SIZE} fontWeight="900" style={{ fontFamily }} filter={`url(#${uid}-ink)`}>{c}</text></g></g>)}
          {placed.filter(p => p.seat === "behind").map(p => renderCrew(p, true))}
          {placed.filter(p => p.seat !== "behind").map(p => renderCrew(p))}
        </svg>
        {interactive && placed.map(p => <button key={p.i} type="button" className="dcf-character-hit" aria-label={`Hear from ${p.m.name ?? p.m.kind}`} aria-expanded={talking === p.i} aria-controls={`${uid}-message`} style={{ left: pct(p.x, view.x, view.w), top: pct(p.y + (p.art.box.t + p.art.box.b) / 2 * p.scale, view.y, view.h), width: `${(p.art.box.r - p.art.box.l) * p.scale / view.w * 100}%`, height: `${(p.art.box.b - p.art.box.t) * p.scale / view.h * 100}%` }} onClick={() => poke(p.i)} />)}
        <div className="dcf-bubbles" aria-hidden="true">{active?.m.says && <div key={talking} className={`dcf-bubble${active.x > view.x + view.w * .72 ? " is-left" : ""}${active.x < view.x + view.w * .22 ? " is-right" : ""}`} style={{ left: pct(active.x, view.x, view.w), top: pct(active.y + active.art.box.t * active.scale - 6, view.y, view.h) }}>{active.m.says}</div>}</div>
      </div>
      <div className="dcf-doodles" aria-hidden="true">{doodleList.map((d, i) => <span className="dcf-doodle" key={i} ref={el => { doodleRefs.current[i] = el; }} style={{ width: d.size, height: d.size, "--dcf-accent": DOODLE_COLORS[d.kind], "--doodle-delay": `${tl.doodles + i * 70}ms` } as React.CSSProperties} onPointerDown={() => { if (interactive && floaters.current[i]) floaters.current[i].pop = 1.4; }}><svg viewBox="-16 -16 32 32" className="dcf-art"><Doodle kind={d.kind} /></svg></span>)}</div>
      <div className="dcf-sr" id={`${uid}-message`} role="status" aria-live="polite" aria-atomic="true">{active?.m.says ?? ""}</div>
      {!minimal && <div className="dcf-cta"><p className="dcf-tagline">{words.map((w, i) => <span className="dcf-word" key={i} style={{ "--d": `${tl.word(i)}ms` } as React.CSSProperties}>{w}{" "}</span>)}</p>{actions.length > 0 && <div className="dcf-actions">{actions.map(a => {
        const inner = <>{a.icon && <svg viewBox="-16 -16 32 32" width="18" height="18" className="dcf-art" aria-hidden="true"><Doodle kind={a.icon} /></svg>}<span>{a.label}</span></>;
        return a.href ? <a className={`dcf-btn ${a.variant === "outline" ? "is-outline" : "is-solid"}`} href={a.href} onClick={a.onClick} key={a.label}>{inner}</a> : <button type="button" className={`dcf-btn ${a.variant === "outline" ? "is-outline" : "is-solid"}`} onClick={a.onClick} key={a.label}>{inner}</button>;
      })}</div>}</div>}
    </div>
    <div className="dcf-bar"><p>{copyright}<span className="dcf-privacy">No accounts. No saved personal data.</span></p><div className="dcf-meta-links"><FooterLinks links={[...legal, ...socials]} /></div>{!minimal && <div className="dcf-controls">{!reduced && <button type="button" onClick={() => setPaused(v => !v)} aria-pressed={paused}>{paused ? "Resume motion" : "Pause motion"}</button>}{backToTop && <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}>Back to top ↑</button>}</div>}</div>
  </footer>;
}
