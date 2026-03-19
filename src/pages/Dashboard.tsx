import { motion } from 'framer-motion';
import { useProjects, useTasks, useLaunchReadiness, useProjectBurn, useDomains } from '@/hooks/useProjectData';
import KpiCard from '@/components/cards/KpiCard';
import LiveIssueFeed from '@/components/feeds/LiveIssueFeed';
import StageBadge from '@/components/badges/StageBadge';
import ReadinessBar from '@/components/badges/ReadinessBar';
import { Link } from 'react-router-dom';
import {
  FolderKanban, Rocket, PoundSterling, Globe, ListTodo,
  AlertTriangle, ArrowRight, TrendingUp, Calendar
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ProjectStage = Database['public']['Enums']['project_stage'];

const STAGE_ORDER: ProjectStage[] = ['live', 'scaling', 'soft_launch', 'beta', 'testing', 'basic_build', 'started', 'inception', 'idea', 'paused'];

export default function Dashboard() {
  const { data: projects, isLoading: projLoading } = useProjects();
  const { data: tasks, isLoading: taskLoading } = useTasks();
  const { data: readiness } = useLaunchReadiness();
  const { data: burn } = useProjectBurn();
  const { data: domains } = useDomains();

  if (projLoading || taskLoading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;
  }

  const allProjects = projects || [];
  const allTasks = tasks || [];

  const totalProjects = allProjects.length;
  const liveProjects = allProjects.filter(p => ['live', 'scaling'].includes(p.stage)).length;
  const buildProjects = allProjects.filter(p => ['started', 'basic_build', 'testing', 'beta', 'soft_launch'].includes(p.stage)).length;
  const ideaProjects = allProjects.filter(p => ['idea', 'inception'].includes(p.stage)).length;
  const pausedProjects = allProjects.filter(p => p.stage === 'paused').length;
  const blockedTasks = allTasks.filter(t => t.status === 'blocked');
  const inProgressTasks = allTasks.filter(t => t.status === 'in_progress');

  const totalMonthlyBurn = (burn || []).reduce((s, b) => s + Number(b.est_monthly_burn_gbp || 0), 0);

  // Stage breakdown
  const stageCounts: Record<string, number> = {};
  allProjects.forEach(p => { stageCounts[p.stage] = (stageCounts[p.stage] || 0) + 1; });

  const closestToLaunch = (readiness || [])
    .filter(r => Number(r.readiness_percent) > 0)
    .sort((a, b) => Number(b.readiness_percent) - Number(a.readiness_percent))
    .slice(0, 6);

  // Domain renewals coming up
  const upcomingRenewals = (domains || [])
    .filter(d => d.renew_date)
    .sort((a, b) => new Date(a.renew_date!).getTime() - new Date(b.renew_date!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Portfolio Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">{totalProjects} projects · Digital Asset Control Tower</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Projects" value={totalProjects} subtitle={`${buildProjects} building · ${ideaProjects} ideas`} icon={<FolderKanban size={18} />} />
        <KpiCard label="Live" value={liveProjects} subtitle={`${pausedProjects} paused`} icon={<Rocket size={18} />} />
        <KpiCard label="Monthly Burn" value={`£${Math.round(totalMonthlyBurn).toLocaleString()}`} subtitle={`£${Math.round(totalMonthlyBurn * 12).toLocaleString()} annual`} icon={<PoundSterling size={18} />} />
        <KpiCard label="In Progress" value={inProgressTasks.length} subtitle={`${blockedTasks.length} blocked`} icon={<ListTodo size={18} />} />
        <KpiCard label="Domains" value={(domains || []).length} subtitle={`${upcomingRenewals.length} upcoming renewals`} icon={<Globe size={18} />} />
      </div>

      {/* Stage Breakdown */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Stage Breakdown</h2>
        <div className="flex items-end gap-3">
          {STAGE_ORDER.filter(s => stageCounts[s]).map(stage => (
            <div key={stage} className="flex-1 text-center">
              <div className="text-lg font-bold text-foreground">{stageCounts[stage]}</div>
              <div className="h-2 rounded-full bg-muted mt-1 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(stageCounts[stage] / totalProjects) * 100}%`, backgroundColor: `hsl(var(--stage-${stage.replace('_', '-')}))` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5 capitalize">{stage.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Live Issue Feed */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Live Issues Feed</h2>
          <Link to="/qa" className="text-xs text-primary hover:underline flex items-center gap-1">QA Dashboard <ArrowRight size={12} /></Link>
        </div>
        <LiveIssueFeed />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Launch Readiness */}
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

        {/* Alerts & Blockers */}
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
            {upcomingRenewals.map(d => (
              <div key={d.id} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-warning/5 border border-warning/10">
                <Calendar size={14} className="text-warning mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm text-foreground">{d.domain_name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Renews {d.renew_date}</div>
                </div>
              </div>
            ))}
            {blockedTasks.length === 0 && upcomingRenewals.length === 0 && (
              <div className="text-sm text-muted-foreground py-4 text-center">No blockers — everything looks good ✓</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Burn by Project */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Monthly Burn by Project</h2>
          <Link to="/costs" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(burn || [])
            .filter(b => Number(b.est_monthly_burn_gbp) > 0)
            .sort((a, b) => Number(b.est_monthly_burn_gbp) - Number(a.est_monthly_burn_gbp))
            .slice(0, 6)
            .map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <span className="text-sm font-medium text-foreground">{b.name}</span>
                <span className="text-sm font-bold text-foreground">£{Math.round(Number(b.est_monthly_burn_gbp)).toLocaleString()}</span>
              </div>
            ))}
        </div>
      </motion.div>

      {/* In Progress Tasks */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">In Progress Tasks ({inProgressTasks.length})</h2>
          <Link to="/tasks" className="text-xs text-primary hover:underline flex items-center gap-1">All tasks <ArrowRight size={12} /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {inProgressTasks.map(task => (
            <div key={task.id} className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors">
              <div className="text-sm font-medium text-foreground">{task.title}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground font-mono">{(task as any).projects?.code}</span>
                {task.due_date && <span className="text-xs text-muted-foreground">· Due {task.due_date}</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
