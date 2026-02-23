import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProjectWithRelations } from '@/hooks/useProjectData';
import StageBadge from '@/components/badges/StageBadge';
import ReadinessBar from '@/components/badges/ReadinessBar';
import { ArrowLeft, ExternalLink, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const TABS = ['Summary', 'Checklist', 'Tasks', 'Platforms', 'Costs'] as const;

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-info',
  high: 'text-warning',
  critical: 'text-destructive',
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProjectWithRelations(id || '');
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

  return (
    <div className="space-y-6 max-w-5xl">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Projects
      </Link>

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
        </div>

        <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-border/50">
          <div><div className="text-xs text-muted-foreground">Industry</div><div className="text-sm font-medium text-foreground mt-0.5">{project.industry}</div></div>
          <div><div className="text-xs text-muted-foreground">Audience</div><div className="text-sm font-medium text-foreground mt-0.5">{project.audience}</div></div>
          <div><div className="text-xs text-muted-foreground">Revenue Model</div><div className="text-sm font-medium text-foreground mt-0.5">{project.revenue_model}</div></div>
          <div><div className="text-xs text-muted-foreground">Readiness</div><div className="mt-1"><ReadinessBar percent={readinessPercent} size="md" /></div></div>
        </div>
      </motion.div>

      <div className="flex items-center gap-1 border-b border-border/50">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px", activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {tab}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'Summary' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Platforms</h3>
              <div className="space-y-2">
                {(project.project_platforms || []).length > 0 ? project.project_platforms.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={14} className={p.is_built ? "text-success" : "text-muted-foreground"} />
                    <span className="text-foreground capitalize">{p.platform.replace(/_/g, ' ')}</span>
                    {p.notes && <span className="text-xs text-muted-foreground">— {p.notes}</span>}
                  </div>
                )) : <span className="text-sm text-muted-foreground">No platforms defined</span>}
              </div>
            </div>
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Surfaces</h3>
              <div className="space-y-2">
                {(project.project_surfaces || []).length > 0 ? project.project_surfaces.map(s => (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={14} className={s.is_built ? "text-success" : "text-muted-foreground"} />
                    <span className="text-foreground capitalize">{s.surface.replace(/_/g, ' ')}</span>
                  </div>
                )) : <span className="text-sm text-muted-foreground">No surfaces defined</span>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Checklist' && (
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Launch Readiness Checklist</h3>
              <span className="text-xs text-muted-foreground">{doneCount}/{totalCount} complete</span>
            </div>
            <div className="space-y-1">
              {checklistItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                  {item.is_done ? <CheckCircle2 size={16} className="text-success shrink-0" /> : <Circle size={16} className="text-muted-foreground shrink-0" />}
                  <span className={cn("text-sm", item.is_done ? "text-muted-foreground line-through" : "text-foreground")}>
                    {item.checklist_template_items?.label}
                  </span>
                  {item.checklist_template_items?.is_critical && !item.is_done && (
                    <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">Critical</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-xs font-medium", PRIORITY_COLORS[task.priority])}>{task.priority}</span>
                      <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded">{task.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-sm text-muted-foreground text-center py-8">No tasks yet</div>}
          </div>
        )}

        {activeTab === 'Platforms' && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Platforms & Surfaces</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Platforms</h4>
                {(project.project_platforms || []).length > 0 ? project.project_platforms.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm text-foreground capitalize">{p.platform.replace(/_/g, ' ')}</span>
                    <div className="flex gap-2">
                      {p.is_required && <span className="text-xs bg-info/10 text-info px-2 py-0.5 rounded">Required</span>}
                      {p.is_built && <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">Built</span>}
                    </div>
                  </div>
                )) : <span className="text-sm text-muted-foreground">None defined</span>}
              </div>
              <div>
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Surfaces</h4>
                {(project.project_surfaces || []).length > 0 ? project.project_surfaces.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm text-foreground capitalize">{s.surface.replace(/_/g, ' ')}</span>
                    <div className="flex gap-2">
                      {s.is_required && <span className="text-xs bg-info/10 text-info px-2 py-0.5 rounded">Required</span>}
                      {s.is_built && <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">Built</span>}
                    </div>
                  </div>
                )) : <span className="text-sm text-muted-foreground">None defined</span>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Costs' && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Cost Summary</h3>
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground">Cost tracking will be populated from the costs table</div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
