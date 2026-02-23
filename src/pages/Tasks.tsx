import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/useProjectData';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status'];

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-info',
  high: 'text-warning',
  critical: 'text-destructive',
};

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'blocked', label: 'Blocked' },
  { status: 'testing', label: 'Testing' },
  { status: 'done', label: 'Done' },
];

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks();

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;

  const allTasks = tasks || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">{allTasks.length} tasks across all projects</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const columnTasks = allTasks.filter(t => t.status === col.status);
          return (
            <div key={col.status} className="min-w-[280px] flex-1">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{columnTasks.length}</span>
              </div>
              <div className="space-y-2">
                {columnTasks.map((task, i) => (
                  <motion.div key={task.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-lg p-3.5 hover:border-primary/20 transition-colors">
                    <div className="flex items-start gap-2">
                      {task.status === 'blocked' && <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{task.title}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-mono text-muted-foreground">{(task as any).projects?.code}</span>
                          <span className={cn("text-xs font-medium", PRIORITY_COLORS[task.priority])}>{task.priority}</span>
                        </div>
                        {task.blocked_reason && <div className="text-xs text-destructive mt-1.5">{task.blocked_reason}</div>}
                        {task.due_date && <div className="text-xs text-muted-foreground mt-1">Due {task.due_date}</div>}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-8 border border-dashed border-border/50 rounded-lg">Empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
