import { useMemo, useState } from 'react';
import { Building2, CalendarClock, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCrmAccounts, useUpdateCrmAccount } from '@/hooks/useCrm';

const stageStyles: Record<string, string> = { Live: 'bg-emerald-500/10 text-emerald-400', Onboarding: 'bg-blue-500/10 text-blue-400', 'Trial onboarding': 'bg-blue-500/10 text-blue-400', 'Trial ready': 'bg-amber-500/10 text-amber-400', 'Qualified pipeline': 'bg-violet-500/10 text-violet-400', Interest: 'bg-muted text-muted-foreground', 'Pre-launch': 'bg-muted text-muted-foreground', 'Implementation planning': 'bg-cyan-500/10 text-cyan-400' };
const stages = ['Interest', 'Qualified pipeline', 'Trial ready', 'Trial onboarding', 'Implementation planning', 'Onboarding', 'Live', 'Paused', 'Lost'];

export default function Crm() {
  const { data, isLoading } = useCrmAccounts();
  const updateAccount = useUpdateCrmAccount();
  const [search, setSearch] = useState('');
  const [territory, setTerritory] = useState('All');
  const accounts = useMemo(() => data?.accounts ?? [], [data?.accounts]);
  const filtered = useMemo(() => accounts.filter((account) => (territory === 'All' || account.territory === territory) && `${account.name} ${account.project} ${account.stage}`.toLowerCase().includes(search.toLowerCase())), [accounts, search, territory]);

  const setStage = async (id: string, stage: string) => {
    try { await updateAccount.mutateAsync({ id, updates: { stage } }); toast.success('Account stage updated'); }
    catch (error: unknown) { toast.error(error instanceof Error ? error.message : 'Apply the operations migration before editing'); }
  };

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  return <div className="space-y-6 max-w-7xl">
    <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Customer relationship management</p><h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Clients, prospects and onboarding</h1><p className="text-sm text-muted-foreground mt-1">A clear handover from first interest through verification, trial, go-live, support and renewal. Volumes are kept separate from individual accounts and revenue.</p></div>
    {data?.usingBlueprint && <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">Showing the known customer blueprint. Apply the included Supabase migrations to enable shared editing, contacts, deals, onboarding and audit history.</div>}
    <div className="grid gap-3 sm:grid-cols-3">{[{ label: 'Portfolio opportunities', value: accounts.length, icon: Building2 }, { label: 'Live groups', value: accounts.filter((a) => a.stage === 'Live').length, icon: Users }, { label: 'Onboarding or trial ready', value: accounts.filter((a) => a.stage.toLowerCase().includes('onboard') || a.stage === 'Trial ready').length, icon: CalendarClock }].map(({ label, value, icon: Icon }) => <div key={label} className="glass-card rounded-xl p-4"><Icon size={17} className="text-primary" /><div className="text-2xl font-bold text-foreground mt-3">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>)}</div>
    <div className="flex gap-3 flex-wrap"><label className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 flex-1 max-w-sm"><Search size={14} className="text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search account, project or stage" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label><div className="flex gap-1 p-1 rounded-lg border border-border/50 bg-muted/20">{['All', 'UK', 'DE', 'INT'].map((item) => <button key={item} onClick={() => setTerritory(item)} className={cn('px-3 py-1 rounded-md text-xs font-medium', territory === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>{item}</button>)}</div></div>
    <div className="glass-card rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border/50">{['Account / group', 'Project', 'Stage', 'Volume', 'Owner', 'Next action'].map((item) => <th key={item} className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">{item}</th>)}</tr></thead><tbody>{filtered.map((account) => <tr key={`${account.name}-${account.project}`} className="border-b border-border/30 last:border-0"><td className="px-4 py-3"><div className="text-sm font-medium text-foreground">{account.name}</div><div className="text-[10px] text-muted-foreground">{account.type} · {account.territory}</div></td><td className="px-4 py-3 text-xs text-foreground">{account.project}</td><td className="px-4 py-3"><select aria-label={`Stage for ${account.name}`} value={account.stage} onChange={(event) => setStage(account.id, event.target.value)} className={cn('text-[10px] rounded-full px-2 py-1 font-medium whitespace-nowrap border-0 outline-none', stageStyles[account.stage] ?? 'bg-muted text-muted-foreground')}>{stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></td><td className="px-4 py-3 text-xs text-muted-foreground">{account.volume}</td><td className="px-4 py-3 text-xs text-muted-foreground">{account.owner}</td><td className="px-4 py-3 text-xs text-foreground min-w-[240px]">{account.nextAction}</td></tr>)}</tbody></table></div></div>
    <p className="text-xs text-muted-foreground">The database layer includes organisations, contacts, deals, onboarding cases and step-level evidence. Pipeline reporting must keep interest, qualified, signed, trial, live, paying and retained states separate.</p>
  </div>;
}
