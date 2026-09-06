import { Search, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import { useActionCentre } from '@/hooks/useOperationsWorkspace';
import { getActionUrgency } from '@/lib/operationsWorkspace';

export default function Topbar() {
  const location = useLocation();
  const { data: actions = [] } = useActionCentre();
  const attentionCount = actions.filter((item) => getActionUrgency(item.date).order <= 1).length;
  const pageName = ({ '/': 'Today', '/work-board': 'Work', '/actions': 'Alerts', '/crm': 'Clients', '/compliance': 'Compliance', '/partners': 'Third parties' } as Record<string, string>)[location.pathname] ?? 'Group Control';
  return (
    <header className="top-safe sticky top-0 z-30 flex min-h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-5 lg:h-14 lg:px-6">
      <div className="lg:hidden">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Group Control</div>
        <div className="text-sm font-semibold text-foreground">{pageName}</div>
      </div>
      {/* Search */}
      <div className="hidden items-center gap-2 flex-1 max-w-md lg:flex">
        <Search size={16} className="text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects, domains, tasks…"
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 lg:flex"><CreateTaskModal /><CreateProjectModal /></div>
        <Link to="/actions" aria-label={`${attentionCount} actions need attention`} className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:h-auto lg:w-auto lg:p-2">
          <Bell size={18} />
          {attentionCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 flex items-center justify-center text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full">{attentionCount > 99 ? '99+' : attentionCount}</span>}
        </Link>
      </div>
    </header>
  );
}
