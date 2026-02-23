export type ProjectStage = 
  | 'idea' | 'inception' | 'started' | 'basic_build' | 'testing' 
  | 'beta' | 'soft_launch' | 'live' | 'scaling' | 'paused';

export type PlatformType = 
  | 'website' | 'saas_web' | 'pwa' | 'native_ios' | 'native_android' | 'api_only' | 'white_label';

export type SurfaceType = 
  | 'admin_dashboard' | 'user_app' | 'vendor_app' | 'driver_app' | 'merchant_portal'
  | 'staff_portal' | 'client_portal' | 'super_admin' | 'public_marketing_site';

export type TaskStatus = 'backlog' | 'in_progress' | 'blocked' | 'testing' | 'ready' | 'done' | 'cancelled';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  code: string;
  name: string;
  shortDescription: string;
  industry: string;
  audience: string;
  revenueModel: string;
  stage: ProjectStage;
  launchTargetDate?: string;
  owner: string;
  isActive: boolean;
  platforms: PlatformType[];
  surfaces: SurfaceType[];
  domain?: string;
  monthlyBurn: number;
  readinessPercent: number;
  checklistDone: number;
  checklistTotal: number;
  tasksOpen: number;
}

export interface Task {
  id: string;
  projectId: string;
  projectCode: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: PriorityLevel;
  assignedTo?: string;
  dueDate?: string;
  blockedReason?: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  isCritical: boolean;
  isDone: boolean;
}

export const STAGE_LABELS: Record<ProjectStage, string> = {
  idea: 'Idea',
  inception: 'Inception',
  started: 'Started',
  basic_build: 'Basic Build',
  testing: 'Testing',
  beta: 'Beta',
  soft_launch: 'Soft Launch',
  live: 'Live',
  scaling: 'Scaling',
  paused: 'Paused',
};

export const STAGE_COLORS: Record<ProjectStage, string> = {
  idea: 'bg-stage-idea/15 text-stage-idea',
  inception: 'bg-stage-inception/15 text-stage-inception',
  started: 'bg-stage-started/15 text-stage-started',
  basic_build: 'bg-stage-basic-build/15 text-stage-basic-build',
  testing: 'bg-stage-testing/15 text-stage-testing',
  beta: 'bg-stage-beta/15 text-stage-beta',
  soft_launch: 'bg-stage-soft-launch/15 text-stage-soft-launch',
  live: 'bg-stage-live/15 text-stage-live',
  scaling: 'bg-stage-scaling/15 text-stage-scaling',
  paused: 'bg-stage-paused/15 text-stage-paused',
};

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  low: 'text-muted-foreground',
  medium: 'text-info',
  high: 'text-warning',
  critical: 'text-destructive',
};
