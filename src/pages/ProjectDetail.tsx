import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProjectWithRelations, useToggleChecklistItem } from '@/hooks/useProjectData';
import StageBadge from '@/components/badges/StageBadge';
import ReadinessBar from '@/components/badges/ReadinessBar';
import ProjectSettingsModal from '@/components/modals/ProjectSettingsModal';
import AssignChecklistModal from '@/components/modals/AssignChecklistModal';
import { ArrowLeft, ExternalLink, CheckCircle2, Circle, AlertTriangle, Globe, Server, Mail, Shield, Puzzle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const TABS = ['Summary', 'Checklist', 'Tasks', 'Domains & Infra', 'Integrations', 'Costs'] as const;

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-info',
  high: 'text-warning',
  critical: 'text-destructive',
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProjectWithRelations(id || '');
  const toggleChecklist = useToggleChecklistItem();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Summary');

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Project not found</h2>
          <Link to="/projects" className="text-sm text-primary hover:underline mt-2 block">← Back to projects</Link>
        </div>
      </div>
    );
  }

  const checklistItems = (project.project_checklist_items || []).sort((a, b) => {
    const aSort = a.checklist_template_items?.sort_order || 0;
    const bSort = b.checklist_template_items?.sort_order || 0;
    return aSort - bSort;
  });
  const doneCount = checklistItems.filter(i => i.is_done).length;
  const totalCount = checklistItems.length;
  const readinessPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const primaryDomain = project.domains?.[0]?.domain_name;

  // Group checklist by category
  const checklistByCategory: Record<string, typeof checklistItems> = {};
  checklistItems.forEach(item => {
    const cat = item.checklist_template_items?.category || 'other';
    if (!checklistByCategory[cat]) checklistByCategory[cat] = [];
    checklistByCategory[cat].push(item);
  });

  // Cost totals
  const monthlyFromCosts = (project.costs || []).reduce((s, c) => s + Number(c.monthly_cost_gbp || 0), 0);
  const monthlyFromHosting = (project.hosting || []).reduce((s, h) => s + Number(h.monthly_cost_gbp || 0), 0);
  const monthlyFromEmail = (project.email_services || []).reduce((s, e) => s + Number(e.monthly_cost_gbp || 0), 0);
  const annualFromDomains = (project.domains || []).reduce((s, d) => s + Number(d.annual_cost_gbp || 0), 0);
  const totalMonthly = monthlyFromCosts + monthlyFromHosting + monthlyFromEmail + (annualFromDomains / 12);

  return (
    <div className="space-y-6 max-w-6xl">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Projects
      </Link>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
              <StageBadge stage={project.stage} />
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
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap", activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {tab}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {/* Summary */}
        {activeTab === 'Summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Platforms</h3>
              <div className="space-y-2">
                {(project.project_platforms || []).length > 0 ? project.project_platforms.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={p.is_built ? "text-success" : "text-muted-foreground"} />
                      <span className="text-foreground capitalize">{p.platform.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex gap-2">
                      {p.is_required && <span className="text-[10px] bg-info/10 text-info px-1.5 py-0.5 rounded">Required</span>}
                      {p.is_built && <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded">Built</span>}
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

        {/* Checklist - Interactive */}
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
                      <button
                        key={item.id}
                        onClick={() => toggleChecklist.mutate({ id: item.id, is_done: !item.is_done })}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors w-full text-left group"
                        disabled={toggleChecklist.isPending}
                      >
                        {item.is_done
                          ? <CheckCircle2 size={16} className="text-success shrink-0" />
                          : <Circle size={16} className="text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                        }
                        <span className={cn("text-sm flex-1", item.is_done ? "text-muted-foreground line-through" : "text-foreground")}>
                          {item.checklist_template_items?.label}
                        </span>
                        {item.checklist_template_items?.is_critical && !item.is_done && (
                          <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">Critical</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
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

        {/* Domains & Infra */}
        {activeTab === 'Domains & Infra' && (
          <div className="space-y-4">
            {/* Domains */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Globe size={14} /> Domains</h3>
              {(project.domains || []).length > 0 ? (
                <div className="space-y-2">
                  {project.domains.map(d => (
                    <div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 border border-border/30">
                      <div>
                        <div className="text-sm font-medium text-foreground">{d.domain_name}</div>
                        <div className="text-xs text-muted-foreground">{d.registrar || 'No registrar'} · {d.auto_renew ? 'Auto-renew' : 'Manual renew'}</div>
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

            {/* Hosting */}
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

            {/* Email */}
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
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          {e.spf_configured ? <CheckCircle2 size={12} className="text-success" /> : <Circle size={12} className="text-muted-foreground" />}
                          <span className="text-[10px] text-muted-foreground">SPF</span>
                          {e.dkim_configured ? <CheckCircle2 size={12} className="text-success" /> : <Circle size={12} className="text-muted-foreground" />}
                          <span className="text-[10px] text-muted-foreground">DKIM</span>
                          {e.dmarc_configured ? <CheckCircle2 size={12} className="text-success" /> : <Circle size={12} className="text-muted-foreground" />}
                          <span className="text-[10px] text-muted-foreground">DMARC</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-sm text-muted-foreground text-center py-4">No email services configured</div>}
            </div>
          </div>
        )}

        {/* Integrations */}
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
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium",
                          pi.is_configured ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}>{pi.is_configured ? 'Configured' : 'Missing'}</span>
                        {pi.is_live && <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded">Live</span>}
                        {pi.monthly_cost_gbp && <span className="text-xs text-muted-foreground">£{Number(pi.monthly_cost_gbp)}/mo</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="text-sm text-muted-foreground text-center py-8">No integrations tracked for this project</div>}
          </div>
        )}

        {/* Costs */}
        {activeTab === 'Costs' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="kpi-card">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Domains</div>
                <div className="text-lg font-bold text-foreground mt-1">£{Math.round(annualFromDomains / 12)}/mo</div>
              </div>
              <div className="kpi-card">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Hosting</div>
                <div className="text-lg font-bold text-foreground mt-1">£{Math.round(monthlyFromHosting)}/mo</div>
              </div>
              <div className="kpi-card">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Email</div>
                <div className="text-lg font-bold text-foreground mt-1">£{Math.round(monthlyFromEmail)}/mo</div>
              </div>
              <div className="kpi-card">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
                <div className="text-lg font-bold text-foreground mt-1">£{Math.round(totalMonthly)}/mo</div>
                <div className="text-xs text-muted-foreground mt-1">£{Math.round(totalMonthly * 12)}/yr</div>
              </div>
            </div>

            {(project.costs || []).length > 0 && (
              <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Cost</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Vendor</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Type</th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Monthly</th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.costs.map(cost => (
                      <tr key={cost.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3 text-sm text-foreground">{cost.cost_name}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{cost.vendor || '—'}</td>
                        <td className="px-5 py-3"><span className="text-xs capitalize bg-muted px-2 py-0.5 rounded text-muted-foreground">{cost.cost_type || 'other'}</span></td>
                        <td className="px-5 py-3 text-right text-sm text-foreground">£{Number(cost.monthly_cost_gbp || 0)}</td>
                        <td className="px-5 py-3 text-right text-sm text-muted-foreground">£{Number(cost.annual_cost_gbp || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
