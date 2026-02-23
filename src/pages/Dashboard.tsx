import { motion } from 'framer-motion';
import { useProjects, useTasks, useLaunchReadiness } from '@/hooks/useProjectData';
import KpiCard from '@/components/cards/KpiCard';
import StageBadge from '@/components/badges/StageBadge';
import ReadinessBar from '@/components/badges/ReadinessBar';
import { Link } from 'react-router-dom';
import {
  FolderKanban, Rocket, PoundSterling, Globe,
  AlertTriangle, ArrowRight
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ProjectStage = Database['public']['Enums']['project_stage'];

export default function Dashboard() {
  const { data: projects, isLoading: projLoading } = useProjects();
  const { data: tasks, isLoading: taskLoading } = useTasks();
  const { data: readiness } = useLaunchReadiness();

  if (projLoading || taskLoading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;
  }

  const allProjects = projects || [];
  const allTasks = tasks || [];

  const totalProjects = allProjects.length;
  const liveProjects = allProjects.filter(p => ['live', 'scaling'].includes(p.stage)).length;
  const buildProjects = allProjects.filter(p => ['started', 'basic_build', 'testing', 'beta'].includes(p.stage)).length;
  const ideaProjects = allProjects.filter(p => ['idea', 'inception'].includes(p.stage)).length;
  const domainsCount = allProjects.filter(p => p.code).length; // Will be replaced with actual domains count
  const blockedTasks = allTasks.filter(t => t.status === 'blocked');
  const inProgressTasks = allTasks.filter(t => t.status === 'in_progress');

  const closestToLaunch = (readiness || [])
    .filter(r => Number(r.readiness_percent) > 0)
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Portfolio Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">{totalProjects} projects across your portfolio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Projects" value={totalProjects} subtitle={`${buildProjects} building · ${ideaProjects} ideas`} icon={<FolderKanban size={18} />} />
        <KpiCard label="Live" value={liveProjects} subtitle={`${allProjects.filter(p => p.stage === 'paused').length} paused`} icon={<Rocket size={18} />} />
        <KpiCard label="In Progress Tasks" value={inProgressTasks.length} subtitle={`${blockedTasks.length} blocked`} icon={<PoundSterling size={18} />} />
        <KpiCard label="Total Tasks" value={allTasks.length} icon={<Globe size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Launch Readiness</h2>
            <Link to="/projects" className="text-xs text-primary hover:underline flex items-center gap-1">All projects <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-3">
            {closestToLaunch.map((r, i) => (
              <Link key={r.id} to={`/projects/${r.id}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{Number(r.done_items)}/{Number(r.total_items)} items</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StageBadge stage={r.stage as ProjectStage} />
                  <ReadinessBar percent={Number(r.readiness_percent)} />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Alerts & Blockers</h2>
          <div className="space-y-2">
            {blockedTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm text-foreground">{task.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{(task as any).projects?.code} · {task.blocked_reason}</div>
                </div>
              </div>
            ))}
            {blockedTasks.length === 0 && (
              <div className="text-sm text-muted-foreground py-4 text-center">No blockers — everything looks good ✓</div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">In Progress Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {inProgressTasks.map(task => (
            <div key={task.id} className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors">
              <div className="text-sm font-medium text-foreground">{task.title}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground font-mono">{(task as any).projects?.code}</span>
                {task.due_date && <span className="text-xs text-muted-foreground">· {task.due_date}</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
