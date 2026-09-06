import { Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import { useActionCentre } from '@/hooks/useOperationsWorkspace';
import { getActionUrgency } from '@/lib/operationsWorkspace';

export default function Topbar() {
  const { data: actions = [] } = useActionCentre();
  const attentionCount = actions.filter((item) => getActionUrgency(item.date).order <= 1).length;
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <Search size={16} className="text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects, domains, tasks…"
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <CreateTaskModal />
        <CreateProjectModal />
        <Link to="/actions" aria-label={`${attentionCount} actions need attention`} className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell size={18} />
          {attentionCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full">{attentionCount > 99 ? '99+' : attentionCount}</span>}
        </Link>
      </div>
    </header>
  );
}
