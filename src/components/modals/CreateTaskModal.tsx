import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useProjects } from '@/hooks/useProjectData';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Constants, type Database } from '@/integrations/supabase/types';

const STATUSES = Constants.public.Enums.task_status;
const PRIORITIES = Constants.public.Enums.priority_level;

interface CreateTaskModalProps {
  trigger?: React.ReactNode;
  defaultProjectId?: string;
}

export default function CreateTaskModal({ trigger, defaultProjectId }: CreateTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: projects } = useProjects();

  const [form, setForm] = useState({
    title: '',
    description: '',
    project_id: defaultProjectId || '',
    priority: 'medium' as string,
    status: 'backlog' as string,
    assigned_to: '',
    due_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.project_id) {
      toast.error('Title and project are required');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('tasks').insert({
      title: form.title,
      description: form.description || null,
      project_id: form.project_id,
      priority: form.priority as Database['public']['Enums']['priority_level'],
      status: form.status as Database['public']['Enums']['task_status'],
      assigned_to: form.assigned_to || null,
      due_date: form.due_date || null,
    });
    setLoading(false);
    if (error) {
      toast.error('Failed to create task: ' + error.message);
      return;
    }
    toast.success('Task created');
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['project'] });
    setOpen(false);
    setForm({ title: '', description: '', project_id: defaultProjectId || '', priority: 'medium', status: 'backlog', assigned_to: '', due_date: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Plus size={14} /> New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Task details…" rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Project *</Label>
              <Select value={form.project_id} onValueChange={v => setForm(f => ({ ...f, project_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {(projects || []).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Assigned To</Label>
            <Input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} placeholder="e.g. Amer" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Task'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
