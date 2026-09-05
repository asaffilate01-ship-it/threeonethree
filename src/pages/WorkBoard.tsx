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

export default function WorkBoard() {
  const { data, isLoading } = useOperatingTasks();
  const updateTask = useUpdateOperatingTask();
  const createTask = useCreateOperatingTask();
  const [search, setSearch] = useState('');
  const [territory, setTerritory] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');

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
    <div className="flex gap-3 flex-wrap"><label className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 flex-1 max-w-sm"><Search size={14} className="text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search work, owner, project or provider" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label><div className="flex gap-1 p-1 rounded-lg border border-border/50 bg-muted/20">{['All', 'UK', 'DE', 'INT', 'GROUP'].map((item) => <button key={item} onClick={() => setTerritory(item)} className={cn('px-2.5 py-1 rounded-md text-xs font-medium', territory === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>{item}</button>)}</div></div>
    <div className="flex gap-4 overflow-x-auto pb-4">{columns.map((column) => { const columnTasks = tasks.filter((task) => task.status === column.status); return <section key={column.status} className="min-w-[290px] flex-1"><div className="flex justify-between px-1 mb-3"><h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{column.label}</h2><span className="text-xs bg-muted text-muted-foreground rounded px-1.5">{columnTasks.length}</span></div><div className="space-y-2">{columnTasks.map((task) => <article key={task.id} className="glass-card rounded-lg p-3.5"><div className="flex gap-2">{task.status === 'blocked' && <AlertTriangle size={14} className="text-red-400 mt-0.5" />}<div><h3 className="text-sm font-medium text-foreground">{task.title}</h3>{task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{task.description}</p>}</div></div><div className="flex gap-2 flex-wrap mt-3 text-[10px]"><span className="bg-muted rounded px-1.5 py-0.5">{task.territory}</span><span className={cn('font-semibold', priorityStyle[task.priority])}>{task.priority}</span><span className="text-muted-foreground">{task.workstream}</span></div>{task.owner && <div className="text-xs text-muted-foreground mt-2">Owner: {task.owner}</div>}{task.third_party && <div className="text-xs text-muted-foreground mt-1">Waiting on: {task.third_party}</div>}<select aria-label={`Move ${task.title}`} value={task.status} onChange={(event) => move(task, event.target.value as OperatingTask['status'])} className="mt-3 w-full rounded border border-border/50 bg-background px-2 py-1 text-xs text-foreground"><option value="backlog">Backlog</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="review">Review</option><option value="done">Done</option></select></article>)}{columnTasks.length === 0 && <div className="rounded-lg border border-dashed border-border/50 py-8 text-center text-xs text-muted-foreground">Empty</div>}</div></section>; })}</div>
  </div>;
}
