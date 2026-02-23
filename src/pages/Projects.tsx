import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProjects, useLaunchReadiness } from '@/hooks/useProjectData';
import StageBadge from '@/components/badges/StageBadge';
import ReadinessBar from '@/components/badges/ReadinessBar';
import { Search, Filter } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ProjectStage = Database['public']['Enums']['project_stage'];

const STAGE_FILTERS: { label: string; value: ProjectStage | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Idea', value: 'idea' },
  { label: 'Inception', value: 'inception' },
  { label: 'Started', value: 'started' },
  { label: 'Testing', value: 'testing' },
  { label: 'Live', value: 'live' },
  { label: 'Paused', value: 'paused' },
];

export default function Projects() {
  const { data: projects, isLoading } = useProjects();
  const { data: readiness } = useLaunchReadiness();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<ProjectStage | 'all'>('all');

  const readinessMap = useMemo(() => {
    const map: Record<string, { percent: number; done: number; total: number }> = {};
    (readiness || []).forEach(r => {
      map[r.id!] = { percent: Number(r.readiness_percent), done: Number(r.done_items), total: Number(r.total_items) };
    });
    return map;
  }, [readiness]);

  const filtered = useMemo(() => {
    return (projects || []).filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        (p.industry || '').toLowerCase().includes(search.toLowerCase());
      const matchStage = stageFilter === 'all' || p.stage === stageFilter;
      return matchSearch && matchStage;
    });
  }, [projects, search, stageFilter]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{(projects || []).length} projects in portfolio</p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 flex-1 max-w-sm border border-border/50">
          <Search size={14} className="text-muted-foreground" />
          <input type="text" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-muted-foreground" />
          {STAGE_FILTERS.map(f => (
            <button key={f.value} onClick={() => setStageFilter(f.value)} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${stageFilter === f.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Project</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Industry</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Stage</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Readiness</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Audience</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project, i) => {
              const r = readinessMap[project.id] || { percent: 0, done: 0, total: 0 };
              return (
                <motion.tr key={project.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
                  <td className="px-5 py-3.5">
                    <Link to={`/projects/${project.id}`} className="block">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{project.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{project.short_description}</div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-xs text-muted-foreground">{project.industry}</span></td>
                  <td className="px-5 py-3.5"><StageBadge stage={project.stage} /></td>
                  <td className="px-5 py-3.5"><ReadinessBar percent={r.percent} /></td>
                  <td className="px-5 py-3.5"><span className="text-xs text-muted-foreground">{project.audience}</span></td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
