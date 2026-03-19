import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Shield, UserPlus, ChevronRight, Check, Pencil, Eye, EyeOff, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const ROLES = ['admin', 'project_manager', 'viewer', 'finance', 'partner'] as const;
const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Full access to everything',
  project_manager: 'Manage assigned projects',
  viewer: 'Read-only access',
  finance: 'View costs & financial data',
  partner: 'External partner access',
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
      const { data, error } = await supabase.from('profiles' as any).select('*').order('created_at');
      if (error) throw error;
      return data as any[];
    },
  });
}

function useUserRoles() {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles' as any).select('*, profiles:user_id(display_name, email)');
      if (error) throw error;
      return data as any[];
    },
  });
}

function useProjectMembers() {
  return useQuery({
    queryKey: ['project-members'],
    queryFn: async () => {
      const { data, error } = await supabase.from('project_members' as any).select('*, profiles:user_id(display_name, email), projects:project_id(name, code)');
      if (error) throw error;
      return data as any[];
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

type WizardStep = 'details' | 'role' | 'projects' | 'review';

export default function UserManagement() {
  const { data: profiles, isLoading: loadingProfiles } = useProfiles();
  const { data: roles } = useUserRoles();
  const { data: members } = useProjectMembers();
  const { data: projects } = useAllProjects();
  const queryClient = useQueryClient();

  // Add user wizard
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>('details');
  const [wizardLoading, setWizardLoading] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [newRoles, setNewRoles] = useState<string[]>([]);
  const [projectAccess, setProjectAccess] = useState<Record<string, string>>({});

  // Edit user
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editUserRoles, setEditUserRoles] = useState<string[]>([]);
  const [editUserAccess, setEditUserAccess] = useState<Record<string, string>>({});
  const [editUserLoading, setEditUserLoading] = useState(false);

  const openEditUser = (userId: string) => {
    setEditUserId(userId);
    const currentRoles = getRolesForUser(userId).map((r: any) => r.role);
    setEditUserRoles(currentRoles);
    const currentAccess: Record<string, string> = {};
    getMembershipsForUser(userId).forEach((m: any) => { currentAccess[m.project_id] = m.access_level; });
    setEditUserAccess(currentAccess);
    setEditUserOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editUserId) return;
    setEditUserLoading(true);

    const existingRoles = getRolesForUser(editUserId);
    const existingRoleNames = existingRoles.map((r: any) => r.role);
    
    // Remove roles that were unchecked
    const rolesToRemove = existingRoles.filter((r: any) => !editUserRoles.includes(r.role));
    for (const r of rolesToRemove) {
      await supabase.from('user_roles' as any).delete().eq('id', r.id);
    }
    // Add new roles
    const rolesToAdd = editUserRoles.filter(r => !existingRoleNames.includes(r));
    if (rolesToAdd.length > 0) {
      await supabase.from('user_roles' as any).insert(rolesToAdd.map(role => ({ user_id: editUserId, role })));
    }

    const existingMembers = getMembershipsForUser(editUserId);
    const existingProjectIds = existingMembers.map((m: any) => m.project_id);
    
    // Remove projects set to 'none' or removed
    const membersToRemove = existingMembers.filter((m: any) => !editUserAccess[m.project_id] || editUserAccess[m.project_id] === 'none');
    for (const m of membersToRemove) {
      await supabase.from('project_members' as any).delete().eq('id', m.id);
    }
    // Update existing project access levels
    for (const m of existingMembers) {
      const newLevel = editUserAccess[m.project_id];
      if (newLevel && newLevel !== 'none' && newLevel !== m.access_level) {
        await supabase.from('project_members' as any).update({ access_level: newLevel }).eq('id', m.id);
      }
    }
    // Add new project assignments
    const newProjects = Object.entries(editUserAccess)
      .filter(([pid, level]) => level !== 'none' && !existingProjectIds.includes(pid));
    if (newProjects.length > 0) {
      await supabase.from('project_members' as any).insert(
        newProjects.map(([project_id, access_level]) => ({ user_id: editUserId, project_id, access_level }))
      );
    }

    toast.success('User updated');
    queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    queryClient.invalidateQueries({ queryKey: ['project-members'] });
    setEditUserOpen(false);
    setEditUserLoading(false);
  };

  const getRolesForUser = (userId: string) => (roles || []).filter((r: any) => r.user_id === userId);
  const getMembershipsForUser = (userId: string) => (members || []).filter((m: any) => m.user_id === userId);

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

  const toggleRole = (role: string) => {
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

    // 1. Create user via auth signup
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: newUser.email,
      password: Math.random().toString(36).slice(-12) + 'A1!',
      options: { data: { display_name: newUser.name || newUser.email.split('@')[0] } },
    });
    if (authErr) { toast.error(authErr.message); setWizardLoading(false); return; }

    const userId = authData.user?.id;
    if (!userId) { toast.error('Failed to create user'); setWizardLoading(false); return; }

    // Wait a moment for the trigger to create the profile
    await new Promise(r => setTimeout(r, 1000));

    // 2. Assign roles
    if (newRoles.length > 0) {
      const roleInserts = newRoles.map(role => ({ user_id: userId, role }));
      const { error: roleErr } = await supabase.from('user_roles' as any).insert(roleInserts);
      if (roleErr) toast.error('Role assignment failed: ' + roleErr.message);
    }

    // 3. Assign project permissions
    const projectInserts = Object.entries(projectAccess).map(([project_id, access_level]) => ({
      user_id: userId, project_id, access_level,
    }));
    if (projectInserts.length > 0) {
      const { error: projErr } = await supabase.from('project_members' as any).insert(projectInserts);
      if (projErr) toast.error('Project assignment failed: ' + projErr.message);
    }

    toast.success(`${newUser.name || newUser.email} invited successfully`);
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    queryClient.invalidateQueries({ queryKey: ['project-members'] });
    setWizardOpen(false);
    resetWizard();
  };

  const removeRole = async (id: string) => {
    const { error } = await supabase.from('user_roles' as any).delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Role removed');
    queryClient.invalidateQueries({ queryKey: ['user-roles'] });
  };

  const removeMember = async (id: string) => {
    const { error } = await supabase.from('project_members' as any).delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Removed');
    queryClient.invalidateQueries({ queryKey: ['project-members'] });
  };

  const updateMemberAccess = async (id: string, access_level: string) => {
    const { error } = await supabase.from('project_members' as any).update({ access_level }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Access updated');
    queryClient.invalidateQueries({ queryKey: ['project-members'] });
  };

  const addRoleToExistingUser = async (userId: string, role: string) => {
    const { error } = await supabase.from('user_roles' as any).insert({ user_id: userId, role });
    if (error) { toast.error(error.message); return; }
    toast.success('Role assigned');
    queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    setEditRoleOpen(false);
  };

  const addProjectToExistingUser = async (userId: string, projectId: string, accessLevel: string) => {
    const { error } = await supabase.from('project_members' as any).insert({
      user_id: userId, project_id: projectId, access_level: accessLevel,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Project assigned');
    queryClient.invalidateQueries({ queryKey: ['project-members'] });
    setEditProjectOpen(false);
  };

  if (loadingProfiles) return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;

  const assignedProjectIds = (userId: string) => getMembershipsForUser(userId).map((m: any) => m.project_id);

  const STEPS: { key: WizardStep; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'role', label: 'Role' },
    { key: 'projects', label: 'Projects' },
    { key: 'review', label: 'Review & Invite' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{(profiles || []).length} users</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={openWizard}>
          <UserPlus size={14} /> Add User
        </Button>
      </div>

      {/* Users list */}
      <div className="space-y-3">
        {(profiles || []).map((profile: any) => {
          const userRoles = getRolesForUser(profile.id);
          const userProjects = getMembershipsForUser(profile.id);
          return (
            <div key={profile.id} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">{profile.display_name}</div>
                  <div className="text-xs text-muted-foreground">{profile.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {userRoles.map((r: any) => (
                      <span key={r.id} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                        {r.role.replace('_', ' ')}
                        <button onClick={() => removeRole(r.id)} className="hover:text-destructive"><Trash2 size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => { setEditUserId(profile.id); setEditRoleOpen(true); }}>
                    <Plus size={10} /> Role
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => { setEditUserId(profile.id); setEditProjectOpen(true); }}>
                    <Plus size={10} /> Project
                  </Button>
                </div>
              </div>
              {userProjects.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">Project Access</div>
                  {userProjects.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/20">
                      <span className="text-xs text-foreground font-medium">[{m.projects?.code}] {m.projects?.name}</span>
                      <div className="flex items-center gap-2">
                        <Select value={m.access_level} onValueChange={v => updateMemberAccess(m.id, v)}>
                          <SelectTrigger className="h-6 text-[10px] w-20 border-none bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCESS_LEVELS.filter(a => a.value !== 'none').map(a => (
                              <SelectItem key={a.value} value={a.value}>
                                <span className={cn("text-xs", a.color)}>{a.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button onClick={() => removeMember(m.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={10} /></button>
                      </div>
                    </div>
                  ))}
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
          <div className="flex items-center gap-1 mb-4">
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
                    <div key={proj.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-border/30 bg-muted/10">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground mr-1.5">{proj.code}</span>
                        <span className="text-sm text-foreground">{proj.name}</span>
                      </div>
                      <div className="flex gap-1">
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

      {/* ===== ADD ROLE TO EXISTING USER ===== */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Role</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {ROLES.filter(r => !getRolesForUser(editUserId || '').some((ur: any) => ur.role === r)).map(role => (
              <button key={role} onClick={() => editUserId && addRoleToExistingUser(editUserId, role)}
                className="flex items-center gap-3 w-full p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors text-left">
                <Shield size={14} className="text-primary" />
                <div>
                  <div className="text-sm font-medium text-foreground capitalize">{role.replace('_', ' ')}</div>
                  <div className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== ADD PROJECT TO EXISTING USER ===== */}
      <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
        <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Assign Project</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {(projects || []).filter(p => !assignedProjectIds(editUserId || '').includes(p.id)).map(proj => (
              <div key={proj.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-border/30">
                <div>
                  <span className="text-xs font-bold text-muted-foreground mr-1.5">{proj.code}</span>
                  <span className="text-sm text-foreground">{proj.name}</span>
                </div>
                <div className="flex gap-1">
                  {ACCESS_LEVELS.filter(a => a.value !== 'none').map(a => {
                    const Icon = a.icon;
                    return (
                      <button key={a.value} onClick={() => editUserId && addProjectToExistingUser(editUserId, proj.id, a.value)}
                        className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors text-muted-foreground hover:text-foreground", a.color)}>
                        <Icon size={10} /> {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
