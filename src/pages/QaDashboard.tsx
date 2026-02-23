import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProjects } from '@/hooks/useProjectData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Bug, Plus, Search, Filter, CheckCircle2, XCircle, AlertTriangle,
  Clock, Eye, Lightbulb, ChevronDown
} from 'lucide-react';

const CATEGORIES = ['bug', 'omission', 'recommendation', 'ux_issue', 'performance', 'security', 'accessibility'] as const;
const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
const STATUSES = ['open', 'in_progress', 'resolved', 'wont_fix', 'deferred'] as const;
const ENVIRONMENTS = ['staging', 'production', 'development'] as const;

const SEVERITY_COLORS: Record<string, string> = {
  low: 'text-muted-foreground bg-muted/30',
  medium: 'text-info bg-info/10',
  high: 'text-warning bg-warning/10',
  critical: 'text-destructive bg-destructive/10',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'text-warning bg-warning/10',
  in_progress: 'text-info bg-info/10',
  resolved: 'text-success bg-success/10',
  wont_fix: 'text-muted-foreground bg-muted/30',
  deferred: 'text-muted-foreground bg-muted/30',
};

const CATEGORY_ICONS: Record<string, typeof Bug> = {
  bug: Bug,
  omission: Eye,
  recommendation: Lightbulb,
  ux_issue: Eye,
  performance: Clock,
  security: AlertTriangle,
  accessibility: Eye,
};

function useQaIssues() {
  return useQuery({
    queryKey: ['qa-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_issues')
        .select('*, projects:project_id(id, name, code)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export default function QaDashboard() {
  const { data: issues, isLoading } = useQaIssues();
  const { data: projects } = useProjects();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', category: 'bug', severity: 'medium', project_id: '',
    reported_by: '', assigned_to: '', environment: 'staging', steps_to_reproduce: '',
    expected_result: '', actual_result: '', recommendation: '',
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!form.title || !form.project_id) throw new Error('Title and project required');
      const { error } = await supabase.from('qa_issues').insert({
        title: form.title,
        description: form.description || null,
        category: form.category,
        severity: form.severity,
        project_id: form.project_id,
        reported_by: form.reported_by || null,
        assigned_to: form.assigned_to || null,
        environment: form.environment,
        steps_to_reproduce: form.steps_to_reproduce || null,
        expected_result: form.expected_result || null,
        actual_result: form.actual_result || null,
        recommendation: form.recommendation || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Issue created');
      queryClient.invalidateQueries({ queryKey: ['qa-issues'] });
      setCreateOpen(false);
      setForm({ title: '', description: '', category: 'bug', severity: 'medium', project_id: '', reported_by: '', assigned_to: '', environment: 'staging', steps_to_reproduce: '', expected_result: '', actual_result: '', recommendation: '' });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('qa_issues').update({
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['qa-issues'] });
    },
  });

  const allIssues = issues || [];

  const filtered = useMemo(() => {
    return allIssues.filter(issue => {
      const matchSearch = !search ||
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        (issue.description || '').toLowerCase().includes(search.toLowerCase()) ||
        ((issue as any).projects?.code || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || issue.category === categoryFilter;
      const matchSeverity = severityFilter === 'all' || issue.severity === severityFilter;
      return matchSearch && matchStatus && matchCategory && matchSeverity;
    });
  }, [allIssues, search, statusFilter, categoryFilter, severityFilter]);

  // KPIs
  const openCount = allIssues.filter(i => i.status === 'open').length;
  const criticalOpen = allIssues.filter(i => i.status === 'open' && i.severity === 'critical').length;
  const resolvedCount = allIssues.filter(i => i.status === 'resolved').length;
  const bugCount = allIssues.filter(i => i.category === 'bug' && i.status !== 'resolved').length;

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">QA & Testing Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Track bugs, omissions, and recommendations</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs"><Plus size={14} /> Report Issue</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Report QA Issue</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Brief issue description" />
                </div>
                <div className="space-y-1.5">
                  <Label>Project *</Label>
                  <Select value={form.project_id} onValueChange={v => setForm(f => ({ ...f, project_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>{(projects || []).map(p => <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Severity</Label>
                  <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Environment</Label>
                  <Select value={form.environment} onValueChange={v => setForm(f => ({ ...f, environment: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ENVIRONMENTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description…" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Steps to Reproduce</Label>
                <Textarea value={form.steps_to_reproduce} onChange={e => setForm(f => ({ ...f, steps_to_reproduce: e.target.value }))} placeholder="1. Go to…&#10;2. Click on…&#10;3. Observe…" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Expected Result</Label>
                  <Textarea value={form.expected_result} onChange={e => setForm(f => ({ ...f, expected_result: e.target.value }))} placeholder="What should happen" rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label>Actual Result</Label>
                  <Textarea value={form.actual_result} onChange={e => setForm(f => ({ ...f, actual_result: e.target.value }))} placeholder="What actually happens" rows={2} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Recommendation</Label>
                <Textarea value={form.recommendation} onChange={e => setForm(f => ({ ...f, recommendation: e.target.value }))} placeholder="Suggested fix or improvement" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Reported By</Label>
                  <Input value={form.reported_by} onChange={e => setForm(f => ({ ...f, reported_by: e.target.value }))} placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Assigned To</Label>
                  <Input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} placeholder="Developer name" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Submitting…' : 'Submit Issue'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <Bug size={18} className="text-warning mb-2" />
          <div className="text-2xl font-bold text-warning">{openCount}</div>
          <div className="text-xs text-muted-foreground">Open Issues</div>
        </div>
        <div className="kpi-card">
          <AlertTriangle size={18} className="text-destructive mb-2" />
          <div className="text-2xl font-bold text-destructive">{criticalOpen}</div>
          <div className="text-xs text-muted-foreground">Critical Open</div>
        </div>
        <div className="kpi-card">
          <CheckCircle2 size={18} className="text-success mb-2" />
          <div className="text-2xl font-bold text-success">{resolvedCount}</div>
          <div className="text-xs text-muted-foreground">Resolved</div>
        </div>
        <div className="kpi-card">
          <Bug size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">{bugCount}</div>
          <div className="text-xs text-muted-foreground">Active Bugs</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 flex-1 max-w-sm border border-border/50">
          <Search size={14} className="text-muted-foreground" />
          <input type="text" placeholder="Search issues…" value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            {SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Issues List */}
      <div className="space-y-2">
        {filtered.map((issue, i) => {
          const CatIcon = CATEGORY_ICONS[issue.category] || Bug;
          const isExpanded = detailOpen === issue.id;
          return (
            <motion.div key={issue.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="glass-card rounded-xl overflow-hidden">
              <button onClick={() => setDetailOpen(isExpanded ? null : issue.id)} className="w-full flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors text-left">
                <CatIcon size={16} className={cn(SEVERITY_COLORS[issue.severity]?.split(' ')[0])} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{issue.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-muted-foreground">{(issue as any).projects?.code}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground capitalize">{issue.category.replace(/_/g, ' ')}</span>
                    {issue.reported_by && <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">by {issue.reported_by}</span>
                    </>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium capitalize", SEVERITY_COLORS[issue.severity])}>{issue.severity}</span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium capitalize", STATUS_COLORS[issue.status])}>{issue.status.replace(/_/g, ' ')}</span>
                  <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border/30 space-y-3 pt-3">
                  {issue.description && <div><div className="text-xs font-semibold text-muted-foreground mb-1">Description</div><p className="text-sm text-foreground">{issue.description}</p></div>}
                  {issue.steps_to_reproduce && <div><div className="text-xs font-semibold text-muted-foreground mb-1">Steps to Reproduce</div><p className="text-sm text-foreground whitespace-pre-wrap">{issue.steps_to_reproduce}</p></div>}
                  <div className="grid grid-cols-2 gap-4">
                    {issue.expected_result && <div><div className="text-xs font-semibold text-muted-foreground mb-1">Expected</div><p className="text-sm text-foreground">{issue.expected_result}</p></div>}
                    {issue.actual_result && <div><div className="text-xs font-semibold text-muted-foreground mb-1">Actual</div><p className="text-sm text-foreground">{issue.actual_result}</p></div>}
                  </div>
                  {issue.recommendation && <div><div className="text-xs font-semibold text-muted-foreground mb-1">Recommendation</div><p className="text-sm text-foreground">{issue.recommendation}</p></div>}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-muted-foreground">Change status:</span>
                    {STATUSES.filter(s => s !== issue.status).map(s => (
                      <Button key={s} size="sm" variant="outline" className="text-xs h-7 capitalize" onClick={() => updateStatus.mutate({ id: issue.id, status: s })}>
                        {s.replace(/_/g, ' ')}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span>Environment: {issue.environment}</span>
                    {issue.assigned_to && <span>Assigned: {issue.assigned_to}</span>}
                    <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
                    {issue.resolved_at && <span>Resolved: {new Date(issue.resolved_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <Bug size={32} className="text-muted-foreground mx-auto mb-3" />
          <div className="text-sm text-muted-foreground">
            {allIssues.length === 0 ? 'No QA issues reported yet. Click "Report Issue" to get started.' : 'No issues match your filters.'}
          </div>
        </div>
      )}
    </div>
  );
}
