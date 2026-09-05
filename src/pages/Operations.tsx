import { useMemo, useState } from 'react';
import { BriefcaseBusiness, Building2, CheckCircle2, Scale, Search, ShieldCheck, Users } from 'lucide-react';
import { DAY_ONE_HEADCOUNT, FIRST_90_DAY_HEADCOUNT, operatingWorkstreams, teamPositions } from '@/data/operatingModel';
import { cn } from '@/lib/utils';

const tabs = ['Team', 'Responsibilities', 'UK setup', 'Germany setup'] as const;
type Tab = typeof tabs[number];

const territoryStyle: Record<string, string> = {
  UK: 'bg-blue-500/10 text-blue-400',
  DE: 'bg-amber-500/10 text-amber-400',
  INT: 'bg-violet-500/10 text-violet-400',
  GROUP: 'bg-emerald-500/10 text-emerald-400',
};

export default function Operations() {
  const [tab, setTab] = useState<Tab>('Team');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const departments = ['All', ...Array.from(new Set(teamPositions.map((item) => item.department)))];

  const people = useMemo(() => teamPositions.filter((position) => {
    const matchesDepartment = department === 'All' || position.department === department;
    const haystack = `${position.role} ${position.department} ${position.responsibilities.join(' ')}`.toLowerCase();
    return matchesDepartment && haystack.includes(search.toLowerCase());
  }), [department, search]);

  const workstreams = operatingWorkstreams.filter((item) => {
    if (tab === 'UK setup') return item.territory === 'UK' || item.territory === 'GROUP';
    if (tab === 'Germany setup') return item.territory === 'DE' || item.territory === 'GROUP';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Operating model</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">People, ownership and country setup</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">A practical staffing and responsibility plan for running the portfolio in the UK, Germany and internationally. Qualified advisers can be external or employed, but every action remains assigned and evidenced.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Day-one capacity', value: DAY_ONE_HEADCOUNT, detail: 'employees and contractors', icon: Users },
          { label: 'First 90 days', value: FIRST_90_DAY_HEADCOUNT, detail: 'planned operating capacity', icon: BriefcaseBusiness },
          { label: 'Compliance control', value: '2 + 1', detail: 'UK, Germany and reviewer', icon: ShieldCheck },
          { label: 'Markets', value: 'UK · DE · INT', detail: 'one group control system', icon: Building2 },
        ].map(({ label, value, detail, icon: Icon }) => (
          <div key={label} className="glass-card rounded-xl p-4">
            <Icon size={18} className="text-primary mb-3" />
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs font-medium text-foreground mt-1">{label}</div>
            <div className="text-xs text-muted-foreground">{detail}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-lg border border-border/50 bg-muted/20 w-fit overflow-x-auto">
        {tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={cn('px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap', tab === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{item}</button>)}
      </div>

      {tab === 'Team' && (
        <>
          <div className="flex gap-3 flex-wrap">
            <label className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 flex-1 max-w-sm">
              <Search size={14} className="text-muted-foreground" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search roles or responsibilities" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </label>
            <select value={department} onChange={(event) => setDepartment(event.target.value)} className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground">
              {departments.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {people.map((position) => (
              <article key={`${position.role}-${position.territory}`} className="glass-card rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">{position.department}</div>
                    <h2 className="text-base font-semibold text-foreground mt-1">{position.role}</h2>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <span className={cn('text-[10px] font-semibold rounded-full px-2 py-1', territoryStyle[position.territory])}>{position.territory}</span>
                    <span className="text-[10px] font-semibold rounded-full px-2 py-1 bg-muted text-muted-foreground">{position.headcount} × {position.phase}</span>
                  </div>
                </div>
                <div className="text-xs text-primary mt-3">{position.engagement}</div>
                <ul className="mt-3 space-y-2">
                  {position.responsibilities.map((item) => <li key={item} className="flex gap-2 text-xs text-muted-foreground"><CheckCircle2 size={13} className="text-primary mt-0.5 shrink-0" />{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </>
      )}

      {tab !== 'Team' && (
        <div className="space-y-3">
          {workstreams.map((item) => (
            <article key={`${item.title}-${item.territory}`} className="glass-card rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Scale size={18} className="text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
                    <span className={cn('text-[10px] font-semibold rounded-full px-2 py-1', territoryStyle[item.territory])}>{item.territory}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{item.output}</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mt-4 text-xs">
                    <div><span className="text-muted-foreground">Owner</span><div className="text-foreground mt-0.5">{item.ownerRole}</div></div>
                    <div><span className="text-muted-foreground">Reviewer</span><div className="text-foreground mt-0.5">{item.reviewerRole ?? 'Operational owner'}</div></div>
                    <div><span className="text-muted-foreground">Outside party</span><div className="text-foreground mt-0.5">{item.thirdParty ?? 'None required'}</div></div>
                    <div><span className="text-muted-foreground">Cadence</span><div className="text-foreground mt-0.5">{item.frequency}</div></div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

