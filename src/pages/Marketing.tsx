import { useState } from 'react';
import { BarChart3, CheckCircle2, Megaphone, Search, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = {
  UK: {
    objective: 'Convert existing warm demand, prove repeatable onboarding, then grow one vertical and one locality at a time.',
    b2b: ['Segment businesses by brand, locality, size, current process and decision maker', 'Use calls, email, LinkedIn, visits, trade groups, councils, associations and supplier referrals', 'Offer a controlled trial with written success measures, owner and conversion date', 'Turn live sites into case studies, reviews and introductions', 'Track lead → meeting → trial → live → retained separately'],
    users: ['Build local SEO pages around the real problem, service and location', 'Use useful guides, short video, community groups and partner audiences', 'Create referral loops only after service quality is proven', 'Use paid search/social in small measured tests with consent-safe retargeting', 'Send consumer demand to free user journeys where the business side pays'],
  },
  DE: {
    objective: 'Complete German legal, localisation, administration and support readiness before scaling acquisition.',
    b2b: ['Use native German sector pages, local terminology and proof', 'Build verified lists through chambers, directories, associations, events and local agents', 'Combine telephone outreach, letters, email, LinkedIn and face-to-face visits within local rules', 'Start city-by-city pilots with German onboarding and support', 'Use a German-speaking owner for every opportunity and partner'],
    users: ['Create German search content reviewed by a native specialist', 'Build trust through transparent imprint, privacy, terms, local contact and reviews', 'Work with local communities, clubs, educators and relevant associations', 'Use regional creators and partners only with clear disclosure', 'Measure activation and successful outcomes, not registrations alone'],
  },
  INT: {
    objective: 'Prioritise a small number of countries per brand, prove supply and operational coverage, then expand.',
    b2b: ['Choose countries by regulation, payment coverage, language, addressable supply and support capacity', 'Recruit anchor partners, distributors and agents with written territory rules', 'Create country playbooks for pricing, contracts, tax, support and escalation', 'Use partner webinars, industry media, direct outreach and targeted events', 'Do not advertise a country until fulfilment and support are operational'],
    users: ['Use country-specific SEO, social and creator partnerships', 'Route users to local language, currency, availability and support', 'Build waitlists where supply is not yet ready', 'Use affiliates and referrals with source and payout controls', 'Scale only after conversion, service quality and retention meet thresholds'],
  },
};

const cadence = [
  ['Daily', 'New leads, follow-ups, calls, visits, campaign exceptions and onboarding blockers'],
  ['Weekly', 'Pipeline forecast, channel results, content shipped, sales objections and next experiments'],
  ['Monthly', 'Spend, acquisition cost, activation, retention, referrals, SEO growth and country readiness'],
  ['Quarterly', 'Brand/market budget allocation, channel stop/start decisions and headcount capacity'],
];

export default function Marketing() {
  const [territory, setTerritory] = useState<keyof typeof plans>('UK');
  const plan = plans[territory];
  return <div className="space-y-6 max-w-7xl">
    <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Gated growth workspace</p><h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Marketing and sales plan of action</h1><p className="text-sm text-muted-foreground mt-1 max-w-3xl">Separate plans for business acquisition and user demand, matched to who pays for each brand. Activity is assigned through the Work Board and results are reviewed by market.</p></div>
    <div className="flex gap-1 p-1 rounded-lg border border-border/50 bg-muted/20 w-fit">{(['UK', 'DE', 'INT'] as const).map((item) => <button key={item} onClick={() => setTerritory(item)} className={cn('px-4 py-1.5 rounded-md text-xs font-medium', territory === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>{item === 'DE' ? 'Germany' : item === 'INT' ? 'International' : 'UK'}</button>)}</div>
    <div className="glass-card rounded-xl p-5"><div className="flex items-start gap-3"><Target size={19} className="text-primary mt-0.5" /><div><div className="text-xs text-muted-foreground">Market objective</div><p className="text-sm text-foreground mt-1">{plan.objective}</p></div></div></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="glass-card rounded-xl p-5"><div className="flex items-center gap-2"><Users size={18} className="text-primary" /><h2 className="font-semibold text-foreground">Business acquisition</h2></div><p className="text-xs text-muted-foreground mt-1">For B2B-funded brands and the business side of marketplaces.</p><ul className="space-y-2 mt-4">{plan.b2b.map((item) => <li key={item} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />{item}</li>)}</ul></section>
      <section className="glass-card rounded-xl p-5"><div className="flex items-center gap-2"><Megaphone size={18} className="text-primary" /><h2 className="font-semibold text-foreground">User and demand growth</h2></div><p className="text-xs text-muted-foreground mt-1">For user-funded brands and free demand-side users where businesses pay.</p><ul className="space-y-2 mt-4">{plan.users.map((item) => <li key={item} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />{item}</li>)}</ul></section>
    </div>
    <section><div className="flex items-center gap-2 mb-3"><BarChart3 size={17} className="text-primary" /><h2 className="text-sm font-semibold text-foreground">Management cadence</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cadence.map(([period, detail]) => <div key={period} className="glass-card rounded-xl p-4"><div className="text-sm font-semibold text-foreground">{period}</div><p className="text-xs text-muted-foreground mt-2">{detail}</p></div>)}</div></section>
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5"><div className="flex gap-3"><Search size={18} className="text-primary shrink-0" /><div><h2 className="text-sm font-semibold text-foreground">Per-brand action pack</h2><p className="text-xs text-muted-foreground mt-1">Before spend is approved, each brand needs a named audience, paying side, territory, offer, proof, channel mix, 90-day calendar, budget, owner, tracking, sales handover and stop/scale thresholds. These become assigned work items rather than a static strategy document.</p></div></div></div>
  </div>;
}
