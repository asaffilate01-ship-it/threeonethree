import type { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useOperationsPermission } from '@/hooks/useOperationsWorkspace';
import { hasAdminAccess, hasOperationsReadAccess } from '@/lib/operationsWorkspace';

function LoadingAccess() {
  return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Checking access…</div>;
}

function MissingAccess({ adminOnly = false }: { adminOnly?: boolean }) {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-md items-center px-2">
      <div className="glass-card w-full rounded-2xl p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400"><ShieldAlert size={22} /></span>
        <h1 className="mt-4 text-lg font-semibold text-foreground">Access needs updating</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {adminOnly ? 'Only administrators can manage users and roles.' : 'This is an internal staff workspace. Ask an administrator to assign the correct role in User Management.'}
        </p>
        {!adminOnly && <div className="mt-4 rounded-xl bg-muted/30 p-3 text-left text-xs leading-5 text-muted-foreground">Use Project Manager for editing, Viewer for read-only access, or Finance for finance and read-only operational access.</div>}
      </div>
    </div>
  );
}

export function OperationsAccessGate({ children }: { children: ReactNode }) {
  const { data, isLoading } = useOperationsPermission();
  if (isLoading) return <LoadingAccess />;
  if (!hasOperationsReadAccess(data?.roles ?? [])) return <MissingAccess />;
  return children;
}

export function AdminAccessGate({ children }: { children: ReactNode }) {
  const { data, isLoading } = useOperationsPermission();
  if (isLoading) return <LoadingAccess />;
  if (!hasAdminAccess(data?.roles ?? [])) return <MissingAccess adminOnly />;
  return children;
}
