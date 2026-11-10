"use client";

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const DoodleCrewFooter = dynamic(() => import('@/components/ui/doodle-crew-footer'));

export function AppFooter() {
  const pathname = usePathname();
  if (pathname === '/') return <DoodleCrewFooter minimal height="auto" doodleCount={10} actions={[]} backToTop={false} />;
  return <footer><span>Offramp <span className="footer-dot">·</span> Made for clearer decisions.</span><span>No accounts. No saved personal data.</span></footer>;
}
