import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Archive, BadgeCheck, CalendarClock, FileCheck2, FolderOpen, MessageSquarePlus, Plus, Search, ShieldAlert } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCaseDesk, useOperationsPermission, type ApprovalRequest, type OperationalCase } from '@/hooks/useOperationsWorkspace';
import { useProjects } from '@/hooks/useProjectData';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type DeskView = 'cases' | 'approvals' | 'evidence';

const caseStatuses = ['open', 'triage', 'in_progress', 'waiting_external', 'review', 'resolved', 'closed'];
const evidenceStatuses = ['draft', 'submitted', 'in_review', 'approved', 'rejected', 'expired'];

const emptyCase = { case_type: 'support', title: '', summary: '', status: 'open', priority: 'medium', territory: 'GROUP', project_id: '', due_date: '' };
const emptyApproval = { title: '', approval_type: 'Operational sign-off', description: '', project_id: '', due_date: '' };
const emptyEvidence = { title: '', category: 'Compliance', description: '', project_id: '', file_url: '', version: '1.0', status: 'draft', review_due: '', expires_on: '' };

function human(value: string) {
  return value.replaceAll('_', ' ');
}

export default function CaseDesk() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get('view');
  const view: DeskView = requestedView === 'approvals' || requestedView === 'evidence' ? requestedView : 'cases';
  const { data = { cases: [], approvals: [], evidence: [] }, isLoading, error } = useCaseDesk();
  const { data: permission } = useOperationsPermission();
  const { data: projects = [] } = useProjects();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [caseForm, setCaseForm] = useState(emptyCase);
  const [approvalForm, setApprovalForm] = useState(emptyApproval);
  const [evidenceForm, setEvidenceForm] = useState(emptyEvidence);
  const [activeCase, setActiveCase] = useState<OperationalCase | null>(null);
  const [caseUpdate, setCaseUpdate] = useState('');
  const [activeApproval, setActiveApproval] = useState<ApprovalRequest | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'changes_requested'>('approved');
  const [decisionNotes, setDecisionNotes] = useState('');

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['case-desk'] });
    queryClient.invalidateQueries({ queryKey: ['operations-action-centre'] });
  };

  const projectName = (projectId: string | null) => projects.find((project) => project.id === projectId)?.name ?? 'Group';
  const cases = useMemo(() => data.cases.filter((item) => [item.case_reference, item.title, item.summary, item.case_type, item.status, item.territory].join(' ').toLowerCase().includes(search.toLowerCase())), [data.cases, search]);
  const approvals = useMemo(() => data.approvals.filter((item) => [item.title, item.approval_type, item.description, item.status].join(' ').toLowerCase().includes(search.toLowerCase())), [data.approvals, search]);
  const evidence = useMemo(() => data.evidence.filter((item) => [item.title, item.category, item.description, item.status, item.version].join(' ').toLowerCase().includes(search.toLowerCase())), [data.evidence, search]);

  const createCase = async (event: FormEvent) => {
    event.preventDefault();
    const { error: createError } = await supabase.from('operational_cases').insert({ ...caseForm, project_id: caseForm.project_id || null, due_date: caseForm.due_date || null });
    if (createError) return toast.error(createError.message);
    setCaseForm(emptyCase); setCreateOpen(false); refresh(); toast.success('Case created');
  };

  const createApproval = async (event: FormEvent) => {
    event.preventDefault();
    const { error: createError } = await supabase.from('approval_requests').insert({ ...approvalForm, project_id: approvalForm.project_id || null, due_date: approvalForm.due_date || null });
    if (createError) return toast.error(createError.message);
    setApprovalForm(emptyApproval); setCreateOpen(false); refresh(); toast.success('Approval requested');
  };

  const createEvidence = async (event: FormEvent) => {
    event.preventDefault();
    const { error: createError } = await supabase.from('evidence_register').insert({ ...evidenceForm, project_id: evidenceForm.project_id || null, review_due: evidenceForm.review_due || null, expires_on: evidenceForm.expires_on || null });
    if (createError) return toast.error(createError.message);
    setEvidenceForm(emptyEvidence); setCreateOpen(false); refresh(); toast.success('Evidence registered');
  };

  const updateCaseStatus = async (id: string, status: string) => {
    const resolved = ['resolved', 'closed'].includes(status);
    const { error: updateError } = await supabase.from('operational_cases').update({ status, resolved_at: resolved ? new Date().toISOString() : null }).eq('id', id);
    if (updateError) return toast.error(updateError.message);
    refresh();
  };

  const logCaseUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeCase) return;
    const { error: updateError } = await supabase.from('case_updates').insert({ case_id: activeCase.id, update_type: 'note', body: caseUpdate });
    if (updateError) return toast.error(updateError.message);
    setActiveCase(null); setCaseUpdate(''); refresh(); toast.success('Case update recorded');
  };

  const submitDecision = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeApproval) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error: updateError } = await supabase.from('approval_requests').update({ status: decision, decision_notes: decisionNotes || null, decided_at: new Date().toISOString(), approver_id: user?.id ?? null }).eq('id', activeApproval.id);
    if (updateError) return toast.error(updateError.message);
    setActiveApproval(null); setDecisionNotes(''); refresh(); toast.success(`Approval ${human(decision)}`);
  };

  const updateEvidenceStatus = async (id: string, status: string) => {
    const { error: updateError } = await supabase.from('evidence_register').update({ status, approved_at: status === 'approved' ? new Date().toISOString() : null }).eq('id', id);
    if (updateError) return toast.error(updateError.message);
    refresh();
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Loading case desk…</div>;
  if (error) return <div className="text-sm text-destructive">Case desk could not load: {error.message}</div>;

  const counts = [
    { label: 'Open cases', value: data.cases.filter((item) => !['resolved', 'closed'].includes(item.status)).length, icon: FolderOpen },
    { label: 'Critical', value: data.cases.filter((item) => item.priority === 'critical' && !['resolved', 'closed'].includes(item.status)).length, icon: ShieldAlert },
    { label: 'Pending approval', value: data.approvals.filter((item) => item.status === 'pending').length, icon: BadgeCheck },
    { label: 'Evidence to review', value: data.evidence.filter((item) => ['submitted', 'in_review'].includes(item.status)).length, icon: FileCheck2 },
  ];

  return <div className="max-w-7xl space-y-6">
    <header className="flex items-start justify-between gap-3">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Controlled operational hand-offs</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Cases, evidence and approvals</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Track an issue from assignment through evidence, independent review and a recorded decision.</p></div>
      {permission?.canManage && <Button className="min-h-10 shrink-0" onClick={() => setCreateOpen(true)}><Plus size={14} className="mr-1" />Add</Button>}
    </header>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{counts.map(({ label, value, icon: Icon }) => <div key={label} className="glass-card rounded-xl p-4"><Icon size={17} className="text-primary" /><div className="mt-3 text-2xl font-bold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>)}</div>

    <div className="space-y-3 md:flex md:items-center md:justify-between md:space-y-0">
      <div className="native-scroll flex gap-1 overflow-x-auto rounded-xl border border-border/50 bg-muted/20 p-1">{(['cases', 'approvals', 'evidence'] as DeskView[]).map((item) => <button key={item} onClick={() => setSearchParams(item === 'cases' ? {} : { view: item })} className={cn('min-h-10 whitespace-nowrap rounded-lg px-4 text-xs font-medium capitalize', view === item ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>{item}</button>)}</div>
      <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 md:w-80"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${view}`} className="w-full bg-transparent text-sm outline-none" /></label>
    </div>

    {view === 'cases' && <div className="grid gap-3 lg:grid-cols-2">{cases.map((item) => <article key={item.id} className="glass-card rounded-2xl p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.case_reference} · {human(item.case_type)}</div><h2 className="mt-1 font-semibold">{item.title}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.summary || 'No summary recorded'}</p></div><span className={cn('rounded-full px-2 py-1 text-[10px] font-semibold capitalize', item.priority === 'critical' ? 'bg-destructive/10 text-destructive' : item.priority === 'high' ? 'bg-amber-500/10 text-amber-400' : 'bg-muted text-muted-foreground')}>{item.priority}</span></div><div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground"><span>{item.territory}</span><span>•</span><span>{projectName(item.project_id)}</span><span className="ml-auto flex items-center gap-1"><CalendarClock size={11} />{item.due_date ?? 'No due date'}</span></div><div className="mt-4 flex items-center gap-2">{permission?.canManage ? <select aria-label={`Status for ${item.title}`} value={item.status} onChange={(event) => updateCaseStatus(item.id, event.target.value)} className="min-h-10 flex-1 rounded-lg border border-border bg-background px-2 text-xs capitalize">{caseStatuses.map((status) => <option key={status} value={status}>{human(status)}</option>)}</select> : <span className="text-xs capitalize">{human(item.status)}</span>}{permission?.canManage && <Button variant="outline" size="sm" className="min-h-10" onClick={() => setActiveCase(item)}><MessageSquarePlus size={13} className="mr-1" />Update</Button>}</div></article>)}{!cases.length && <Empty label="No cases match this view" />}</div>}

    {view === 'approvals' && <div className="grid gap-3 lg:grid-cols-2">{approvals.map((item) => <article key={item.id} className="glass-card rounded-2xl p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.approval_type}</div><h2 className="mt-1 font-semibold">{item.title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description || 'No supporting note'}</p></div><span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold capitalize">{human(item.status)}</span></div><div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground"><span>{projectName(item.project_id)}</span><span className="flex items-center gap-1"><CalendarClock size={11} />{item.due_date ?? 'No due date'}</span></div>{item.decision_notes && <div className="mt-3 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">Decision: {item.decision_notes}</div>}{permission?.canManage && item.status === 'pending' && <Button variant="outline" size="sm" className="mt-4 min-h-10 w-full" onClick={() => setActiveApproval(item)}>Record decision</Button>}</article>)}{!approvals.length && <Empty label="No approvals match this view" />}</div>}

    {view === 'evidence' && <div className="grid gap-3 lg:grid-cols-2">{evidence.map((item) => <article key={item.id} className="glass-card rounded-2xl p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.category} · v{item.version}</div><h2 className="mt-1 font-semibold">{item.title}</h2><p className="mt-1 text-xs text-muted-foreground">{projectName(item.project_id)}</p></div>{permission?.canManage ? <select aria-label={`Evidence status for ${item.title}`} value={item.status} onChange={(event) => updateEvidenceStatus(item.id, event.target.value)} className="min-h-9 rounded-lg border border-border bg-background px-2 text-[10px] capitalize">{evidenceStatuses.map((status) => <option key={status} value={status}>{human(status)}</option>)}</select> : <span className="text-xs capitalize">{human(item.status)}</span>}</div><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><div className="font-medium">Review due</div><div className="text-muted-foreground">{item.review_due ?? 'Not set'}</div></div><div><div className="font-medium">Expires</div><div className="text-muted-foreground">{item.expires_on ?? 'Not set'}</div></div></div><a href={item.file_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-10 items-center text-xs font-medium text-primary hover:underline">Open evidence</a></article>)}{!evidence.length && <Empty label="No evidence matches this view" />}</div>}

    <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Add {view === 'cases' ? 'case' : view === 'approvals' ? 'approval request' : 'evidence'}</DialogTitle></DialogHeader>{view === 'cases' ? <form onSubmit={createCase} className="space-y-3"><Input required value={caseForm.title} onChange={(event) => setCaseForm({ ...caseForm, title: event.target.value })} placeholder="Case title" /><Textarea value={caseForm.summary} onChange={(event) => setCaseForm({ ...caseForm, summary: event.target.value })} placeholder="What happened, impact and required outcome" /><div className="grid grid-cols-2 gap-2"><Select value={caseForm.case_type} onChange={(value) => setCaseForm({ ...caseForm, case_type: value })} options={['client','compliance','complaint','incident','support','third_party','finance','people']} /><Select value={caseForm.priority} onChange={(value) => setCaseForm({ ...caseForm, priority: value })} options={['low','medium','high','critical']} /><Select value={caseForm.territory} onChange={(value) => setCaseForm({ ...caseForm, territory: value })} options={['UK','DE','INT','GROUP']} /><Input type="date" value={caseForm.due_date} onChange={(event) => setCaseForm({ ...caseForm, due_date: event.target.value })} /></div><ProjectSelect value={caseForm.project_id} projects={projects} onChange={(value) => setCaseForm({ ...caseForm, project_id: value })} /><Button className="w-full" type="submit">Create case</Button></form> : view === 'approvals' ? <form onSubmit={createApproval} className="space-y-3"><Input required value={approvalForm.title} onChange={(event) => setApprovalForm({ ...approvalForm, title: event.target.value })} placeholder="Decision required" /><Input required value={approvalForm.approval_type} onChange={(event) => setApprovalForm({ ...approvalForm, approval_type: event.target.value })} placeholder="Approval type" /><Textarea value={approvalForm.description} onChange={(event) => setApprovalForm({ ...approvalForm, description: event.target.value })} placeholder="Decision criteria and supporting information" /><ProjectSelect value={approvalForm.project_id} projects={projects} onChange={(value) => setApprovalForm({ ...approvalForm, project_id: value })} /><Input type="date" value={approvalForm.due_date} onChange={(event) => setApprovalForm({ ...approvalForm, due_date: event.target.value })} /><Button className="w-full" type="submit">Request approval</Button></form> : <form onSubmit={createEvidence} className="space-y-3"><Input required value={evidenceForm.title} onChange={(event) => setEvidenceForm({ ...evidenceForm, title: event.target.value })} placeholder="Evidence title" /><Input required value={evidenceForm.category} onChange={(event) => setEvidenceForm({ ...evidenceForm, category: event.target.value })} placeholder="Category" /><Textarea value={evidenceForm.description} onChange={(event) => setEvidenceForm({ ...evidenceForm, description: event.target.value })} placeholder="What this proves" /><Input required type="url" value={evidenceForm.file_url} onChange={(event) => setEvidenceForm({ ...evidenceForm, file_url: event.target.value })} placeholder="Secure evidence URL" /><ProjectSelect value={evidenceForm.project_id} projects={projects} onChange={(value) => setEvidenceForm({ ...evidenceForm, project_id: value })} /><div className="grid grid-cols-3 gap-2"><Input value={evidenceForm.version} onChange={(event) => setEvidenceForm({ ...evidenceForm, version: event.target.value })} placeholder="Version" /><Input aria-label="Review due" type="date" value={evidenceForm.review_due} onChange={(event) => setEvidenceForm({ ...evidenceForm, review_due: event.target.value })} /><Input aria-label="Expiry date" type="date" value={evidenceForm.expires_on} onChange={(event) => setEvidenceForm({ ...evidenceForm, expires_on: event.target.value })} /></div><Button className="w-full" type="submit">Register evidence</Button></form>}</DialogContent></Dialog>

    <Dialog open={!!activeCase} onOpenChange={(open) => !open && setActiveCase(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Update {activeCase?.case_reference}</DialogTitle></DialogHeader><form onSubmit={logCaseUpdate} className="space-y-3"><Textarea required value={caseUpdate} onChange={(event) => setCaseUpdate(event.target.value)} placeholder="Action taken, contact made, evidence received or next step" /><Button className="w-full" type="submit">Record update</Button></form></DialogContent></Dialog>

    <Dialog open={!!activeApproval} onOpenChange={(open) => !open && setActiveApproval(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Record approval decision</DialogTitle></DialogHeader><form onSubmit={submitDecision} className="space-y-3"><Select value={decision} onChange={(value) => setDecision(value as typeof decision)} options={['approved','rejected','changes_requested']} /><Textarea value={decisionNotes} onChange={(event) => setDecisionNotes(event.target.value)} placeholder="Reason, conditions or changes required" /><Button className="w-full" type="submit">Save decision</Button></form></DialogContent></Dialog>
  </div>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-md border border-input bg-background px-3 text-sm capitalize">{options.map((option) => <option key={option} value={option}>{human(option)}</option>)}</select>;
}

function ProjectSelect({ value, onChange, projects }: { value: string; onChange: (value: string) => void; projects: Array<{ id: string; name: string }> }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Group / no project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>;
}

function Empty({ label }: { label: string }) {
  return <div className="col-span-full py-12 text-center text-sm text-muted-foreground"><Archive size={26} className="mx-auto mb-2" />{label}</div>;
}
