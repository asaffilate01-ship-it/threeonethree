import { motion } from 'framer-motion';
import { PROJECTS } from '@/data/mockData';

export default function Costs() {
  const totalMonthly = PROJECTS.reduce((s, p) => s + p.monthlyBurn, 0);
  const activeProjects = PROJECTS.filter(p => p.monthlyBurn > 0).sort((a, b) => b.monthlyBurn - a.monthlyBurn);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Costs</h1>
        <p className="text-sm text-muted-foreground mt-1">Portfolio cost overview</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="kpi-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Burn</div>
          <div className="text-2xl font-bold text-foreground mt-1">£{totalMonthly.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Annual Estimate</div>
          <div className="text-2xl font-bold text-foreground mt-1">£{(totalMonthly * 12).toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Active Spenders</div>
          <div className="text-2xl font-bold text-foreground mt-1">{activeProjects.length}</div>
          <div className="text-xs text-muted-foreground mt-1">of {PROJECTS.length} projects</div>
        </div>
      </div>

      {/* Breakdown */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Project</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Monthly</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Annual</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {activeProjects.map(project => (
              <tr key={project.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3">
                  <div className="text-sm font-medium text-foreground">{project.name}</div>
                  <div className="text-xs text-muted-foreground">{project.industry}</div>
                </td>
                <td className="px-5 py-3 text-right text-sm font-medium text-foreground">£{project.monthlyBurn}</td>
                <td className="px-5 py-3 text-right text-sm text-muted-foreground">£{(project.monthlyBurn * 12).toLocaleString()}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(project.monthlyBurn / totalMonthly) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {Math.round((project.monthlyBurn / totalMonthly) * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
