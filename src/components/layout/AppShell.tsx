import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="h-[100dvh] flex flex-col transition-all duration-300 lg:pl-60">
        <Topbar />
        <main className="glow-top flex-1 overflow-y-auto overscroll-y-contain px-4 pb-28 pt-4 sm:px-5 lg:p-6">
          <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading workspace…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
