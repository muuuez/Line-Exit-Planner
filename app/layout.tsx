import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Route } from 'lucide-react';
import './globals.css';
export const metadata: Metadata = { title: 'Line Exit Planner — Make your next move clear', description: 'Compare the cost of waiting, terminating, or abandoning a postpaid mobile line. A private, fictional-data-friendly calculator for Malaysia.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><Link href="/" className="brand"><span className="brand-icon"><Route size={21} /></span>Line Exit Planner</Link><span className="header-note">A clearer way forward</span><Link className="header-link" href="/planner">Open planner <ArrowUpRight size={16} /></Link></header>{children}<footer><span>Line Exit Planner <span className="footer-dot">·</span> Made for clearer decisions.</span><span>No accounts. No saved personal data.</span></footer></body></html>;
}
