import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Shield, UserPlus, ChevronRight, Check, Pencil, Eye, EyeOff, Crown, KeyRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import type { Database, Tables } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
type Profile = Tables<'profiles'>;
type UserRoleRecord = Tables<'user_roles'> & { profiles: Pick<Profile, 'display_name' | 'email'> | null };
type ProjectMemberRecord = Tables<'project_members'> & {
  profiles: Pick<Profile, 'display_name' | 'email'> | null;
  projects: { name: string; code: string } | null;
};
type AccessRequestRecord = Tables<'access_requests'> & {
  profiles: Pick<Profile, 'display_name' | 'email'> | null;
  projects: { name: string; code: string } | null;
};

const ROLES = ['admin', 'project_manager', 'viewer', 'finance', 'partner'] as const;
const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Full access, including assigning users and roles',
  project_manager: 'Edit internal operations and manage assigned projects',
  viewer: 'Read-only internal operations access',
  finance: 'Finance access plus read-only operational visibility',
  partner: 'External access to explicitly assigned projects only',
};
const ACCESS_LEVELS = [
  { value: 'none', label: 'None', icon: EyeOff, color: 'text-muted-foreground' },
  { value: 'view', label: 'View', icon: Eye, color: 'text-info' },
  { value: 'edit', label: 'Edit', icon: Pencil, color: 'text-warning' },
  { value: 'full', label: 'Full', icon: Crown, color: 'text-success' },
];

function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at');
      if (error) throw error;
      return data as Profile[];
    },
  });
}

function useUserRoles() {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*, profiles:user_id(display_name, email)');
      if (error) throw error;
      return data as UserRoleRecord[];
    },
  });
}

function useProjectMembers() {
  return useQuery({
    queryKey: ['project-members'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_members').select('*, profiles:user_id(display_name, email), projects:project_id(name, code)');
      if (error) throw error;
      return data as ProjectMemberRecord[];
    },
  });
}

function useAllProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('id, name, code').order('name');
      if (error) throw error;
      return data;
    },
  });
}

function useAccessRequests() {
  return useQuery({
    queryKey: ['access-requests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('access_requests').select('*, profiles:requested_by(display_name, email), projects:project_id(name, code)').eq('status', 'pending').order('created_at');
      if (error) throw error;
      return data as AccessRequestRecord[];
    },
  });
}

type WizardStep = 'details' | 'role' | 'projects' | 'review';

export default function UserManagement() {
  const { data: profiles, isLoading: loadingProfiles } = useProfiles();
  const { data: roles } = useUserRoles();
  const { data: members } = useProjectMembers();
  const { data: projects } = useAllProjects();
  const { data: accessRequests = [] } = useAccessRequests();
  const queryClient = useQueryClient();

  // Add user wizard
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>('details');
  const [wizardLoading, setWizardLoading] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [newRoles, setNewRoles] = useState<AppRole[]>([]);
  const [projectAccess, setProjectAccess] = useState<Record<string, string>>({});

  // Edit user
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editUserRoles, setEditUserRoles] = useState<AppRole[]>([]);
  const [editUserAccess, setEditUserAccess] = useState<Record<string, string>>({});
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [resolvingRequestId, setResolvingRequestId] = useState<string | null>(null);

  const openEditUser = (userId: string, requestId: string | null = null) => {
    setResolvingRequestId(requestId);
    setEditUserId(userId);
    const currentRoles = getRolesForUser(userId).map((role) => role.role);
    setEditUserRoles(currentRoles);
    const currentAccess: Record<string, string> = {};
    getMembershipsForUser(userId).forEach((membership) => { currentAccess[membership.project_id] = membership.access_level; });
    setEditUserAccess(currentAccess);
    setEditUserOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editUserId) return;
    setEditUserLoading(true);

    const existingRoles = getRolesForUser(editUserId);
    const existingRoleNames = existingRoles.map((role) => role.role);
    
    // Remove roles that were unchecked
    const rolesToRemove = existingRoles.filter((role) => !editUserRoles.includes(role.role));
    for (const r of rolesToRemove) {
      await supabase.from('user_roles').delete().eq('id', r.id);
    }
    // Add new roles
    const rolesToAdd = editUserRoles.filter(r => !existingRoleNames.includes(r));
    if (rolesToAdd.length > 0) {
      await supabase.from('user_roles').insert(rolesToAdd.map(role => ({ user_id: editUserId, role })));
    }

    const existingMembers = getMembershipsForUser(editUserId);
    const existingProjectIds = existingMembers.map((membership) => membership.project_id);
    
    // Remove projects set to 'none' or removed
    const membersToRemove = existingMembers.filter((membership) => !editUserAccess[membership.project_id] || editUserAccess[membership.project_id] === 'none');
    for (const m of membersToRemove) {
      await supabase.from('project_members').delete().eq('id', m.id);
    }
    // Update existing project access levels
    for (const m of existingMembers) {
      const newLevel = editUserAccess[m.project_id];
      if (newLevel && newLevel !== 'none' && newLevel !== m.access_level) {
        await supabase.from('project_members').update({ access_level: newLevel }).eq('id', m.id);
      }
    }
    // Add new project assignments
    const newProjects = Object.entries(editUserAccess)
      .filter(([pid, level]) => level !== 'none' && !existingProjectIds.includes(pid));
    if (newProjects.length > 0) {
      await supabase.from('project_members').insert(
        newProjects.map(([project_id, access_level]) => ({ user_id: editUserId, project_id, access_level }))
      );
    }

    if (resolvingRequestId) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: requestError } = await supabase.from('access_requests').update({
        status: 'approved',
        reviewed_by: user?.id ?? null,
        reviewed_at: new Date().toISOString(),
        admin_notes: 'Role and project access assigned in User Management.',
      }).eq('id', resolvingRequestId);
      if (requestError) {
        setEditUserLoading(false);
        return toast.error(`User access saved, but the request could not be closed: ${requestError.message}`);
      }
    }

    toast.success('User updated');
    queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    queryClient.invalidateQueries({ queryKey: ['project-members'] });
    queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    setEditUserOpen(false);
    setResolvingRequestId(null);
    setEditUserLoading(false);
  };

  const denyAccessRequest = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('access_requests').update({
      status: 'denied',
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
      admin_notes: 'Request reviewed and declined by an administrator.',
    }).eq('id', id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    toast.success('Access request closed');
  };

  const getRolesForUser = (userId: string) => (roles || []).filter((role) => role.user_id === userId);
  const getMembershipsForUser = (userId: string) => (members || []).filter((membership) => membership.user_id === userId);

  const resetWizard = () => {
    setWizardStep('details');
    setNewUser({ name: '', email: '' });
    setNewRoles([]);
    setProjectAccess({});
    setWizardLoading(false);
  };

  const openWizard = () => {
    resetWizard();
    setWizardOpen(true);
  };

  const toggleRole = (role: AppRole) => {
    setNewRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const setAccess = (projectId: string, level: string) => {
    setProjectAccess(prev => {
      const next = { ...prev };
      if (level === 'none') delete next[projectId];
      else next[projectId] = level;
      return next;
    });
  };

  const handleInviteAndSetup = async () => {
    if (!newUser.email) { toast.error('Email is required'); return; }
    setWizardLoading(true);
    const { error: inviteError } = await supabase.functions.invoke('invite-staff-user', { body: { email: newUser.email, displayName: newUser.name, roles: newRoles, projectAccess } });
    if (inviteError) { toast.error('Invitation failed. Confirm the function is deployed and you have administrator access.'); setWizardLoading(false); return; }
    toast.success(`${newUser.name || newUser.email} invited with the selected access`);
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    queryClient.invalidateQueries({ queryKey: ['project-members'] });
    setWizardOpen(false);
    resetWizard();
  };

  if (loadingProfiles) return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;

  const STEPS: { key: WizardStep; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'role', label: 'Role' },
    { key: 'projects', label: 'Projects' },
    { key: 'review', label: 'Review & Invite' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{(profiles || []).length} users</p>
        </div>
        <Button size="sm" className="min-h-10 shrink-0 gap-1.5 text-xs" onClick={openWizard}>
          <UserPlus size={14} /> Add User
        </Button>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3"><Shield size={18} className="mt-0.5 shrink-0 text-primary" /><div><div className="text-sm font-semibold text-foreground">Resolving missing access</div><p className="mt-1 text-xs leading-5 text-muted-foreground">Find the staff member below, choose Edit, assign the role that matches their job and add only the projects they need. Use Viewer for read-only staff, Project Manager for operational editing, Finance for finance work and Partner only for external project-scoped access.</p></div></div>
      </div>

      {accessRequests.length > 0 && <section className="space-y-3" aria-label="Pending access requests">
        <div className="flex items-center gap-2">
          <KeyRound size={17} className="text-amber-400" />
          <h2 className="text-sm font-semibold">Missing-access reports</h2>
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">{accessRequests.length} pending</span>
        </div>
        {accessRequests.map((request) => <article key={request.id} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-semibold">{request.profiles?.display_name || request.profiles?.email || 'Staff member'}</div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">{request.reason}</div>
              <div className="mt-2 text-[10px] text-muted-foreground">Requested role: {request.requested_role || 'Not specified'}{request.projects ? ` · ${request.projects.code} ${request.projects.name}` : ' · Portfolio access'}</div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" className="min-h-10" onClick={() => denyAccessRequest(request.id)}><X size={13} className="mr-1" />Decline</Button>
              <Button size="sm" className="min-h-10" onClick={() => openEditUser(request.requested_by, request.id)}><Pencil size={13} className="mr-1" />Assign access</Button>
            </div>
          </div>
        </article>)}
      </section>}

      {/* Users list */}
      <div className="space-y-3">
        {(profiles || []).map((profile) => {
          const userRoles = getRolesForUser(profile.id);
          const userProjects = getMembershipsForUser(profile.id);
          return (
            <div key={profile.id} className="glass-card rounded-2xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{profile.display_name}</div>
                  <div className="text-xs text-muted-foreground">{profile.email}</div>
                </div>
                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                  <div className="flex gap-1.5 flex-wrap">
                    {userRoles.map((r) => (
                      <span key={r.id} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                        {r.role.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="min-h-9 px-3 text-[10px] gap-1" onClick={() => openEditUser(profile.id)}>
                    <Pencil size={10} /> Edit
                  </Button>
                </div>
              </div>
              {userProjects.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">Project Access</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {userProjects.map((m) => {
                      const accessDef = ACCESS_LEVELS.find(a => a.value === m.access_level);
                      return (
                        <span key={m.id} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted/30 text-foreground font-medium">
                          {m.projects?.code} <span className={cn("capitalize", accessDef?.color)}>({accessDef?.label})</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== ADD USER WIZARD ===== */}
      <Dialog open={wizardOpen} onOpenChange={open => { if (!open) { setWizardOpen(false); resetWizard(); } }}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          <div className="native-scroll mb-4 flex items-center gap-1 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const stepOrder: WizardStep[] = ['details', 'role', 'projects', 'review'];
                    const currentIdx = stepOrder.indexOf(wizardStep);
                    const targetIdx = stepOrder.indexOf(s.key);
                    if (targetIdx <= currentIdx) setWizardStep(s.key);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    wizardStep === s.key ? "bg-primary text-primary-foreground" :
                    STEPS.findIndex(x => x.key === wizardStep) > i ? "bg-success/15 text-success" :
                    "bg-muted/50 text-muted-foreground"
                  )}>
                  {STEPS.findIndex(x => x.key === wizardStep) > i ? <Check size={10} /> : <span className="text-[10px]">{i + 1}</span>}
                  {s.label}
                </button>
                {i < STEPS.length - 1 && <ChevronRight size={12} className="text-muted-foreground" />}
              </div>
            ))}
          </div>

          {/* Step 1: Details */}
          {wizardStep === 'details' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Display Name *</Label>
                <Input value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={newUser.email} onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} placeholder="john@company.com" />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => {
                  if (!newUser.name || !newUser.email) { toast.error('Name and email required'); return; }
                  setWizardStep('role');
                }} className="gap-1.5">Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}

          {/* Step 2: Role */}
          {wizardStep === 'role' && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Select one or more roles for <strong>{newUser.name}</strong></p>
              <div className="space-y-2">
                {ROLES.map(role => (
                  <button key={role} onClick={() => toggleRole(role)}
                    className={cn(
                      "flex items-center gap-3 w-full p-3 rounded-lg border transition-colors text-left",
                      newRoles.includes(role) ? "border-primary bg-primary/5" : "border-border/50 hover:bg-muted/30"
                    )}>
                    <Checkbox checked={newRoles.includes(role)} className="pointer-events-none" />
                    <div>
                      <div className="text-sm font-medium text-foreground capitalize">{role.replace('_', ' ')}</div>
                      <div className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setWizardStep('details')}>Back</Button>
                <Button onClick={() => {
                  if (newRoles.length === 0) { toast.error('Select at least one role'); return; }
                  setWizardStep('projects');
                }} className="gap-1.5">Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}

          {/* Step 3: Project Permissions */}
          {wizardStep === 'projects' && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Set access level for each project. Leave as "None" for no access.</p>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {(projects || []).map(proj => {
                  const current = projectAccess[proj.id] || 'none';
                  return (
                    <div key={proj.id} className="flex flex-col gap-2 py-2.5 px-3 rounded-lg border border-border/30 bg-muted/10 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground mr-1.5">{proj.code}</span>
                        <span className="text-sm text-foreground">{proj.name}</span>
                      </div>
                      <div className="native-scroll flex max-w-full gap-1 overflow-x-auto">
                        {ACCESS_LEVELS.map(a => {
                          const Icon = a.icon;
                          return (
                            <button key={a.value} onClick={() => setAccess(proj.id, a.value)}
                              className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
                                current === a.value ? `${a.color} bg-foreground/5 ring-1 ring-current/30` : "text-muted-foreground hover:text-foreground"
                              )}>
                              <Icon size={10} /> {a.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setWizardStep('role')}>Back</Button>
                <Button onClick={() => setWizardStep('review')} className="gap-1.5">Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Invite */}
          {wizardStep === 'review' && (
            <div className="space-y-4">
              <div className="glass-card rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">User</div>
                  <div className="text-sm font-semibold text-foreground">{newUser.name}</div>
                  <div className="text-xs text-muted-foreground">{newUser.email}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Roles</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {newRoles.map(r => (
                      <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{r.replace('_', ' ')}</span>
                    ))}
                  </div>
                </div>
                {Object.keys(projectAccess).length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Project Access</div>
                    <div className="space-y-1">
                      {Object.entries(projectAccess).map(([pid, level]) => {
                        const proj = (projects || []).find(p => p.id === pid);
                        const accessDef = ACCESS_LEVELS.find(a => a.value === level);
                        return (
                          <div key={pid} className="flex items-center justify-between text-xs">
                            <span className="text-foreground">[{proj?.code}] {proj?.name}</span>
                            <span className={cn("font-medium", accessDef?.color)}>{accessDef?.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">An invitation email will be sent to <strong>{newUser.email}</strong> to set their password.</p>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setWizardStep('projects')}>Back</Button>
                <Button onClick={handleInviteAndSetup} disabled={wizardLoading} className="gap-1.5">
                  <UserPlus size={14} /> {wizardLoading ? 'Inviting…' : 'Invite & Setup User'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT USER DIALOG ===== */}
      <Dialog open={editUserOpen} onOpenChange={(open) => { setEditUserOpen(open); if (!open) setResolvingRequestId(null); }}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{resolvingRequestId ? 'Assign requested access' : 'Edit User'}</DialogTitle>
          </DialogHeader>
          {editUserId && (() => {
            const profile = (profiles || []).find((candidate) => candidate.id === editUserId);
            return (
              <div className="space-y-5">
                <div className="glass-card rounded-lg p-3">
                  <div className="text-sm font-semibold text-foreground">{profile?.display_name}</div>
                  <div className="text-xs text-muted-foreground">{profile?.email}</div>
                </div>

                {/* Roles */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Roles</div>
                  <div className="space-y-1.5">
                    {ROLES.map(role => (
                      <button key={role} onClick={() => setEditUserRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])}
                        className={cn(
                          "flex items-center gap-3 w-full p-2.5 rounded-lg border transition-colors text-left",
                          editUserRoles.includes(role) ? "border-primary bg-primary/5" : "border-border/50 hover:bg-muted/30"
                        )}>
                        <Checkbox checked={editUserRoles.includes(role)} className="pointer-events-none" />
                        <div>
                          <div className="text-sm font-medium text-foreground capitalize">{role.replace('_', ' ')}</div>
                          <div className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Access */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Project Access</div>
                  <div className="space-y-1.5 max-h-[35vh] overflow-y-auto pr-1">
                    {(projects || []).map(proj => {
                      const current = editUserAccess[proj.id] || 'none';
                      return (
                        <div key={proj.id} className="flex flex-col gap-2 py-2 px-3 rounded-lg border border-border/30 bg-muted/10 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="text-xs font-bold text-muted-foreground mr-1.5">{proj.code}</span>
                            <span className="text-sm text-foreground">{proj.name}</span>
                          </div>
                          <div className="native-scroll flex max-w-full gap-1 overflow-x-auto">
                            {ACCESS_LEVELS.map(a => {
                              const Icon = a.icon;
                              return (
                                <button key={a.value} onClick={() => setEditUserAccess(prev => {
                                  const next = { ...prev };
                                  if (a.value === 'none') delete next[proj.id];
                                  else next[proj.id] = a.value;
                                  return next;
                                })}
                                  className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
                                    current === a.value ? `${a.color} bg-foreground/5 ring-1 ring-current/30` : "text-muted-foreground hover:text-foreground"
                                  )}>
                                  <Icon size={10} /> {a.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditUserOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveUser} disabled={editUserLoading}>
                    {editUserLoading ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
