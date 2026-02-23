import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FolderKanban, ListTodo, PoundSterling,
  Globe, Puzzle, ClipboardList, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { path: '/',              label: 'Overview',      icon: LayoutDashboard },
  { path: '/projects',      label: 'Projects',      icon: FolderKanban },
  { path: '/tasks',         label: 'Tasks',         icon: ListTodo },
  { path: '/costs',         label: 'Costs',         icon: PoundSterling },
  { path: '/infra',         label: 'Domains & Infra', icon: Globe },
  { path: '/integrations',  label: 'Integrations',  icon: Puzzle },
  { path: '/checklists',    label: 'Checklists',    icon: ClipboardList },
  { path: '/reports',       label: 'Reports',       icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Group Control
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon size={18} className={cn(isActive && "text-primary")} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground">18 projects · Amer</div>
        </div>
      )}
    </aside>
  );
}
