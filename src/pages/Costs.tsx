import { motion } from 'framer-motion';
import { useProjectBurn, useCosts, useProjects } from '@/hooks/useProjectData';
import { PoundSterling, TrendingUp, AlertTriangle, Pause } from 'lucide-react';
import CreateCostModal from '@/components/modals/CreateCostModal';

export default function Costs() {
  const { data: burn, isLoading: burnLoading } = useProjectBurn();
  const { data: costs, isLoading: costsLoading } = useCosts();
  const { data: projects } = useProjects();

  if (burnLoading || costsLoading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;
  }

  const allBurn = (burn || []).sort((a, b) => Number(b.est_monthly_burn_gbp) - Number(a.est_monthly_burn_gbp));
  const totalMonthly = allBurn.reduce((s, b) => s + Number(b.est_monthly_burn_gbp || 0), 0);
  const activeBurn = allBurn.filter(b => Number(b.est_monthly_burn_gbp) > 0);
  const pausedProjects = (projects || []).filter(p => p.stage === 'paused');
  const pausedBurn = allBurn
    .filter(b => pausedProjects.some(pp => pp.id === b.id) && Number(b.est_monthly_burn_gbp) > 0);
  const pausedTotal = pausedBurn.reduce((s, b) => s + Number(b.est_monthly_burn_gbp || 0), 0);

  // Group costs by type
  const costsByType: Record<string, number> = {};
  (costs || []).forEach(c => {
    const t = c.cost_type || 'other';
    costsByType[t] = (costsByType[t] || 0) + Number(c.monthly_cost_gbp || 0);
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Cost Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Group Financial Exposure Monitor</p>
        </div>
        <CreateCostModal />
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <PoundSterling size={18} className="text-muted-foreground mb-2" />
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Burn</div>
          <div className="text-2xl font-bold text-foreground mt-1">£{Math.round(totalMonthly).toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <TrendingUp size={18} className="text-muted-foreground mb-2" />
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Annual Estimate</div>
          <div className="text-2xl font-bold text-foreground mt-1">£{Math.round(totalMonthly * 12).toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Active Spenders</div>
          <div className="text-2xl font-bold text-foreground mt-1">{activeBurn.length}</div>
          <div className="text-xs text-muted-foreground mt-1">of {allBurn.length} projects</div>
        </div>
        <div className="kpi-card">
          <Pause size={18} className="text-muted-foreground mb-2" />
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Waste (Paused)</div>
          <div className="text-2xl font-bold text-destructive mt-1">£{Math.round(pausedTotal).toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">{pausedBurn.length} paused but costing</div>
        </div>
      </div>

      {/* Cost by Type */}
      {Object.keys(costsByType).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Cost by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(costsByType).sort((a, b) => b[1] - a[1]).map(([type, amount]) => (
              <div key={type} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="text-xs text-muted-foreground uppercase tracking-wider capitalize">{type}</div>
                <div className="text-lg font-bold text-foreground mt-1">£{Math.round(amount).toLocaleString()}/mo</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Burn Breakdown by Project */}
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
            {activeBurn.map(b => {
              const monthly = Number(b.est_monthly_burn_gbp);
              const pct = totalMonthly > 0 ? Math.round((monthly / totalMonthly) * 100) : 0;
              const isPaused = pausedProjects.some(pp => pp.id === b.id);
              return (
                <tr key={b.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-foreground">{b.name}</div>
                      {isPaused && (
                        <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">PAUSED</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-medium text-foreground">£{Math.round(monthly).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-sm text-muted-foreground">£{Math.round(monthly * 12).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Detailed Cost Ledger */}
      {(costs || []).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">Cost Ledger</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Cost</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Project</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Vendor</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Monthly</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Annual</th>
              </tr>
            </thead>
            <tbody>
              {(costs || []).map(cost => (
                <tr key={cost.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm text-foreground">{cost.cost_name}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{(cost as any).projects?.code}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{cost.vendor || '—'}</td>
                  <td className="px-5 py-3"><span className="text-xs capitalize bg-muted px-2 py-0.5 rounded text-muted-foreground">{cost.cost_type || 'other'}</span></td>
                  <td className="px-5 py-3 text-right text-sm text-foreground">£{Number(cost.monthly_cost_gbp || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-sm text-muted-foreground">£{Number(cost.annual_cost_gbp || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
