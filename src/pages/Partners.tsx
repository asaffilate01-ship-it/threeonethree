import { useMemo, useState } from 'react';
import { Building2, CheckSquare2, Search } from 'lucide-react';
import { thirdPartyActions } from '@/data/operatingModel';
import { cn } from '@/lib/utils';

export default function Partners() {
  const [search, setSearch] = useState('');
  const [territory, setTerritory] = useState('All');
  const items = useMemo(() => thirdPartyActions.filter((item) =>
    (territory === 'All' || item.territory === territory || item.territory === 'GROUP') &&
    `${item.organisation} ${item.category} ${item.requiredFromThirdParty}`.toLowerCase().includes(search.toLowerCase())
  ), [search, territory]);

  return <div className="space-y-6 max-w-7xl">
    <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">External dependency register</p><h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Third parties and qualified advisers</h1><p className="text-sm text-muted-foreground mt-1 max-w-3xl">What each outside organisation must deliver, what evidence the team must retain, and who escalates it. A qualified external role can later be replaced by a qualified employee without losing the action history.</p></div>
    <div className="flex gap-3 flex-wrap">
      <label className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 flex-1 max-w-sm"><Search size={14} className="text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search provider or requirement" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label>
      <div className="flex gap-1 p-1 rounded-lg border border-border/50 bg-muted/20">{['All', 'UK', 'DE', 'GROUP'].map((item) => <button key={item} onClick={() => setTerritory(item)} className={cn('px-3 py-1 rounded-md text-xs font-medium', territory === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>{item}</button>)}</div>
    </div>
    <div className="grid gap-3 lg:grid-cols-2">{items.map((item) => <article key={item.organisation} className="glass-card rounded-xl p-5"><div className="flex items-start gap-3"><Building2 size={18} className="text-primary mt-0.5" /><div><div className="flex items-center gap-2 flex-wrap"><h2 className="font-semibold text-foreground">{item.organisation}</h2><span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-1">{item.category} · {item.territory}</span></div><div className="text-xs text-muted-foreground mt-2">Internal owner</div><div className="text-sm text-foreground">{item.internalOwner}</div></div></div><div className="mt-4 space-y-3 text-xs"><div><div className="font-medium text-foreground mb-1">Third party must deliver</div><p className="text-muted-foreground">{item.requiredFromThirdParty}</p></div><div><div className="font-medium text-foreground mb-1 flex items-center gap-1"><CheckSquare2 size={12} className="text-primary" />Evidence to retain</div><p className="text-muted-foreground">{item.evidence}</p></div><div><div className="font-medium text-foreground mb-1">Escalation / in-house option</div><p className="text-muted-foreground">{item.escalation}</p></div></div></article>)}</div>
  </div>;
}

