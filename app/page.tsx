import { LandingNavbar } from '@/components/landing-navbar';
import { LandingHero } from '@/components/landing-hero';

export default function Home() {
  return (
    <main className="min-h-screen">
      <LandingNavbar />
      <LandingHero />
    </main>
  );
}
