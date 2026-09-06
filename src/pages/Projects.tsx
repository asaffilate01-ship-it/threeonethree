import { useCallback, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProjects, useLaunchReadiness, useMyProjectMemberships, useMyProfile } from '@/hooks/useProjectData';
import StageBadge from '@/components/badges/StageBadge';
import ReadinessBar from '@/components/badges/ReadinessBar';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import EditProjectModal from '@/components/modals/EditProjectModal';
import { Search, Filter, Pencil, Trash2, MoreHorizontal, Users, Clock, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Database, Tables } from '@/integrations/supabase/types';

type ProjectStage = Database['public']['Enums']['project_stage'];
type Project = Tables<'projects'>;
type OwnershipFilter = 'all' | 'mine' | 'shared';

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
  const { data: memberships } = useMyProjectMemberships();
  const { data: profile } = useMyProfile();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<ProjectStage | 'all'>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('all');
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  const memberProjectIds = useMemo(() => new Set((memberships || []).map(m => m.project_id)), [memberships]);
  const myDisplayName = profile?.display_name || '';

  const readinessMap = useMemo(() => {
    const map: Record<string, { percent: number; done: number; total: number }> = {};
    (readiness || []).forEach(r => {
      map[r.id!] = { percent: Number(r.readiness_percent), done: Number(r.done_items), total: Number(r.total_items) };
    });
    return map;
  }, [readiness]);

  const isProjectOwned = useCallback((project: Project) => project.owner === myDisplayName, [myDisplayName]);
  const isProjectShared = useCallback((project: Project) => memberProjectIds.has(project.id) && !isProjectOwned(project), [isProjectOwned, memberProjectIds]);

  const filtered = useMemo(() => {
    return (projects || []).filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        (p.industry || '').toLowerCase().includes(search.toLowerCase());
      const matchStage = stageFilter === 'all' || p.stage === stageFilter;
      const matchOwnership = ownershipFilter === 'all' ||
        (ownershipFilter === 'mine' && isProjectOwned(p)) ||
        (ownershipFilter === 'shared' && isProjectShared(p));
      return matchSearch && matchStage && matchOwnership;
    });
  }, [projects, search, stageFilter, ownershipFilter, isProjectOwned, isProjectShared]);

  const sharedCount = useMemo(() => (projects || []).filter(p => isProjectShared(p)).length, [projects, isProjectShared]);
  const ownedCount = useMemo(() => (projects || []).filter(p => isProjectOwned(p)).length, [projects, isProjectOwned]);

  const handleDelete = async () => {
    if (!deleteProject) return;
    setDeleting(true);
    const { error } = await supabase.from('projects').delete().eq('id', deleteProject.id);
    setDeleting(false);
    if (error) {
      toast.error('Failed to delete: ' + error.message);
      return;
    }
    toast.success(`${deleteProject.name} deleted`);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setDeleteProject(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{(projects || []).length} projects in portfolio</p>
        </div>
        <CreateProjectModal trigger={<Button size="sm" aria-label="New project" className="h-10 w-10 shrink-0 p-0"><Plus size={16} /></Button>} />
      </div>

      {/* Ownership Tabs */}
      <div className="native-scroll flex items-center gap-1 overflow-x-auto bg-muted/30 rounded-xl p-1 border border-border/50 md:w-fit">
        {([
          { value: 'all' as OwnershipFilter, label: 'All', count: (projects || []).length },
          { value: 'mine' as OwnershipFilter, label: 'My Projects', count: ownedCount },
          { value: 'shared' as OwnershipFilter, label: 'Shared with Me', count: sharedCount },
        ]).map(tab => (
          <button
            key={tab.value}
            onClick={() => setOwnershipFilter(tab.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
              ownershipFilter === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.value === 'shared' && <Users size={12} />}
            {tab.label}
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full",
              ownershipFilter === tab.value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3 md:flex md:items-center md:gap-4 md:space-y-0">
        <div className="flex min-h-11 items-center gap-2 bg-muted/30 rounded-xl px-3 flex-1 md:max-w-sm border border-border/50">
          <Search size={14} className="text-muted-foreground" />
          <input type="text" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
        </div>
        <div className="native-scroll flex items-center gap-1.5 overflow-x-auto">
          <Filter size={14} className="shrink-0 text-muted-foreground" />
          {STAGE_FILTERS.map(f => (
            <button key={f.value} onClick={() => setStageFilter(f.value)} className={`min-h-9 whitespace-nowrap px-3 py-1 rounded-lg text-xs font-medium transition-colors ${stageFilter === f.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 md:hidden">
        {filtered.map((project, i) => {
          const r = readinessMap[project.id] || { percent: 0, done: 0, total: 0 };
          const shared = isProjectShared(project);
          const membership = (memberships || []).find(m => m.project_id === project.id);
          return <motion.article key={project.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="glass-card rounded-2xl p-4"><div className="flex items-start justify-between gap-3"><Link to={`/projects/${project.id}`} className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{project.name}</span>{shared && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-info/10 px-1.5 py-0.5 text-[10px] font-medium text-info"><Users size={10} />Shared</span>}</div><div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{project.short_description}</div></Link><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" aria-label={`Manage ${project.name}`} className="h-10 w-10 shrink-0 p-0"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setEditProject(project)} className="gap-2 text-xs"><Pencil size={12} />Edit</DropdownMenuItem><DropdownMenuItem onClick={() => setDeleteProject(project)} className="gap-2 text-xs text-destructive focus:text-destructive"><Trash2 size={12} />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><div className="mt-3 flex items-center justify-between"><StageBadge stage={project.stage} /><span className="text-[10px] capitalize text-muted-foreground">{shared ? (membership?.access_level || 'view') : 'owner'}</span></div><div className="mt-3"><ReadinessBar percent={r.percent} /></div><Link to={`/projects/${project.id}`} className="mt-4 flex min-h-10 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">Open project</Link></motion.article>;
        })}
        {!filtered.length && <div className="py-12 text-center text-sm text-muted-foreground">No projects found</div>}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card hidden rounded-xl overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Project</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Type</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Industry</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Stage</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Readiness</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Last Opened</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Access</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project, i) => {
              const r = readinessMap[project.id] || { percent: 0, done: 0, total: 0 };
              const shared = isProjectShared(project);
              const membership = (memberships || []).find(m => m.project_id === project.id);
              return (
                <motion.tr key={project.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
                  <td className="px-5 py-3.5">
                    <Link to={`/projects/${project.id}`} className="block">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{project.name}</div>
                        {shared && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-info/10 text-info font-medium">
                            <Users size={10} /> Shared
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{project.short_description}</div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                      project.delivery_type === 'saas_only' ? 'bg-info/15 text-info' :
                      project.delivery_type === 'app_only' ? 'bg-warning/15 text-warning' :
                      project.delivery_type === 'app_with_landing' ? 'bg-accent/15 text-accent-foreground' :
                      project.delivery_type === 'saas_and_app' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    )}>{(project.delivery_type || 'saas_only').replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-xs text-muted-foreground">{project.industry}</span></td>
                  <td className="px-5 py-3.5"><StageBadge stage={project.stage} /></td>
                  <td className="px-5 py-3.5"><ReadinessBar percent={r.percent} /></td>
                  <td className="px-5 py-3.5">
                    {project.last_opened_at ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={10} />
                        {formatDistanceToNow(new Date(project.last_opened_at), { addSuffix: true })}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">Never</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn("text-xs capitalize",
                      shared ? 'text-info' : 'text-muted-foreground'
                    )}>
                      {shared ? (membership?.access_level || 'view') : 'owner'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditProject(project)} className="gap-2 text-xs">
                          <Pencil size={12} /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteProject(project)} className="gap-2 text-xs text-destructive focus:text-destructive">
                          <Trash2 size={12} /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-sm text-muted-foreground">No projects found</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Edit Modal */}
      {editProject && (
        <EditProjectModal project={editProject} open={!!editProject} onOpenChange={open => { if (!open) setEditProject(null); }} />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProject} onOpenChange={open => { if (!open) setDeleteProject(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteProject?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all its related data (tasks, costs, domains, checklists, etc.). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Deleting…' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
