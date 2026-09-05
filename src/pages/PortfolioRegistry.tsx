import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { portfolioProjects, PROJECT_COUNT } from '@/data/operatingModel';
import { cn } from '@/lib/utils';

const territoryStyle: Record<string, string> = { UK: 'bg-blue-500/10 text-blue-400', DE: 'bg-amber-500/10 text-amber-400', INT: 'bg-violet-500/10 text-violet-400' };

export default function PortfolioRegistry() {
  const [search, setSearch] = useState('');
  const [territory, setTerritory] = useState('All');
  const filtered = useMemo(() => portfolioProjects.filter((project) =>
    (territory === 'All' || project.territory === territory) && `${project.name} ${project.code}`.toLowerCase().includes(search.toLowerCase())
  ), [search, territory]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Canonical register</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Portfolio coverage</h1>
        <p className="text-sm text-muted-foreground mt-1">{PROJECT_COUNT} named products and operating projects. Every project can receive launch, compliance, marketing, sales, infrastructure and third-party work.</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <label className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search portfolio" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
        <div className="flex gap-1 p-1 rounded-lg border border-border/50 bg-muted/20">
          {['All', 'UK', 'DE', 'INT'].map((item) => <button key={item} onClick={() => setTerritory(item)} className={cn('px-3 py-1 rounded-md text-xs font-medium', territory === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>{item}</button>)}
        </div>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border/50"><th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-5 py-3">Brand / project</th><th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-5 py-3">Territory</th><th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-5 py-3">Source</th><th className="text-left text-xs uppercase tracking-wider text-muted-foreground px-5 py-3">Required control pack</th></tr></thead>
            <tbody>{filtered.map((project) => <tr key={project.code} className="border-b border-border/30 last:border-0"><td className="px-5 py-3"><div className="text-sm font-medium text-foreground">{project.name}</div><div className="text-xs font-mono text-muted-foreground">{project.code}</div></td><td className="px-5 py-3"><span className={cn('text-[10px] font-semibold rounded-full px-2 py-1', territoryStyle[project.territory])}>{project.territory}</span></td><td className="px-5 py-3 text-xs text-muted-foreground">{project.source}</td><td className="px-5 py-3 text-xs text-muted-foreground">Product · Legal · Compliance · Build · Native · Domains/email · Payments · SEO · Sales · Support</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

