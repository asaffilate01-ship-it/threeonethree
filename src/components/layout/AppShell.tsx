import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-60 transition-all duration-300 h-screen flex flex-col">
        <Topbar />
        <main className="p-6 glow-top flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
