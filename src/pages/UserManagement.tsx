import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Shield, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLES = ['admin', 'project_manager', 'viewer', 'finance', 'partner'] as const;

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

export default function UserManagement() {
  const { data: profiles, isLoading: loadingProfiles } = useProfiles();
  const { data: roles } = useUserRoles();
  const { data: members } = useProjectMembers();
  const { data: projects } = useAllProjects();
  const queryClient = useQueryClient();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('viewer');

  const [assignProjectOpen, setAssignProjectOpen] = useState(false);
  const [apUserId, setApUserId] = useState('');
  const [apProjectId, setApProjectId] = useState('');
  const [apAccessLevel, setApAccessLevel] = useState('view');

  const inviteUser = async () => {
    if (!inviteEmail) { toast.error('Email required'); return; }
    const { data, error } = await supabase.auth.signUp({
      email: inviteEmail,
      password: Math.random().toString(36).slice(-12) + 'A1!',
      options: { data: { display_name: inviteName || inviteEmail.split('@')[0] } }
    });
    if (error) { toast.error(error.message); return; }
    toast.success('User invited — they will receive an email to set their password');
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    setInviteOpen(false);
    setInviteEmail('');
    setInviteName('');
  };

  const assignRole = async () => {
    if (!selectedUserId || !selectedRole) return;
    const { error } = await supabase.from('user_roles' as any).insert({ user_id: selectedUserId, role: selectedRole });
    if (error) { toast.error(error.message); return; }
    toast.success('Role assigned');
    queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    setAssignRoleOpen(false);
  };

  const removeRole = async (id: string) => {
    const { error } = await supabase.from('user_roles' as any).delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Role removed');
    queryClient.invalidateQueries({ queryKey: ['user-roles'] });
  };

  const assignToProject = async () => {
    if (!apUserId || !apProjectId) return;
    const { error } = await supabase.from('project_members' as any).insert({
      user_id: apUserId, project_id: apProjectId, access_level: apAccessLevel
    });
    if (error) { toast.error(error.message); return; }
    toast.success('User assigned to project');
    queryClient.invalidateQueries({ queryKey: ['project-members'] });
    setAssignProjectOpen(false);
  };

  const removeMember = async (id: string) => {
    const { error } = await supabase.from('project_members' as any).delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Removed');
    queryClient.invalidateQueries({ queryKey: ['project-members'] });
  };

  if (loadingProfiles) return <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">Loading…</div>;

  const getRolesForUser = (userId: string) => (roles || []).filter((r: any) => r.user_id === userId);
  const getMembershipsForUser = (userId: string) => (members || []).filter((m: any) => m.user_id === userId);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{(profiles || []).length} users</p>
        </div>
        <div className="flex gap-2">
          {/* Invite User */}
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs"><UserPlus size={14} /> Invite User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Invite User</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1"><Label className="text-xs">Email *</Label><Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@example.com" /></div>
                <div className="space-y-1"><Label className="text-xs">Display Name</Label><Input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="John Doe" /></div>
                <div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>Cancel</Button><Button size="sm" onClick={inviteUser}>Invite</Button></div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Assign Role */}
          <Dialog open={assignRoleOpen} onOpenChange={setAssignRoleOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Shield size={14} /> Assign Role</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Assign Role</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>{(profiles || []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.display_name} ({p.email})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r.replace('_', ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setAssignRoleOpen(false)}>Cancel</Button><Button size="sm" onClick={assignRole}>Assign</Button></div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Assign to Project */}
          <Dialog open={assignProjectOpen} onOpenChange={setAssignProjectOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Plus size={14} /> Assign to Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Assign User to Project</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">User</Label>
                  <Select value={apUserId} onValueChange={setApUserId}>
                    <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>{(profiles || []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.display_name} ({p.email})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Project</Label>
                  <Select value={apProjectId} onValueChange={setApProjectId}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>{(projects || []).map(p => <SelectItem key={p.id} value={p.id}>[{p.code}] {p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Access Level</Label>
                  <Select value={apAccessLevel} onValueChange={setApAccessLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setAssignProjectOpen(false)}>Cancel</Button><Button size="sm" onClick={assignToProject}>Assign</Button></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
                <div className="flex gap-1.5 flex-wrap">
                  {userRoles.map((r: any) => (
                    <span key={r.id} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                      {r.role.replace('_', ' ')}
                      <button onClick={() => removeRole(r.id)} className="hover:text-destructive"><Trash2 size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>
              {userProjects.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Project Access</div>
                  {userProjects.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between py-1">
                      <span className="text-xs text-foreground">[{m.projects?.code}] {m.projects?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", m.access_level === 'edit' ? "bg-info/10 text-info" : "bg-muted text-muted-foreground")}>{m.access_level}</span>
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
    </div>
  );
}
