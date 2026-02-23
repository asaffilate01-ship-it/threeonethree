import { motion } from 'framer-motion';
import { useProjectIntegrations } from '@/hooks/useProjectData';
import { CheckCircle2, XCircle, Puzzle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type IntegrationCategory = Database['public']['Enums']['integration_category'];

const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  payments: 'Payments',
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  auth: 'Auth',
  storage: 'Storage',
  analytics: 'Analytics',
  seo: 'SEO',
  maps: 'Maps',
  ai: 'AI',
  crm: 'CRM',
  telephony: 'Telephony',
  other: 'Other',
};

export default function Integrations() {
  const { data: projectIntegrations, isLoading } = useProjectIntegrations();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;
  }

  const allPI = projectIntegrations || [];
  
  // Group by integration
  const byIntegration: Record<string, { name: string; category: IntegrationCategory; vendor: string | null; items: typeof allPI }> = {};
  allPI.forEach(pi => {
    const int = (pi as any).integrations;
    if (!int) return;
    if (!byIntegration[int.id]) {
      byIntegration[int.id] = { name: int.name, category: int.category, vendor: int.vendor, items: [] };
    }
    byIntegration[int.id].items.push(pi);
  });

  // Group by category
  const byCategory: Record<string, typeof byIntegration[string][]> = {};
  Object.values(byIntegration).forEach(group => {
    const cat = group.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(group);
  });

  // Missing essentials: required but not configured
  const missingEssentials = allPI.filter(pi => pi.is_required && !pi.is_configured);

  const totalConfigured = allPI.filter(pi => pi.is_configured).length;
  const totalLive = allPI.filter(pi => pi.is_live).length;
  const totalRequired = allPI.filter(pi => pi.is_required).length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">Tech stack & API tracker across all projects</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Integrations</div>
          <div className="text-2xl font-bold text-foreground mt-1">{allPI.length}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Configured</div>
          <div className="text-2xl font-bold text-success mt-1">{totalConfigured}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Live</div>
          <div className="text-2xl font-bold text-foreground mt-1">{totalLive}</div>
        </div>
        <div className="kpi-card">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Missing Essentials</div>
          <div className="text-2xl font-bold text-destructive mt-1">{missingEssentials.length}</div>
          <div className="text-xs text-muted-foreground mt-1">of {totalRequired} required</div>
        </div>
      </div>

      {/* Missing Essentials Alert */}
      {missingEssentials.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 border-destructive/20">
          <h3 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
            <AlertTriangle size={14} /> Missing Essentials
          </h3>
          <div className="space-y-2">
            {missingEssentials.map(pi => (
              <div key={pi.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <div>
                  <span className="text-sm text-foreground">{(pi as any).integrations?.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">— {(pi as any).projects?.name}</span>
                </div>
                <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded font-medium">Not Configured</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* By Category */}
      {Object.entries(byCategory).sort().map(([category, groups]) => (
        <motion.div key={category} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Puzzle size={14} className="text-primary" />
            {CATEGORY_LABELS[category as IntegrationCategory] || category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map(group => (
              <div key={group.name} className="p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{group.name}</div>
                    {group.vendor && <div className="text-xs text-muted-foreground">{group.vendor}</div>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {group.items.map(pi => (
                    <div key={pi.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-mono">{(pi as any).projects?.code}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {pi.is_configured ? <CheckCircle2 size={12} className="text-success" /> : <XCircle size={12} className="text-muted-foreground" />}
                          <span className="text-muted-foreground">Conf</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {pi.is_live ? <CheckCircle2 size={12} className="text-success" /> : <XCircle size={12} className="text-muted-foreground" />}
                          <span className="text-muted-foreground">Live</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Empty state */}
      {allPI.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <Puzzle size={32} className="text-muted-foreground mx-auto mb-3" />
          <div className="text-sm text-muted-foreground">No integrations tracked yet. Add integrations to your projects to see them here.</div>
        </div>
      )}
    </div>
  );
}
