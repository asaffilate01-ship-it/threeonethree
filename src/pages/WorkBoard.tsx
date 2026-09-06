import { useMemo, useState } from 'react';
import { AlertTriangle, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { OperatingTask, useCreateOperatingTask, useOperatingTasks, useUpdateOperatingTask } from '@/hooks/useOperations';

const columns: Array<{ status: OperatingTask['status']; label: string }> = [
  { status: 'backlog', label: 'Backlog' }, { status: 'in_progress', label: 'In progress' }, { status: 'blocked', label: 'Blocked' }, { status: 'review', label: 'Review' }, { status: 'done', label: 'Done' },
];
const priorityStyle: Record<string, string> = { low: 'text-muted-foreground', medium: 'text-blue-400', high: 'text-amber-400', critical: 'text-red-400' };

function TaskCard({ task, onMove }: { task: OperatingTask; onMove: (task: OperatingTask, status: OperatingTask['status']) => void }) {
  return <article className="glass-card rounded-2xl p-4 lg:rounded-lg lg:p-3.5"><div className="flex gap-2">{task.status === 'blocked' && <AlertTriangle size={14} className="mt-0.5 text-red-400" />}<div><h3 className="text-sm font-medium text-foreground">{task.title}</h3>{task.description && <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{task.description}</p>}</div></div><div className="mt-3 flex flex-wrap gap-2 text-[10px]"><span className="rounded bg-muted px-1.5 py-0.5">{task.territory}</span><span className={cn('font-semibold', priorityStyle[task.priority])}>{task.priority}</span><span className="text-muted-foreground">{task.workstream}</span></div>{task.owner && <div className="mt-2 text-xs text-muted-foreground">Owner: {task.owner}</div>}{task.third_party && <div className="mt-1 text-xs text-muted-foreground">Waiting on: {task.third_party}</div>}<select aria-label={`Move ${task.title}`} value={task.status} onChange={(event) => onMove(task, event.target.value as OperatingTask['status'])} className="mt-3 min-h-11 w-full rounded-xl border border-border/50 bg-background px-3 text-sm text-foreground lg:min-h-0 lg:rounded lg:px-2 lg:py-1 lg:text-xs"><option value="backlog">Backlog</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="review">Review</option><option value="done">Done</option></select></article>;
}

export default function WorkBoard() {
  const { data, isLoading } = useOperatingTasks();
  const updateTask = useUpdateOperatingTask();
  const createTask = useCreateOperatingTask();
  const [search, setSearch] = useState('');
  const [territory, setTerritory] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [mobileStatus, setMobileStatus] = useState<OperatingTask['status']>('in_progress');

  const tasks = useMemo(() => (data?.tasks ?? []).filter((task) => {
    const matchTerritory = territory === 'All' || task.territory === territory || task.territory === 'GROUP';
    return matchTerritory && `${task.title} ${task.description} ${task.owner} ${task.third_party} ${task.project_code}`.toLowerCase().includes(search.toLowerCase());
  }), [data, search, territory]);

  const move = async (task: OperatingTask, status: OperatingTask['status']) => {
    try { await updateTask.mutateAsync({ id: task.id, updates: { status } }); toast.success('Work item updated'); }
    catch (error: unknown) { toast.error(error instanceof Error ? error.message : 'Apply the operations migration before editing'); }
  };

  const add = async () => {
    if (!title.trim()) return;
    try {
      await createTask.mutateAsync({ title: title.trim(), description: null, workstream: 'General', territory: territory === 'All' ? 'GROUP' : territory, owner: null, reviewer: null, third_party: null, project_code: null, status: 'backlog', priority: 'medium', due_date: null, dependency: null, evidence_url: null });
      setTitle(''); setShowAdd(false); toast.success('Work item created');
    } catch (error: unknown) { toast.error(error instanceof Error ? error.message : 'Apply the operations migration before editing'); }
  };

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  return <div className="space-y-6">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Shared execution board</p><h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">All operational work</h1><p className="text-sm text-muted-foreground mt-1">Internal staff, agents, qualified advisers and third-party deliverables in one accountable board.</p></div><Button size="sm" onClick={() => setShowAdd(!showAdd)}><Plus size={14} className="mr-1" />Add item</Button></div>
    {data?.usingBlueprint && <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">Showing the built-in operating blueprint. Apply the included Supabase migration to enable shared editing and audit history.</div>}
    {showAdd && <div className="glass-card rounded-xl p-4 flex gap-2"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New task or third-party deliverable" onKeyDown={(event) => { if (event.key === 'Enter') add(); }} /><Button onClick={add} disabled={createTask.isPending}>Create</Button></div>}
    <div className="space-y-3 md:flex md:flex-wrap md:gap-3 md:space-y-0"><label className="flex min-h-11 items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 md:flex-1 md:max-w-sm"><Search size={14} className="text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search work, owner, project or provider" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label><div className="native-scroll flex gap-1 overflow-x-auto rounded-xl border border-border/50 bg-muted/20 p-1">{['All', 'UK', 'DE', 'INT', 'GROUP'].map((item) => <button key={item} onClick={() => setTerritory(item)} className={cn('min-h-9 rounded-lg px-3 text-xs font-medium', territory === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>{item}</button>)}</div></div>
    <div className="lg:hidden"><div className="native-scroll mb-3 flex gap-2 overflow-x-auto pb-1">{columns.map((column) => { const count = tasks.filter((task) => task.status === column.status).length; return <button key={column.status} onClick={() => setMobileStatus(column.status)} className={cn('flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-medium', mobileStatus === column.status ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border/50 bg-muted/20 text-muted-foreground')}>{column.label}<span className="rounded-full bg-background/60 px-1.5 py-0.5 text-[10px]">{count}</span></button>; })}</div><div className="space-y-3">{tasks.filter((task) => task.status === mobileStatus).map((task) => <TaskCard key={task.id} task={task} onMove={move} />)}{!tasks.some((task) => task.status === mobileStatus) && <div className="rounded-2xl border border-dashed border-border/50 py-12 text-center text-sm text-muted-foreground">No work in this stage</div>}</div></div>
    <div className="hidden gap-4 overflow-x-auto pb-4 lg:flex">{columns.map((column) => { const columnTasks = tasks.filter((task) => task.status === column.status); return <section key={column.status} className="min-w-[290px] flex-1"><div className="flex justify-between px-1 mb-3"><h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{column.label}</h2><span className="text-xs bg-muted text-muted-foreground rounded px-1.5">{columnTasks.length}</span></div><div className="space-y-2">{columnTasks.map((task) => <TaskCard key={task.id} task={task} onMove={move} />)}{columnTasks.length === 0 && <div className="rounded-lg border border-dashed border-border/50 py-8 text-center text-xs text-muted-foreground">Empty</div>}</div></section>; })}</div>
  </div>;
}
