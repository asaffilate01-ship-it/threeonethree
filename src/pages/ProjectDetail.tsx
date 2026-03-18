import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProjectWithRelations, useToggleChecklistItem } from '@/hooks/useProjectData';
import StageBadge from '@/components/badges/StageBadge';
import ReadinessBar from '@/components/badges/ReadinessBar';
import ProjectSettingsModal from '@/components/modals/ProjectSettingsModal';
import AssignChecklistModal from '@/components/modals/AssignChecklistModal';
import {
  ArrowLeft, ExternalLink, CheckCircle2, Circle, AlertTriangle,
  Globe, Server, Mail, Shield, Puzzle, Plus, Trash2, Upload
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TABS = [
  'Summary', 'Launch Status', 'Checklist', 'Tasks', 'Apps & APIs',
  'Domains & Infra', 'Integrations', 'Costs & Finance', 'Compliance', 'Investments'
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-info',
  high: 'text-warning',
  critical: 'text-destructive',
};

function StatusToggle({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors w-full text-left group">
      {checked
        ? <CheckCircle2 size={16} className="text-success shrink-0" />
        : <Circle size={16} className="text-muted-foreground shrink-0 group-hover:text-primary" />
      }
      <span className={cn("text-sm flex-1", checked ? "text-muted-foreground line-through" : "text-foreground")}>{label}</span>
      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", checked ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
        {checked ? 'Done' : 'To Do'}
      </span>
    </button>
  );
}

function AddItemModal({ title, fields, onSave }: { title: string; fields: { key: string; label: string; type?: string }[]; onSave: (data: Record<string, string>) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={12} /> Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {fields.map(f => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs">{f.label}</Label>
              {f.type === 'textarea' ? (
                <Textarea value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} rows={2} />
              ) : (
                <Input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { onSave(form); setForm({}); setOpen(false); }}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProjectWithRelations(id || '');
  const toggleChecklist = useToggleChecklistItem();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Summary');
  const queryClient = useQueryClient();

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;
  if (!project) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Project not found</h2>
        <Link to="/projects" className="text-sm text-primary hover:underline mt-2 block">← Back to projects</Link>
      </div>
    </div>
  );

  const checklistItems = (project.project_checklist_items || []).sort((a, b) => {
    const aSort = a.checklist_template_items?.sort_order || 0;
    const bSort = b.checklist_template_items?.sort_order || 0;
    return aSort - bSort;
  });
  const doneCount = checklistItems.filter(i => i.is_done).length;
  const totalCount = checklistItems.length;
  const readinessPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const primaryDomain = project.domains?.[0]?.domain_name;

  const checklistByCategory: Record<string, typeof checklistItems> = {};
  checklistItems.forEach(item => {
    const cat = item.checklist_template_items?.category || 'other';
    if (!checklistByCategory[cat]) checklistByCategory[cat] = [];
    checklistByCategory[cat].push(item);
  });

  const monthlyFromCosts = (project.costs || []).reduce((s, c) => s + Number(c.monthly_cost_gbp || 0), 0);
  const monthlyFromHosting = (project.hosting || []).reduce((s, h) => s + Number(h.monthly_cost_gbp || 0), 0);
  const monthlyFromEmail = (project.email_services || []).reduce((s, e) => s + Number(e.monthly_cost_gbp || 0), 0);
  const annualFromDomains = (project.domains || []).reduce((s, d) => s + Number(d.annual_cost_gbp || 0), 0);
  const totalMonthly = monthlyFromCosts + monthlyFromHosting + monthlyFromEmail + (annualFromDomains / 12);

  const toggleProjectField = async (field: string, value: boolean) => {
    const { error } = await supabase.from('projects').update({ [field]: value } as any).eq('id', project.id);
    if (error) { toast.error('Failed to update'); return; }
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
  };

  const deleteItem = async (table: string, itemId: string) => {
    const { error } = await supabase.from(table as any).delete().eq('id', itemId);
    if (error) { toast.error('Delete failed'); return; }
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    toast.success('Deleted');
  };

  const addSubsidiaryApp = async (data: Record<string, string>) => {
    const { error } = await supabase.from('project_subsidiary_apps' as any).insert({ project_id: project.id, name: data.name, description: data.description, notes: data.notes });
    if (error) { toast.error('Failed to add'); return; }
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    toast.success('App added');
  };

  const addApi = async (data: Record<string, string>) => {
    const { error } = await supabase.from('project_apis' as any).insert({ project_id: project.id, name: data.name, vendor: data.vendor, notes: data.notes });
    if (error) { toast.error('Failed to add'); return; }
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    toast.success('API added');
  };

  const addAdditionalWork = async (data: Record<string, string>) => {
    const { error } = await supabase.from('project_additional_work' as any).insert({ project_id: project.id, name: data.name, notes: data.notes });
    if (error) { toast.error('Failed to add'); return; }
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    toast.success('Work item added');
  };

  const addCompliance = async (data: Record<string, string>) => {
    const { error } = await supabase.from('project_compliance' as any).insert({
      project_id: project.id, name: data.name, cost_gbp: data.cost_gbp ? Number(data.cost_gbp) : null,
      expiry_date: data.expiry_date || null, notes: data.notes
    });
    if (error) { toast.error('Failed to add'); return; }
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    toast.success('Compliance item added');
  };

  const addInvestment = async (data: Record<string, string>) => {
    const { error } = await supabase.from('project_investments' as any).insert({
      project_id: project.id, investor_name: data.investor_name,
      amount_gbp: data.amount_gbp ? Number(data.amount_gbp) : 0,
      shares_percent: data.shares_percent ? Number(data.shares_percent) : null,
      invested_at: data.invested_at || null, notes: data.notes
    });
    if (error) { toast.error('Failed to add'); return; }
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    toast.success('Investment added');
  };

  const addOverhead = async (data: Record<string, string>) => {
    const { error } = await supabase.from('project_overheads' as any).insert({
      project_id: project.id, category: data.category, name: data.name,
      amount_gbp: data.amount_gbp ? Number(data.amount_gbp) : 0,
      frequency: data.frequency || 'monthly', notes: data.notes
    });
    if (error) { toast.error('Failed to add'); return; }
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    toast.success('Overhead added');
  };

  const addSubscriptionTier = async (data: Record<string, string>) => {
    const { error } = await supabase.from('project_subscription_tiers' as any).insert({
      project_id: project.id, tier_name: data.tier_name,
      price_gbp: data.price_gbp ? Number(data.price_gbp) : null,
      billing_period: data.billing_period || 'monthly', features: data.features, notes: data.notes
    });
    if (error) { toast.error('Failed to add'); return; }
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    toast.success('Tier added');
  };

  const addCost = async (data: Record<string, string>) => {
    const { error } = await supabase.from('costs').insert({
      project_id: project.id, cost_name: data.cost_name, vendor: data.vendor,
      cost_type: data.cost_type, monthly_cost_gbp: data.monthly_cost_gbp ? Number(data.monthly_cost_gbp) : null,
      annual_cost_gbp: data.annual_cost_gbp ? Number(data.annual_cost_gbp) : null,
      one_off_cost_gbp: data.one_off_cost_gbp ? Number(data.one_off_cost_gbp) : null,
      paid_by: data.paid_by || null, notes: data.notes
    } as any);
    if (error) { toast.error('Failed to add cost'); return; }
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    toast.success('Cost added');
  };

  const toggleItemStatus = async (table: string, itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'to_do' : 'done';
    const { error } = await supabase.from(table as any).update({ status: newStatus }).eq('id', itemId);
    if (error) { toast.error('Update failed'); return; }
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
  };

  const updateSocialUrl = async (field: string, value: string) => {
    const { error } = await supabase.from('projects').update({ [field]: value } as any).eq('id', project.id);
    if (error) toast.error('Failed to save');
    else queryClient.invalidateQueries({ queryKey: ['project', project.id] });
  };

  const p = project as any; // for new fields

  return (
    <div className="space-y-6 max-w-6xl">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Projects
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
              <StageBadge stage={project.stage} />
              {p.delivery_type && (
                <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                  p.delivery_type === 'saas_only' ? "bg-info/15 text-info" :
                  p.delivery_type === 'app_only' ? "bg-warning/15 text-warning" :
                  "bg-primary/15 text-primary"
                )}>{p.delivery_type.replace(/_/g, ' ')}</span>
              )}
              {p.is_live && <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-success/20 text-success uppercase">Live</span>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{project.short_description}</p>
            {primaryDomain && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
                <ExternalLink size={12} />{primaryDomain}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ProjectSettingsModal projectId={project.id} projectName={project.name} />
            <AssignChecklistModal projectId={project.id} projectName={project.name} />
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{readinessPercent}%</div>
              <div className="text-xs text-muted-foreground">Launch Ready</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5 pt-5 border-t border-border/50">
          <div><div className="text-xs text-muted-foreground">Industry</div><div className="text-sm font-medium text-foreground mt-0.5">{project.industry || '—'}</div></div>
          <div><div className="text-xs text-muted-foreground">Audience</div><div className="text-sm font-medium text-foreground mt-0.5">{project.audience || '—'}</div></div>
          <div><div className="text-xs text-muted-foreground">Revenue Model</div><div className="text-sm font-medium text-foreground mt-0.5">{project.revenue_model || '—'}</div></div>
          <div><div className="text-xs text-muted-foreground">Monthly Burn</div><div className="text-sm font-bold text-foreground mt-0.5">£{Math.round(totalMonthly).toLocaleString()}</div></div>
          <div><div className="text-xs text-muted-foreground">Readiness</div><div className="mt-1"><ReadinessBar percent={readinessPercent} size="md" /></div></div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/50 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap", activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {tab}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

        {/* ===== SUMMARY ===== */}
        {activeTab === 'Summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Platforms</h3>
              <div className="space-y-2">
                {(project.project_platforms || []).length > 0 ? project.project_platforms.map(pl => (
                  <div key={pl.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={pl.is_built ? "text-success" : "text-muted-foreground"} />
                      <span className="text-foreground capitalize">{pl.platform.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex gap-2">
                      {pl.is_required && <span className="text-[10px] bg-info/10 text-info px-1.5 py-0.5 rounded">Required</span>}
                      {pl.is_built && <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded">Built</span>}
                    </div>
                  </div>
                )) : <span className="text-sm text-muted-foreground">No platforms defined</span>}
              </div>
            </div>
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">App Surfaces</h3>
              <div className="space-y-2">
                {(project.project_surfaces || []).length > 0 ? project.project_surfaces.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={s.is_built ? "text-success" : "text-muted-foreground"} />
                      <span className="text-foreground capitalize">{s.surface.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex gap-2">
                      {s.auth_required && <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded">Auth</span>}
                      {s.is_built && <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded">Built</span>}
                    </div>
                  </div>
                )) : <span className="text-sm text-muted-foreground">No surfaces defined</span>}
              </div>
            </div>
            {project.notes && (
              <div className="glass-card rounded-xl p-5 md:col-span-2">
                <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* ===== LAUNCH STATUS ===== */}
        {activeTab === 'Launch Status' && (
          <div className="space-y-4">
            {/* Delivery Type */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Delivery Type</h3>
              <Select value={p.delivery_type || 'saas_only'} onValueChange={v => { supabase.from('projects').update({ delivery_type: v } as any).eq('id', project.id).then(() => queryClient.invalidateQueries({ queryKey: ['project', project.id] })); }}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas_only">SaaS Only</SelectItem>
                  <SelectItem value="saas_and_app">SaaS & App</SelectItem>
                  <SelectItem value="app_only">App Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Domains */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Domain Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Test Domain</Label>
                  <Input defaultValue={p.test_domain || ''} onBlur={e => updateSocialUrl('test_domain', e.target.value)} placeholder="e.g. staging.myapp.com" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!p.domain_awaiting} onCheckedChange={v => toggleProjectField('domain_awaiting', !!v)} />
                    <Label className="text-xs">Awaiting domain</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Logo</h3>
              <StatusToggle label="Logo uploaded/ready" checked={!!p.has_logo} onToggle={() => toggleProjectField('has_logo', !p.has_logo)} />
            </div>

            {/* Technical Readiness */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Technical Readiness</h3>
              <div className="space-y-0.5">
                <StatusToggle label="Email API configured" checked={!!p.email_api_configured} onToggle={() => toggleProjectField('email_api_configured', !p.email_api_configured)} />
                <StatusToggle label="Payment gateway API configured" checked={!!p.payment_gateway_configured} onToggle={() => toggleProjectField('payment_gateway_configured', !p.payment_gateway_configured)} />
                <StatusToggle label="Security (OWASP Top 10) checked" checked={!!p.security_owasp_checked} onToggle={() => toggleProjectField('security_owasp_checked', !p.security_owasp_checked)} />
                <StatusToggle label="System audit done" checked={!!p.audit_done} onToggle={() => toggleProjectField('audit_done', !p.audit_done)} />
                <StatusToggle label="Push notifications working" checked={!!p.push_notifications_done} onToggle={() => toggleProjectField('push_notifications_done', !p.push_notifications_done)} />
                <StatusToggle label="Broadcasts done" checked={!!p.broadcasts_done} onToggle={() => toggleProjectField('broadcasts_done', !p.broadcasts_done)} />
                <StatusToggle label="Edge functions all checked" checked={!!p.edge_functions_checked} onToggle={() => toggleProjectField('edge_functions_checked', !p.edge_functions_checked)} />
                <StatusToggle label="Security checked" checked={!!p.security_checked} onToggle={() => toggleProjectField('security_checked', !p.security_checked)} />
                <StatusToggle label="Roles & permissions checked" checked={!!p.roles_permissions_checked} onToggle={() => toggleProjectField('roles_permissions_checked', !p.roles_permissions_checked)} />
                <StatusToggle label="Dead links checked" checked={!!p.dead_links_checked} onToggle={() => toggleProjectField('dead_links_checked', !p.dead_links_checked)} />
              </div>
            </div>

            {/* Legal & Compliance */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Legal & Compliance</h3>
              <div className="space-y-0.5">
                <StatusToggle label="GDPR compliance" checked={!!p.gdpr_done} onToggle={() => toggleProjectField('gdpr_done', !p.gdpr_done)} />
                <StatusToggle label="Terms of Service" checked={!!p.terms_done} onToggle={() => toggleProjectField('terms_done', !p.terms_done)} />
                <StatusToggle label="Privacy Policy" checked={!!p.privacy_done} onToggle={() => toggleProjectField('privacy_done', !p.privacy_done)} />
                <StatusToggle label="Other legals" checked={!!p.legals_done} onToggle={() => toggleProjectField('legals_done', !p.legals_done)} />
              </div>
            </div>

            {/* SEO & Social */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">SEO & Marketing</h3>
              <div className="space-y-0.5">
                <StatusToggle label="SEO done" checked={!!p.seo_done} onToggle={() => toggleProjectField('seo_done', !p.seo_done)} />
                <StatusToggle label="Open Graph (OG) tags done" checked={!!p.og_done} onToggle={() => toggleProjectField('og_done', !p.og_done)} />
              </div>
            </div>

            {/* Social Media URLs */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Social Media URLs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { field: 'social_facebook', label: 'Facebook' },
                  { field: 'social_instagram', label: 'Instagram' },
                  { field: 'social_tiktok', label: 'TikTok' },
                  { field: 'social_youtube', label: 'YouTube' },
                  { field: 'social_x', label: 'X (Twitter)' },
                ].map(s => (
                  <div key={s.field} className="space-y-1">
                    <Label className="text-xs">{s.label}</Label>
                    <Input defaultValue={p[s.field] || ''} onBlur={e => updateSocialUrl(s.field, e.target.value)} placeholder={`${s.label} URL`} />
                  </div>
                ))}
              </div>
            </div>

            {/* PWA & Native */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">PWA & Native</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!p.pwa_required} onCheckedChange={v => toggleProjectField('pwa_required', !!v)} />
                    <Label className="text-xs">PWA Required</Label>
                  </div>
                  {p.pwa_required && (
                    <StatusToggle label="PWA done" checked={!!p.pwa_done} onToggle={() => toggleProjectField('pwa_done', !p.pwa_done)} />
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!p.native_required} onCheckedChange={v => toggleProjectField('native_required', !!v)} />
                    <Label className="text-xs">Native Required</Label>
                  </div>
                  {p.native_required && (
                    <StatusToggle label="Native done" checked={!!p.native_done} onToggle={() => toggleProjectField('native_done', !p.native_done)} />
                  )}
                </div>
              </div>
            </div>

            {/* Live status */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Go Live</h3>
              <StatusToggle label="Project is LIVE" checked={!!p.is_live} onToggle={() => toggleProjectField('is_live', !p.is_live)} />
            </div>
          </div>
        )}

        {/* ===== CHECKLIST ===== */}
        {activeTab === 'Checklist' && (
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Launch Readiness Checklist</h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-foreground">{readinessPercent}%</span>
                <span className="text-xs text-muted-foreground">{doneCount}/{totalCount}</span>
              </div>
            </div>
            <ReadinessBar percent={readinessPercent} size="md" />
            <div className="mt-6 space-y-6">
              {Object.entries(checklistByCategory).map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 capitalize">{category}</h4>
                  <div className="space-y-0.5">
                    {items.map(item => (
                      <button key={item.id} onClick={() => toggleChecklist.mutate({ id: item.id, is_done: !item.is_done })} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors w-full text-left group" disabled={toggleChecklist.isPending}>
                        {item.is_done ? <CheckCircle2 size={16} className="text-success shrink-0" /> : <Circle size={16} className="text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />}
                        <span className={cn("text-sm flex-1", item.is_done ? "text-muted-foreground line-through" : "text-foreground")}>{item.checklist_template_items?.label}</span>
                        {item.checklist_template_items?.is_critical && !item.is_done && <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">Critical</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TASKS ===== */}
        {activeTab === 'Tasks' && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Tasks ({(project.tasks || []).length})</h3>
            {(project.tasks || []).length > 0 ? (
              <div className="space-y-2">
                {project.tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-3">
                      {task.status === 'blocked' && <AlertTriangle size={14} className="text-destructive" />}
                      <div>
                        <div className="text-sm font-medium text-foreground">{task.title}</div>
                        {task.blocked_reason && <div className="text-xs text-destructive mt-0.5">{task.blocked_reason}</div>}
                        {task.description && <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {task.assigned_to && <span className="text-xs text-muted-foreground">{task.assigned_to}</span>}
                      <span className={cn("text-xs font-medium", PRIORITY_COLORS[task.priority])}>{task.priority}</span>
                      <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded">{task.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-sm text-muted-foreground text-center py-8">No tasks yet</div>}
          </div>
        )}

        {/* ===== APPS & APIs ===== */}
        {activeTab === 'Apps & APIs' && (
          <div className="space-y-4">
            {/* Subsidiary Apps */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Subsidiary Apps</h3>
                <AddItemModal title="Add Subsidiary App" fields={[
                  { key: 'name', label: 'App Name' },
                  { key: 'description', label: 'Description' },
                  { key: 'notes', label: 'Notes (where we are)', type: 'textarea' },
                ]} onSave={addSubsidiaryApp} />
              </div>
              <div className="space-y-2">
                {(p.project_subsidiary_apps || []).map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleItemStatus('project_subsidiary_apps', app.id, app.status)}>
                        {app.status === 'done' ? <CheckCircle2 size={14} className="text-success" /> : <Circle size={14} className="text-muted-foreground hover:text-primary" />}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-foreground">{app.name}</div>
                        {app.description && <div className="text-xs text-muted-foreground">{app.description}</div>}
                        {app.notes && <div className="text-xs text-muted-foreground/70 italic mt-0.5">{app.notes}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", app.status === 'done' ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{app.status === 'done' ? 'Done' : 'To Do'}</span>
                      <button onClick={() => deleteItem('project_subsidiary_apps', app.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {(p.project_subsidiary_apps || []).length === 0 && <div className="text-sm text-muted-foreground text-center py-4">No subsidiary apps yet</div>}
              </div>
            </div>

            {/* Additional APIs */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Additional APIs</h3>
                <AddItemModal title="Add API" fields={[
                  { key: 'name', label: 'API Name (e.g. AWS, Jitsi, DVLA)' },
                  { key: 'vendor', label: 'Vendor' },
                  { key: 'notes', label: 'Notes', type: 'textarea' },
                ]} onSave={addApi} />
              </div>
              <div className="space-y-2">
                {(p.project_apis || []).map((api: any) => (
                  <div key={api.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleItemStatus('project_apis', api.id, api.status)}>
                        {api.status === 'done' ? <CheckCircle2 size={14} className="text-success" /> : <Circle size={14} className="text-muted-foreground hover:text-primary" />}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-foreground">{api.name}</div>
                        {api.vendor && <div className="text-xs text-muted-foreground">{api.vendor}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", api.status === 'done' ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{api.status === 'done' ? 'Done' : 'To Do'}</span>
                      <button onClick={() => deleteItem('project_apis', api.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {(p.project_apis || []).length === 0 && <div className="text-sm text-muted-foreground text-center py-4">No additional APIs</div>}
              </div>
            </div>

            {/* Additional Work */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Additional Work</h3>
                <AddItemModal title="Add Work Item" fields={[
                  { key: 'name', label: 'Work Item (e.g. Audio uploads, Testing)' },
                  { key: 'notes', label: 'Notes', type: 'textarea' },
                ]} onSave={addAdditionalWork} />
              </div>
              <div className="space-y-2">
                {(p.project_additional_work || []).map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleItemStatus('project_additional_work', w.id, w.status)}>
                        {w.status === 'done' ? <CheckCircle2 size={14} className="text-success" /> : <Circle size={14} className="text-muted-foreground hover:text-primary" />}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-foreground">{w.name}</div>
                        {w.notes && <div className="text-xs text-muted-foreground">{w.notes}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", w.status === 'done' ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{w.status === 'done' ? 'Done' : 'To Do'}</span>
                      <button onClick={() => deleteItem('project_additional_work', w.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {(p.project_additional_work || []).length === 0 && <div className="text-sm text-muted-foreground text-center py-4">No additional work items</div>}
              </div>
            </div>
          </div>
        )}

        {/* ===== DOMAINS & INFRA ===== */}
        {activeTab === 'Domains & Infra' && (
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Globe size={14} /> Domains</h3>
              {(project.domains || []).length > 0 ? (
                <div className="space-y-2">
                  {project.domains.map(d => (
                    <div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 border border-border/30">
                      <div>
                        <div className="text-sm font-medium text-foreground">{d.domain_name}</div>
                        <div className="text-xs text-muted-foreground">{d.registrar || 'No registrar'} · {d.auto_renew ? 'Auto-renew' : 'Manual'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {d.renew_date && <span className="text-xs text-muted-foreground">Renews {d.renew_date}</span>}
                        {d.annual_cost_gbp && <span className="text-xs text-muted-foreground">£{Number(d.annual_cost_gbp)}/yr</span>}
                        <span className={cn("text-xs px-2 py-0.5 rounded font-medium", d.status === 'active' ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{d.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-sm text-muted-foreground text-center py-4">No domains registered</div>}
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Server size={14} /> Hosting</h3>
              {(project.hosting || []).length > 0 ? (
                <div className="space-y-2">
                  {project.hosting.map(h => (
                    <div key={h.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 border border-border/30">
                      <div>
                        <div className="text-sm font-medium text-foreground">{h.provider}</div>
                        <div className="text-xs text-muted-foreground">{h.hosting_type || 'cloud'} · {h.environment} · {h.region || 'No region'}</div>
                      </div>
                      {h.monthly_cost_gbp && <span className="text-xs text-muted-foreground">£{Number(h.monthly_cost_gbp)}/mo</span>}
                    </div>
                  ))}
                </div>
              ) : <div className="text-sm text-muted-foreground text-center py-4">No hosting entries</div>}
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Mail size={14} /> Email Services</h3>
              {(project.email_services || []).length > 0 ? (
                <div className="space-y-2">
                  {project.email_services.map(e => (
                    <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 border border-border/30">
                      <div>
                        <div className="text-sm font-medium text-foreground">{e.provider}</div>
                        <div className="text-xs text-muted-foreground">{e.primary_domain || 'No primary domain'}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {e.spf_configured ? <CheckCircle2 size={12} className="text-success" /> : <Circle size={12} className="text-muted-foreground" />}
                        <span className="text-[10px] text-muted-foreground">SPF</span>
                        {e.dkim_configured ? <CheckCircle2 size={12} className="text-success" /> : <Circle size={12} className="text-muted-foreground" />}
                        <span className="text-[10px] text-muted-foreground">DKIM</span>
                        {e.dmarc_configured ? <CheckCircle2 size={12} className="text-success" /> : <Circle size={12} className="text-muted-foreground" />}
                        <span className="text-[10px] text-muted-foreground">DMARC</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-sm text-muted-foreground text-center py-4">No email services configured</div>}
            </div>
          </div>
        )}

        {/* ===== INTEGRATIONS ===== */}
        {activeTab === 'Integrations' && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Puzzle size={14} /> Project Integrations</h3>
            {(project.project_integrations || []).length > 0 ? (
              <div className="space-y-2">
                {project.project_integrations.map(pi => {
                  const int = (pi as any).integrations;
                  return (
                    <div key={pi.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 border border-border/30">
                      <div>
                        <div className="text-sm font-medium text-foreground">{int?.name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{int?.vendor} · {int?.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pi.is_required && <span className="text-[10px] bg-info/10 text-info px-1.5 py-0.5 rounded">Required</span>}
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", pi.is_configured ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>{pi.is_configured ? 'Configured' : 'Missing'}</span>
                        {pi.is_live && <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded">Live</span>}
                        {pi.monthly_cost_gbp && <span className="text-xs text-muted-foreground">£{Number(pi.monthly_cost_gbp)}/mo</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="text-sm text-muted-foreground text-center py-8">No integrations tracked</div>}
          </div>
        )}

        {/* ===== COSTS & FINANCE ===== */}
        {activeTab === 'Costs & Finance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="kpi-card"><div className="text-xs text-muted-foreground uppercase tracking-wider">Domains</div><div className="text-lg font-bold text-foreground mt-1">£{Math.round(annualFromDomains / 12)}/mo</div></div>
              <div className="kpi-card"><div className="text-xs text-muted-foreground uppercase tracking-wider">Hosting</div><div className="text-lg font-bold text-foreground mt-1">£{Math.round(monthlyFromHosting)}/mo</div></div>
              <div className="kpi-card"><div className="text-xs text-muted-foreground uppercase tracking-wider">Email</div><div className="text-lg font-bold text-foreground mt-1">£{Math.round(monthlyFromEmail)}/mo</div></div>
              <div className="kpi-card"><div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div><div className="text-lg font-bold text-foreground mt-1">£{Math.round(totalMonthly)}/mo</div><div className="text-xs text-muted-foreground mt-1">£{Math.round(totalMonthly * 12)}/yr</div></div>
            </div>

            {/* Costs table with Add */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Costs</h3>
                <AddItemModal title="Add Cost" fields={[
                  { key: 'cost_name', label: 'Cost Name' },
                  { key: 'vendor', label: 'Vendor' },
                  { key: 'cost_type', label: 'Type (recurring, one-off, etc.)' },
                  { key: 'monthly_cost_gbp', label: 'Monthly £', type: 'number' },
                  { key: 'annual_cost_gbp', label: 'Annual £', type: 'number' },
                  { key: 'one_off_cost_gbp', label: 'One-off £', type: 'number' },
                  { key: 'paid_by', label: 'Paid By' },
                  { key: 'notes', label: 'Notes', type: 'textarea' },
                ]} onSave={addCost} />
              </div>
              {(project.costs || []).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase px-3 py-2">Cost</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase px-3 py-2">Vendor</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase px-3 py-2">Paid By</th>
                        <th className="text-right text-xs font-medium text-muted-foreground uppercase px-3 py-2">Monthly</th>
                        <th className="text-right text-xs font-medium text-muted-foreground uppercase px-3 py-2">Annual</th>
                        <th className="text-center text-xs font-medium text-muted-foreground uppercase px-3 py-2">Reimbursed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.costs.map(cost => (
                        <tr key={cost.id} className="border-b border-border/30 hover:bg-muted/20">
                          <td className="px-3 py-2 text-sm text-foreground">{cost.cost_name}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{cost.vendor || '—'}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{(cost as any).paid_by || '—'}</td>
                          <td className="px-3 py-2 text-right text-sm text-foreground">£{Number(cost.monthly_cost_gbp || 0)}</td>
                          <td className="px-3 py-2 text-right text-sm text-muted-foreground">£{Number(cost.annual_cost_gbp || 0)}</td>
                          <td className="px-3 py-2 text-center">
                            {(cost as any).is_reimbursed ? <CheckCircle2 size={14} className="text-success mx-auto" /> : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div className="text-sm text-muted-foreground text-center py-4">No costs recorded</div>}
            </div>

            {/* Overheads */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Overheads</h3>
                <AddItemModal title="Add Overhead" fields={[
                  { key: 'category', label: 'Category (rent, utilities, salaries, technology)' },
                  { key: 'name', label: 'Name' },
                  { key: 'amount_gbp', label: 'Amount £', type: 'number' },
                  { key: 'frequency', label: 'Frequency (monthly, annual, one_off)' },
                  { key: 'notes', label: 'Notes', type: 'textarea' },
                ]} onSave={addOverhead} />
              </div>
              <div className="space-y-2">
                {(p.project_overheads || []).map((oh: any) => (
                  <div key={oh.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 border border-border/30">
                    <div>
                      <div className="text-sm font-medium text-foreground">{oh.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{oh.category} · {oh.frequency}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">£{Number(oh.amount_gbp)}</span>
                      <button onClick={() => deleteItem('project_overheads', oh.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {(p.project_overheads || []).length === 0 && <div className="text-sm text-muted-foreground text-center py-4">No overheads</div>}
              </div>
            </div>

            {/* Subscription Tiers */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Subscription Tiers</h3>
                <AddItemModal title="Add Subscription Tier" fields={[
                  { key: 'tier_name', label: 'Tier Name' },
                  { key: 'price_gbp', label: 'Price £', type: 'number' },
                  { key: 'billing_period', label: 'Billing Period (monthly, annual)' },
                  { key: 'features', label: 'Features', type: 'textarea' },
                  { key: 'notes', label: 'Notes', type: 'textarea' },
                ]} onSave={addSubscriptionTier} />
              </div>
              <div className="space-y-2">
                {(p.project_subscription_tiers || []).map((tier: any) => (
                  <div key={tier.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 border border-border/30">
                    <div>
                      <div className="text-sm font-medium text-foreground">{tier.tier_name}</div>
                      <div className="text-xs text-muted-foreground">{tier.features}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">£{Number(tier.price_gbp || 0)}/{tier.billing_period}</span>
                      <button onClick={() => deleteItem('project_subscription_tiers', tier.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {(p.project_subscription_tiers || []).length === 0 && <div className="text-sm text-muted-foreground text-center py-4">No subscription tiers</div>}
              </div>
            </div>
          </div>
        )}

        {/* ===== COMPLIANCE ===== */}
        {activeTab === 'Compliance' && (
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Compliance & Certifications</h3>
              <AddItemModal title="Add Compliance Item" fields={[
                { key: 'name', label: 'Name (e.g. Ofsted, Insurance, Qualifi)' },
                { key: 'cost_gbp', label: 'Cost £', type: 'number' },
                { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
                { key: 'notes', label: 'Notes', type: 'textarea' },
              ]} onSave={addCompliance} />
            </div>
            <div className="space-y-2">
              {(p.project_compliance || []).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleItemStatus('project_compliance', c.id, c.status)}>
                      {c.status === 'done' ? <CheckCircle2 size={14} className="text-success" /> : <Circle size={14} className="text-muted-foreground hover:text-primary" />}
                    </button>
                    <div>
                      <div className="text-sm font-medium text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.cost_gbp ? `£${Number(c.cost_gbp)}` : ''}{c.expiry_date ? ` · Expires ${c.expiry_date}` : ''}{c.notes ? ` · ${c.notes}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", c.status === 'done' ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{c.status === 'done' ? 'Done' : 'To Do'}</span>
                    <button onClick={() => deleteItem('project_compliance', c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              {(p.project_compliance || []).length === 0 && <div className="text-sm text-muted-foreground text-center py-8">No compliance items. Add Ofsted, insurance, Qualifi, etc.</div>}
            </div>
          </div>
        )}

        {/* ===== INVESTMENTS ===== */}
        {activeTab === 'Investments' && (
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Investments & Shareholders</h3>
              <AddItemModal title="Add Investment" fields={[
                { key: 'investor_name', label: 'Investor / Shareholder Name' },
                { key: 'amount_gbp', label: 'Amount £', type: 'number' },
                { key: 'shares_percent', label: 'Shares %', type: 'number' },
                { key: 'invested_at', label: 'Date', type: 'date' },
                { key: 'notes', label: 'Notes', type: 'textarea' },
              ]} onSave={addInvestment} />
            </div>
            <div className="space-y-2">
              {(p.project_investments || []).map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 border border-border/30">
                  <div>
                    <div className="text-sm font-medium text-foreground">{inv.investor_name}</div>
                    <div className="text-xs text-muted-foreground">{inv.invested_at ? `Invested ${inv.invested_at}` : ''}{inv.notes ? ` · ${inv.notes}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">£{Number(inv.amount_gbp).toLocaleString()}</span>
                    {inv.shares_percent && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{Number(inv.shares_percent)}%</span>}
                    <button onClick={() => deleteItem('project_investments', inv.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              {(p.project_investments || []).length === 0 && <div className="text-sm text-muted-foreground text-center py-8">No investments recorded</div>}
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
