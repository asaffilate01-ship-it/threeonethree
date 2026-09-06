import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/layout/AppShell";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound";
import { AdminAccessGate, OperationsAccessGate } from "@/components/access/AccessGate";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Projects = lazy(() => import("@/pages/Projects"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const Costs = lazy(() => import("@/pages/Costs"));
const Infra = lazy(() => import("@/pages/Infra"));
const Integrations = lazy(() => import("@/pages/Integrations"));
const Checklists = lazy(() => import("@/pages/Checklists"));
const Reports = lazy(() => import("@/pages/Reports"));
const QaDashboard = lazy(() => import("@/pages/QaDashboard"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const Operations = lazy(() => import("@/pages/Operations"));
const PortfolioRegistry = lazy(() => import("@/pages/PortfolioRegistry"));
const Partners = lazy(() => import("@/pages/Partners"));
const WorkBoard = lazy(() => import("@/pages/WorkBoard"));
const Crm = lazy(() => import("@/pages/Crm"));
const Marketing = lazy(() => import("@/pages/Marketing"));
const Compliance = lazy(() => import("@/pages/Compliance"));
const ActionCentre = lazy(() => import("@/pages/ActionCentre"));

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { session, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }
  
  if (!session) return <Navigate to="/auth" replace />;
  
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/portfolio" element={<PortfolioRegistry />} />
        <Route path="/operations" element={<OperationsAccessGate><Operations /></OperationsAccessGate>} />
        <Route path="/work-board" element={<OperationsAccessGate><WorkBoard /></OperationsAccessGate>} />
        <Route path="/actions" element={<OperationsAccessGate><ActionCentre /></OperationsAccessGate>} />
        <Route path="/crm" element={<OperationsAccessGate><Crm /></OperationsAccessGate>} />
        <Route path="/compliance" element={<OperationsAccessGate><Compliance /></OperationsAccessGate>} />
        <Route path="/partners" element={<OperationsAccessGate><Partners /></OperationsAccessGate>} />
        <Route path="/marketing" element={<OperationsAccessGate><Marketing /></OperationsAccessGate>} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/costs" element={<Costs />} />
        <Route path="/infra" element={<Infra />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/checklists" element={<Checklists />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/qa" element={<QaDashboard />} />
        <Route path="/users" element={<AdminAccessGate><UserManagement /></AdminAccessGate>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AuthRoute() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
