import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActionCentre } from '@/hooks/useOperationsWorkspace';
import { getActionUrgency } from '@/lib/operationsWorkspace';
import { cn } from '@/lib/utils';

export default function ActionCentre() {
  const { data: items = [], isLoading, error } = useActionCentre();
  const [source, setSource] = useState('All');
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => items.filter((item) => (source === 'All' || item.source === source) && `${item.title} ${item.context} ${item.status}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => getActionUrgency(a.date).order - getActionUrgency(b.date).order), [items, search, source]);
  const overdue = items.filter((item) => getActionUrgency(item.date).order === 0).length;
  const nextSeven = items.filter((item) => getActionUrgency(item.date).order === 1).length;
  const unscheduled = items.filter((item) => !item.date).length;
  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="text-sm text-destructive">Action centre could not load: {error.message}</div>;
  return <div className="space-y-6 max-w-7xl">
    <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Management action centre</p><h1 className="text-2xl font-bold tracking-tight mt-1">What needs attention</h1><p className="text-sm text-muted-foreground mt-1">One queue for staff work, client follow-ups, compliance deadlines and third-party dependencies.</p></div>
    <div className="grid gap-3 sm:grid-cols-4">{[{ label: 'Open actions', value: items.length, icon: CalendarClock }, { label: 'Overdue', value: overdue, icon: AlertTriangle }, { label: 'Due in 7 days', value: nextSeven, icon: CalendarClock }, { label: 'Need a date', value: unscheduled, icon: CheckCircle2 }].map(({ label, value, icon: Icon }) => <div key={label} className="glass-card rounded-xl p-4"><Icon size={17} className={label === 'Overdue' && value ? 'text-destructive' : 'text-primary'} /><div className="text-2xl font-bold mt-3">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>)}</div>
    <div className="flex gap-3 flex-wrap"><label className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 flex-1 max-w-sm"><Search size={14} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search actions or dependencies" className="w-full bg-transparent text-sm outline-none" /></label><div className="flex gap-1 p-1 rounded-lg border border-border/50 bg-muted/20">{['All', 'Work', 'CRM', 'Compliance', 'Third party'].map((item) => <button key={item} onClick={() => setSource(item)} className={cn('px-3 py-1 rounded text-xs', source === item ? 'bg-background shadow-sm' : 'text-muted-foreground')}>{item}</button>)}</div></div>
    <div className="glass-card rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border/50">{['Action', 'Source', 'Status', 'When', 'Priority', ''].map((heading, index) => <th key={`${heading}-${index}`} className="text-left text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">{heading}</th>)}</tr></thead><tbody>{filtered.map((item) => { const due = getActionUrgency(item.date); return <tr key={`${item.source}-${item.id}`} className="border-b border-border/30 last:border-0"><td className="px-4 py-3"><div className="text-sm font-medium">{item.title}</div><div className="text-xs text-muted-foreground max-w-xl truncate">{item.context}</div></td><td className="px-4 py-3 text-xs">{item.source}</td><td className="px-4 py-3 text-xs capitalize">{item.status.replace('_', ' ')}</td><td className="px-4 py-3"><span className={cn('text-[10px] rounded-full px-2 py-1 font-medium whitespace-nowrap', due.style)}>{due.label}</span></td><td className="px-4 py-3 text-xs capitalize">{item.priority}</td><td className="px-4 py-3"><Link to={item.link} className="text-xs text-primary hover:underline">Open</Link></td></tr>})}</tbody></table></div></div>
  </div>;
}
