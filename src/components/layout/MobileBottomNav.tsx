import { useState } from 'react';
import { BellRing, ClipboardPlus, LayoutDashboard, Menu, Plus, Workflow } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useActionCentre } from '@/hooks/useOperationsWorkspace';
import { getActionUrgency } from '@/lib/operationsWorkspace';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './navigation';

const primaryItems = [
  { path: '/', label: 'Today', icon: LayoutDashboard },
  { path: '/work-board', label: 'Work', icon: Workflow },
  { path: '/actions', label: 'Alerts', icon: BellRing },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { data: actions = [] } = useActionCentre();
  const [quickOpen, setQuickOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const attentionCount = actions.filter((item) => getActionUrgency(item.date).order <= 1).length;
  const active = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav aria-label="Mobile navigation" className="mobile-tab-bar lg:hidden">
        {primaryItems.slice(0, 2).map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path} className={cn('mobile-tab', active(path) && 'mobile-tab-active')}>
            <Icon size={20} strokeWidth={active(path) ? 2.4 : 1.8} />
            <span>{label}</span>
          </Link>
        ))}
        <button type="button" onClick={() => setQuickOpen(true)} className="mobile-tab" aria-label="Open quick actions">
          <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_hsl(var(--primary)/0.35)] ring-4 ring-background"><Plus size={23} /></span>
          <span className="-mt-1">Quick</span>
        </button>
        <Link to="/actions" className={cn('mobile-tab relative', active('/actions') && 'mobile-tab-active')}>
          <span className="relative"><BellRing size={20} strokeWidth={active('/actions') ? 2.4 : 1.8} />{attentionCount > 0 && <span className="absolute -right-2.5 -top-2 min-w-4 rounded-full bg-destructive px-1 text-[9px] font-bold leading-4 text-destructive-foreground">{attentionCount > 99 ? '99+' : attentionCount}</span>}</span>
          <span>Alerts</span>
        </Link>
        <button type="button" onClick={() => setMoreOpen(true)} className={cn('mobile-tab', !primaryItems.some((item) => active(item.path)) && 'mobile-tab-active')}>
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>

      <Drawer open={quickOpen} onOpenChange={setQuickOpen}>
        <DrawerContent className="max-h-[82dvh] rounded-t-3xl pb-safe">
          <DrawerHeader className="text-left">
            <DrawerTitle>Quick actions</DrawerTitle>
            <DrawerDescription>Create or open the work you use most.</DrawerDescription>
          </DrawerHeader>
          <div className="grid grid-cols-2 gap-3 px-4 pb-6">
            <CreateTaskModal trigger={<button className="native-action-card"><ClipboardPlus size={20} /><span>New task</span></button>} />
            <CreateProjectModal trigger={<button className="native-action-card"><Plus size={20} /><span>New project</span></button>} />
            {[
              ['/crm', 'CRM account'],
              ['/compliance', 'Compliance'],
              ['/partners', 'Third party'],
              ['/marketing', 'Campaign plan'],
            ].map(([path, label]) => <DrawerClose key={path} asChild><Link to={path} className="native-action-card"><Plus size={20} /><span>{label}</span></Link></DrawerClose>)}
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="max-h-[88dvh] rounded-t-3xl pb-safe">
          <DrawerHeader className="text-left">
            <DrawerTitle>All workspaces</DrawerTitle>
            <DrawerDescription>Portfolio, people, delivery and administration.</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-3 pb-6">
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.filter((item) => !['/', '/work-board', '/actions'].includes(item.path)).map(({ path, label, icon: Icon }) => (
                <DrawerClose key={path} asChild>
                  <Link to={path} className={cn('flex min-h-14 items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 text-sm font-medium', active(path) && 'border-primary/40 bg-primary/10 text-primary')}>
                    <Icon size={18} className="shrink-0" /><span>{label}</span>
                  </Link>
                </DrawerClose>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
