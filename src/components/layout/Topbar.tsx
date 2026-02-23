import { Search, Plus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Topbar() {
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
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <Plus size={14} />
          Quick Add
        </Button>
        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
      </div>
    </header>
  );
}
