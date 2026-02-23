import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PROJECTS, TASKS, CHECKLIST_ITEMS } from '@/data/mockData';
import StageBadge from '@/components/badges/StageBadge';
import ReadinessBar from '@/components/badges/ReadinessBar';
import { ArrowLeft, ExternalLink, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PRIORITY_COLORS } from '@/types/project';

const TABS = ['Summary', 'Checklist', 'Tasks', 'Platforms', 'Costs'] as const;

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const project = PROJECTS.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Summary');

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

  const projectTasks = TASKS.filter(t => t.projectId === project.id);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
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
            </div>
            <p className="text-sm text-muted-foreground mt-1">{project.shortDescription}</p>
            {project.domain && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
                <ExternalLink size={12} />
                {project.domain}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Burn</div>
            <div className="text-xl font-bold text-foreground">
              {project.monthlyBurn > 0 ? `£${project.monthlyBurn}` : '—'}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-border/50">
          <div>
            <div className="text-xs text-muted-foreground">Industry</div>
            <div className="text-sm font-medium text-foreground mt-0.5">{project.industry}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Audience</div>
            <div className="text-sm font-medium text-foreground mt-0.5">{project.audience}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Revenue Model</div>
            <div className="text-sm font-medium text-foreground mt-0.5">{project.revenueModel}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Readiness</div>
            <div className="mt-1"><ReadinessBar percent={project.readinessPercent} size="md" /></div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/50">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'Summary' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Platforms</h3>
              <div className="space-y-2">
                {project.platforms.length > 0 ? project.platforms.map(p => (
                  <div key={p} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={14} className="text-success" />
                    <span className="text-foreground capitalize">{p.replace('_', ' ')}</span>
                  </div>
                )) : (
                  <span className="text-sm text-muted-foreground">No platforms defined</span>
                )}
              </div>
            </div>
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Surfaces</h3>
              <div className="space-y-2">
                {project.surfaces.length > 0 ? project.surfaces.map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={14} className="text-success" />
                    <span className="text-foreground capitalize">{s.replace(/_/g, ' ')}</span>
                  </div>
                )) : (
                  <span className="text-sm text-muted-foreground">No surfaces defined</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Checklist' && (
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Launch Readiness Checklist</h3>
              <span className="text-xs text-muted-foreground">{project.checklistDone}/{project.checklistTotal} complete</span>
            </div>
            <div className="space-y-1">
              {CHECKLIST_ITEMS.map((item, i) => {
                const isDone = i < project.checklistDone;
                return (
                  <div key={item.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    {isDone ? (
                      <CheckCircle2 size={16} className="text-success shrink-0" />
                    ) : (
                      <Circle size={16} className="text-muted-foreground shrink-0" />
                    )}
                    <span className={cn("text-sm", isDone ? "text-muted-foreground line-through" : "text-foreground")}>
                      {item.label}
                    </span>
                    {item.isCritical && !isDone && (
                      <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">Critical</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'Tasks' && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Tasks ({projectTasks.length})</h3>
            {projectTasks.length > 0 ? (
              <div className="space-y-2">
                {projectTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-3">
                      {task.status === 'blocked' && <AlertTriangle size={14} className="text-destructive" />}
                      <div>
                        <div className="text-sm font-medium text-foreground">{task.title}</div>
                        {task.blockedReason && <div className="text-xs text-destructive mt-0.5">{task.blockedReason}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-xs font-medium", PRIORITY_COLORS[task.priority])}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">No tasks yet</div>
            )}
          </div>
        )}

        {activeTab === 'Platforms' && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Platforms & Surfaces</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Platforms</h4>
                {project.platforms.length > 0 ? project.platforms.map(p => (
                  <div key={p} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm text-foreground capitalize">{p.replace('_', ' ')}</span>
                    <span className="text-xs bg-info/10 text-info px-2 py-0.5 rounded">Required</span>
                  </div>
                )) : <span className="text-sm text-muted-foreground">None defined</span>}
              </div>
              <div>
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Surfaces</h4>
                {project.surfaces.length > 0 ? project.surfaces.map(s => (
                  <div key={s} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm text-foreground capitalize">{s.replace(/_/g, ' ')}</span>
                    <span className="text-xs bg-info/10 text-info px-2 py-0.5 rounded">Required</span>
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
              <div className="text-3xl font-bold text-foreground">
                {project.monthlyBurn > 0 ? `£${project.monthlyBurn}` : '£0'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Estimated monthly burn</div>
              <div className="text-sm text-muted-foreground mt-4">
                {project.monthlyBurn > 0 ? `£${(project.monthlyBurn * 12).toLocaleString()} / year` : 'No costs recorded'}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
