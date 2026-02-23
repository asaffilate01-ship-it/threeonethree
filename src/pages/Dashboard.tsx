import { motion } from 'framer-motion';
import { PROJECTS, TASKS } from '@/data/mockData';
import KpiCard from '@/components/cards/KpiCard';
import StageBadge from '@/components/badges/StageBadge';
import ReadinessBar from '@/components/badges/ReadinessBar';
import { Link } from 'react-router-dom';
import {
  FolderKanban, Rocket, PoundSterling, Globe,
  AlertTriangle, ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const totalProjects = PROJECTS.length;
  const liveProjects = PROJECTS.filter(p => ['live', 'scaling'].includes(p.stage)).length;
  const buildProjects = PROJECTS.filter(p => ['started', 'basic_build', 'testing', 'beta'].includes(p.stage)).length;
  const ideaProjects = PROJECTS.filter(p => ['idea', 'inception'].includes(p.stage)).length;
  const totalBurn = PROJECTS.reduce((sum, p) => sum + p.monthlyBurn, 0);
  const overdueTasks = TASKS.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');
  const blockedTasks = TASKS.filter(t => t.status === 'blocked');

  // Top 5 closest to launch
  const closestToLaunch = [...PROJECTS]
    .filter(p => p.readinessPercent > 0)
    .sort((a, b) => b.readinessPercent - a.readinessPercent)
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Portfolio Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">18 projects across 10 industries</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Projects"
          value={totalProjects}
          subtitle={`${buildProjects} building · ${ideaProjects} ideas`}
          icon={<FolderKanban size={18} />}
        />
        <KpiCard
          label="Live"
          value={liveProjects}
          subtitle={`${PROJECTS.filter(p => p.stage === 'paused').length} paused`}
          icon={<Rocket size={18} />}
        />
        <KpiCard
          label="Monthly Burn"
          value={`£${totalBurn.toLocaleString()}`}
          subtitle="Across all active projects"
          icon={<PoundSterling size={18} />}
        />
        <KpiCard
          label="Domains"
          value={PROJECTS.filter(p => p.domain).length}
          subtitle="5 registered"
          icon={<Globe size={18} />}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Launch Readiness */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Launch Readiness</h2>
            <Link to="/projects" className="text-xs text-primary hover:underline flex items-center gap-1">
              All projects <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {closestToLaunch.map((project, i) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{project.checklistDone}/{project.checklistTotal} items</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StageBadge stage={project.stage} />
                  <ReadinessBar percent={project.readinessPercent} />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Alerts & Blocked */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">Alerts & Blockers</h2>
          <div className="space-y-2">
            {blockedTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm text-foreground">{task.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {task.projectCode} · {task.blockedReason}
                  </div>
                </div>
              </div>
            ))}
            {overdueTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-warning/5 border border-warning/10">
                <AlertTriangle size={14} className="text-warning mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm text-foreground">{task.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {task.projectCode} · Due {task.dueDate}
                  </div>
                </div>
              </div>
            ))}
            {blockedTasks.length === 0 && overdueTasks.length === 0 && (
              <div className="text-sm text-muted-foreground py-4 text-center">No alerts — everything looks good ✓</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Active Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-xl p-5"
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">In Progress Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TASKS.filter(t => t.status === 'in_progress').map(task => (
            <div key={task.id} className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors">
              <div className="text-sm font-medium text-foreground">{task.title}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground font-mono">{task.projectCode}</span>
                {task.dueDate && <span className="text-xs text-muted-foreground">· {task.dueDate}</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
