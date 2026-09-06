import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Constants, type Database } from '@/integrations/supabase/types';

const STAGES = Constants.public.Enums.project_stage;

interface CreateProjectModalProps {
  trigger?: React.ReactNode;
}

export default function CreateProjectModal({ trigger }: CreateProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    code: '',
    short_description: '',
    industry: '',
    audience: '',
    revenue_model: '',
    stage: 'idea' as string,
    owner: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      toast.error('Name and code are required');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('projects').insert({
      name: form.name,
      code: form.code.toUpperCase(),
      short_description: form.short_description || null,
      industry: form.industry || null,
      audience: form.audience || null,
      revenue_model: form.revenue_model || null,
      stage: form.stage as Database['public']['Enums']['project_stage'],
      owner: form.owner || null,
    });
    setLoading(false);
    if (error) {
      toast.error('Failed to create project: ' + error.message);
      return;
    }
    toast.success('Project created');
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setOpen(false);
    setForm({ name: '', code: '', short_description: '', industry: '', audience: '', revenue_model: '', stage: 'idea', owner: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5 text-xs">
            <Plus size={14} /> New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Project" />
            </div>
            <div className="space-y-1.5">
              <Label>Code *</Label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="MYPROJ" maxLength={10} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} placeholder="Brief description…" rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="e.g. Fintech" />
            </div>
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Input value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} placeholder="e.g. B2C" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={v => setForm(f => ({ ...f, stage: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} placeholder="e.g. Amer" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Revenue Model</Label>
            <Input value={form.revenue_model} onChange={e => setForm(f => ({ ...f, revenue_model: e.target.value }))} placeholder="e.g. SaaS subscription" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Project'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
