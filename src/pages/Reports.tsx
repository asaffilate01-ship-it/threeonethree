import { motion } from 'framer-motion';
import { useProjects, useTasks, useLaunchReadiness, useProjectBurn, useCosts } from '@/hooks/useProjectData';
import { BarChart3, PieChart, TrendingUp, PoundSterling } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend } from 'recharts';
import type { Database } from '@/integrations/supabase/types';

type ProjectStage = Database['public']['Enums']['project_stage'];

const STAGE_CHART_COLORS: Record<string, string> = {
  idea: '#8b5cf6',
  inception: '#a855f7',
  started: '#3b82f6',
  basic_build: '#06b6d4',
  testing: '#f59e0b',
  beta: '#f97316',
  soft_launch: '#22c55e',
  live: '#16a34a',
  scaling: '#0d9488',
  paused: '#6b7280',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#6b7280',
  medium: '#06b6d4',
  high: '#f59e0b',
  critical: '#ef4444',
};

export default function Reports() {
  const { data: projects } = useProjects();
  const { data: tasks } = useTasks();
  const { data: readiness } = useLaunchReadiness();
  const { data: burn } = useProjectBurn();
  const { data: costs } = useCosts();

  const allProjects = projects || [];
  const allTasks = tasks || [];

  // Stage distribution for pie chart
  const stageCounts: Record<string, number> = {};
  allProjects.forEach(p => { stageCounts[p.stage] = (stageCounts[p.stage] || 0) + 1; });
  const stageData = Object.entries(stageCounts).map(([stage, count]) => ({
    name: stage.replace(/_/g, ' '),
    value: count,
    fill: STAGE_CHART_COLORS[stage] || '#6b7280',
  }));

  // Task status distribution
  const taskStatusCounts: Record<string, number> = {};
  allTasks.forEach(t => { taskStatusCounts[t.status] = (taskStatusCounts[t.status] || 0) + 1; });
  const taskStatusData = Object.entries(taskStatusCounts).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    count,
  }));

  // Task priority distribution
  const taskPriorityCounts: Record<string, number> = {};
  allTasks.forEach(t => { taskPriorityCounts[t.priority] = (taskPriorityCounts[t.priority] || 0) + 1; });
  const priorityData = Object.entries(taskPriorityCounts).map(([priority, count]) => ({
    name: priority,
    value: count,
    fill: PRIORITY_COLORS[priority] || '#6b7280',
  }));

  // Burn by project (bar chart)
  const burnData = (burn || [])
    .filter(b => Number(b.est_monthly_burn_gbp) > 0)
    .sort((a, b) => Number(b.est_monthly_burn_gbp) - Number(a.est_monthly_burn_gbp))
    .slice(0, 10)
    .map(b => ({
      name: b.name || '',
      burn: Math.round(Number(b.est_monthly_burn_gbp)),
    }));

  // Cost by type
  const costsByType: Record<string, number> = {};
  (costs || []).forEach(c => {
    const t = c.cost_type || 'other';
    costsByType[t] = (costsByType[t] || 0) + Number(c.monthly_cost_gbp || 0);
  });
  const costTypeData = Object.entries(costsByType)
    .map(([type, amount]) => ({ name: type, value: Math.round(amount) }))
    .sort((a, b) => b.value - a.value);

  // Readiness ranking
  const readinessData = (readiness || [])
    .filter(r => Number(r.total_items) > 0)
    .sort((a, b) => Number(b.readiness_percent) - Number(a.readiness_percent))
    .slice(0, 10)
    .map(r => ({
      name: r.name || '',
      readiness: Number(r.readiness_percent),
    }));

  const totalMonthlyBurn = (burn || []).reduce((s, b) => s + Number(b.est_monthly_burn_gbp || 0), 0);

  const chartTooltipStyle = {
    contentStyle: {
      background: 'hsl(222, 41%, 9%)',
      border: '1px solid hsl(215, 20%, 16%)',
      borderRadius: '8px',
      fontSize: '12px',
      color: 'hsl(210, 40%, 96%)',
    },
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Portfolio analytics and insights</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <BarChart3 size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">{allProjects.length}</div>
          <div className="text-xs text-muted-foreground">Total Projects</div>
        </div>
        <div className="kpi-card">
          <div className="text-2xl font-bold text-foreground">{allTasks.length}</div>
          <div className="text-xs text-muted-foreground">Total Tasks</div>
        </div>
        <div className="kpi-card">
          <PoundSterling size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">£{Math.round(totalMonthlyBurn).toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Monthly Burn</div>
        </div>
        <div className="kpi-card">
          <TrendingUp size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">£{Math.round(totalMonthlyBurn * 12).toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Annual Projection</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Projects by Stage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={stageData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {stageData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Task Priority Distribution */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Tasks by Priority</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={priorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Task Status Bar Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Tasks by Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215, 16%, 52%)', fontSize: 11 }} axisLine={{ stroke: 'hsl(215, 20%, 16%)' }} />
              <YAxis tick={{ fill: 'hsl(215, 16%, 52%)', fontSize: 11 }} axisLine={{ stroke: 'hsl(215, 20%, 16%)' }} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Burn by Project */}
      {burnData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Burn by Project (Top 10)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={burnData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
                <XAxis type="number" tick={{ fill: 'hsl(215, 16%, 52%)', fontSize: 11 }} axisLine={{ stroke: 'hsl(215, 20%, 16%)' }} tickFormatter={v => `£${v}`} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: 'hsl(215, 16%, 52%)', fontSize: 11 }} axisLine={{ stroke: 'hsl(215, 20%, 16%)' }} />
                <Tooltip {...chartTooltipStyle} formatter={(value: number) => [`£${value}`, 'Monthly Burn']} />
                <Bar dataKey="burn" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Launch Readiness Ranking */}
      {readinessData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Launch Readiness Ranking</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readinessData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 16%)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(215, 16%, 52%)', fontSize: 11 }} axisLine={{ stroke: 'hsl(215, 20%, 16%)' }} tickFormatter={v => `${v}%`} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: 'hsl(215, 16%, 52%)', fontSize: 11 }} axisLine={{ stroke: 'hsl(215, 20%, 16%)' }} />
                <Tooltip {...chartTooltipStyle} formatter={(value: number) => [`${value}%`, 'Readiness']} />
                <Bar dataKey="readiness" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Cost by Type */}
      {costTypeData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Costs by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {costTypeData.map(ct => (
              <div key={ct.name} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="text-xs text-muted-foreground uppercase tracking-wider capitalize">{ct.name}</div>
                <div className="text-lg font-bold text-foreground mt-1">£{ct.value.toLocaleString()}/mo</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
