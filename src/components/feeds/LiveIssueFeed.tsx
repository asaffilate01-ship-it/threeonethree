import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Bug, Clock, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_CONFIG: Record<string, { color: string; icon: typeof Bug }> = {
  critical: { color: 'text-destructive', icon: AlertTriangle },
  high: { color: 'text-warning', icon: AlertTriangle },
  medium: { color: 'text-info', icon: Bug },
  low: { color: 'text-muted-foreground', icon: Bug },
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  wont_fix: "Won't Fix",
  deferred: 'Deferred',
};

export default function LiveIssueFeed() {
  const [realtimeIssues, setRealtimeIssues] = useState<any[]>([]);

  // Fetch recent open issues
  const { data: issues } = useQuery({
    queryKey: ['qa-issues-feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_issues')
        .select('*, projects(name, code)')
        .in('status', ['open', 'in_progress'])
        .order('updated_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('qa-issues-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'qa_issues' },
        (payload) => {
          setRealtimeIssues(prev => {
            const newIssue = payload.new as any;
            // Remove duplicates and keep latest 5 realtime events
            const filtered = prev.filter(i => i.id !== newIssue.id);
            return [{ ...newIssue, _event: payload.eventType, _at: Date.now() }, ...filtered].slice(0, 5);
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const allIssues = issues || [];
  const blockers = allIssues.filter(i => i.severity === 'critical' || i.severity === 'high');
  const openCount = allIssues.filter(i => i.status === 'open').length;
  const inProgressCount = allIssues.filter(i => i.status === 'in_progress').length;

  return (
    <div className="space-y-4">
      {/* Realtime flash banner */}
      <AnimatePresence>
        {realtimeIssues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-primary uppercase tracking-wider">
              <Zap size={10} className="animate-pulse" /> Live Updates
            </div>
            {realtimeIssues.map(issue => (
              <motion.div
                key={`rt-${issue.id}-${issue._at}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs border",
                  issue._event === 'INSERT' ? "bg-primary/5 border-primary/20" :
                  issue._event === 'UPDATE' ? "bg-info/5 border-info/20" :
                  "bg-muted/30 border-border/30"
                )}
              >
                <span className={cn(
                  "text-[10px] font-bold uppercase",
                  issue._event === 'INSERT' ? "text-primary" : "text-info"
                )}>
                  {issue._event === 'INSERT' ? 'NEW' : 'UPD'}
                </span>
                <span className="text-foreground font-medium truncate">{issue.title}</span>
                <span className={cn("text-[10px] ml-auto shrink-0", SEVERITY_CONFIG[issue.severity]?.color || 'text-muted-foreground')}>
                  {issue.severity}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary counters */}
      <div className="flex gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-muted-foreground">{blockers.length} blockers</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-muted-foreground">{openCount} open</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2 h-2 rounded-full bg-info" />
          <span className="text-muted-foreground">{inProgressCount} in progress</span>
        </div>
      </div>

      {/* Issue list */}
      <div className="space-y-2">
        {allIssues.map(issue => {
          const config = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.medium;
          const Icon = config.icon;
          return (
            <div key={issue.id} className="flex items-start gap-3 py-2.5 px-3 rounded-lg bg-muted/20 border border-border/30">
              <Icon size={14} className={cn("mt-0.5 shrink-0", config.color)} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">{issue.title}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] font-mono text-muted-foreground">{(issue as any).projects?.code}</span>
                  <span className={cn("text-[10px] font-medium", config.color)}>{issue.severity}</span>
                  <span className="text-[10px] text-muted-foreground">{STATUS_LABEL[issue.status] || issue.status}</span>
                  {issue.assigned_to && (
                    <span className="text-[10px] text-muted-foreground">→ {issue.assigned_to}</span>
                  )}
                </div>
                {issue.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{issue.description}</p>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                <Clock size={10} className="inline mr-0.5" />
                {formatDistanceToNow(new Date(issue.updated_at), { addSuffix: true })}
              </div>
            </div>
          );
        })}
        {allIssues.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <CheckCircle2 size={16} /> No open issues across projects
          </div>
        )}
      </div>
    </div>
  );
}
