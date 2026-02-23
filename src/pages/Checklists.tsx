import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProjects, useLaunchReadiness, useProjectWithRelations } from '@/hooks/useProjectData';
import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import ReadinessBar from '@/components/badges/ReadinessBar';
import StageBadge from '@/components/badges/StageBadge';
import { ClipboardList, CheckCircle2, Circle, ArrowRight, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type ProjectStage = Database['public']['Enums']['project_stage'];

function useAllChecklistItems() {
  return useQuery({
    queryKey: ['all-checklist-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_checklist_items')
        .select('*, checklist_template_items(*), projects:project_id(id, name, code, stage)')
        .order('is_done', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export default function Checklists() {
  const { data: readiness, isLoading: rLoading } = useLaunchReadiness();
  const { data: checklistItems, isLoading: cLoading } = useAllChecklistItems();
  const [search, setSearch] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'pending' | 'done' | 'critical'>('all');

  const isLoading = rLoading || cLoading;

  // Group by project
  const byProject = useMemo(() => {
    const map: Record<string, {
      projectId: string;
      projectName: string;
      projectCode: string;
      projectStage: ProjectStage;
      items: typeof checklistItems;
      doneCount: number;
      totalCount: number;
      percent: number;
    }> = {};

    (checklistItems || []).forEach(item => {
      const proj = (item as any).projects;
      if (!proj) return;
      const label = item.checklist_template_items?.label || '';
      const matchSearch = !search || label.toLowerCase().includes(search.toLowerCase()) || proj.name.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return;

      if (filter === 'pending' && item.is_done) return;
      if (filter === 'done' && !item.is_done) return;
      if (filter === 'critical' && !item.checklist_template_items?.is_critical) return;

      if (!map[proj.id]) {
        map[proj.id] = {
          projectId: proj.id,
          projectName: proj.name,
          projectCode: proj.code,
          projectStage: proj.stage,
          items: [],
          doneCount: 0,
          totalCount: 0,
          percent: 0,
        };
      }
      map[proj.id].items!.push(item);
      map[proj.id].totalCount++;
      if (item.is_done) map[proj.id].doneCount++;
    });

    Object.values(map).forEach(p => {
      p.percent = p.totalCount > 0 ? Math.round((p.doneCount / p.totalCount) * 100) : 0;
    });

    return Object.values(map).sort((a, b) => a.percent - b.percent);
  }, [checklistItems, search, filter]);

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Portfolio totals
  const totalItems = (checklistItems || []).length;
  const doneItems = (checklistItems || []).filter(i => i.is_done).length;
  const criticalPending = (checklistItems || []).filter(i => !i.is_done && i.checklist_template_items?.is_critical).length;
  const overallPercent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Checklists</h1>
        <p className="text-sm text-muted-foreground mt-1">Launch readiness across all projects</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <ClipboardList size={18} className="text-muted-foreground mb-2" />
          <div className="text-2xl font-bold text-foreground">{overallPercent}%</div>
          <div className="text-xs text-muted-foreground">Portfolio Readiness</div>
        </div>
        <div className="kpi-card">
          <div className="text-2xl font-bold text-success">{doneItems}</div>
          <div className="text-xs text-muted-foreground">Completed Items</div>
        </div>
        <div className="kpi-card">
          <div className="text-2xl font-bold text-foreground">{totalItems - doneItems}</div>
          <div className="text-xs text-muted-foreground">Pending Items</div>
        </div>
        <div className="kpi-card">
          <div className="text-2xl font-bold text-destructive">{criticalPending}</div>
          <div className="text-xs text-muted-foreground">Critical Pending</div>
        </div>
      </div>

      {/* Portfolio readiness bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Overall Portfolio Readiness</h3>
          <span className="text-sm text-muted-foreground">{doneItems}/{totalItems}</span>
        </div>
        <ReadinessBar percent={overallPercent} size="md" />
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 flex-1 max-w-sm border border-border/50">
          <Search size={14} className="text-muted-foreground" />
          <input type="text" placeholder="Search checklist items…" value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'pending', 'done', 'critical'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize", filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Per-Project Checklists */}
      <div className="space-y-3">
        {byProject.map(proj => {
          const isExpanded = expandedProjects.has(proj.projectId);
          // Group items by category
          const byCategory: Record<string, any[]> = {};
          (proj.items || []).forEach(item => {
            const cat = item.checklist_template_items?.category || 'General';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(item);
          });

          return (
            <motion.div key={proj.projectId} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl overflow-hidden">
              <button onClick={() => toggleProject(proj.projectId)} className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
                  <div className="text-left">
                    <div className="text-sm font-semibold text-foreground">{proj.projectName}</div>
                    <div className="text-xs text-muted-foreground">{proj.doneCount}/{proj.totalCount} items</div>
                  </div>
                  <StageBadge stage={proj.projectStage} />
                </div>
                <div className="flex items-center gap-4">
                  <ReadinessBar percent={proj.percent} />
                  <Link to={`/projects/${proj.projectId}`} onClick={e => e.stopPropagation()} className="text-xs text-primary hover:underline flex items-center gap-1">
                    View <ArrowRight size={10} />
                  </Link>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 space-y-4 border-t border-border/30">
                  {Object.entries(byCategory).map(([category, items]) => (
                    <div key={category} className="pt-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 capitalize">{category}</h4>
                      <div className="space-y-0.5">
                        {items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-muted/20 transition-colors">
                            {item.is_done
                              ? <CheckCircle2 size={14} className="text-success shrink-0" />
                              : <Circle size={14} className="text-muted-foreground shrink-0" />
                            }
                            <span className={cn("text-sm flex-1", item.is_done ? "text-muted-foreground line-through" : "text-foreground")}>
                              {item.checklist_template_items?.label}
                            </span>
                            {item.checklist_template_items?.is_critical && !item.is_done && (
                              <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">Critical</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {byProject.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <ClipboardList size={32} className="text-muted-foreground mx-auto mb-3" />
          <div className="text-sm text-muted-foreground">No checklist items found matching your filters.</div>
        </div>
      )}
    </div>
  );
}
