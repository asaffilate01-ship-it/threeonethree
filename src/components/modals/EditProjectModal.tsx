import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Constants } from '@/integrations/supabase/types';

const STAGES = Constants.public.Enums.project_stage;

interface EditProjectModalProps {
  project: {
    id: string;
    name: string;
    code: string;
    short_description: string | null;
    industry: string | null;
    audience: string | null;
    revenue_model: string | null;
    stage: string;
    owner: string | null;
    delivery_type?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProjectModal({ project, open, onOpenChange }: EditProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    code: '',
    short_description: '',
    industry: '',
    audience: '',
    revenue_model: '',
    stage: 'idea',
    owner: '',
    delivery_type: 'saas_only',
  });

  useEffect(() => {
    if (project && open) {
      setForm({
        name: project.name || '',
        code: project.code || '',
        short_description: project.short_description || '',
        industry: project.industry || '',
        audience: project.audience || '',
        revenue_model: project.revenue_model || '',
        stage: project.stage || 'idea',
        owner: project.owner || '',
        delivery_type: (project as any).delivery_type || 'saas_only',
      });
    }
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      toast.error('Name and code are required');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('projects').update({
      name: form.name,
      code: form.code.toUpperCase(),
      short_description: form.short_description || null,
      industry: form.industry || null,
      audience: form.audience || null,
      revenue_model: form.revenue_model || null,
      stage: form.stage as any,
      owner: form.owner || null,
      delivery_type: form.delivery_type || 'saas_only',
    } as any).eq('id', project.id);
    setLoading(false);
    if (error) {
      toast.error('Failed to update: ' + error.message);
      return;
    }
    toast.success('Project updated');
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Code *</Label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} maxLength={10} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Input value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
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
              <Label>Delivery Type</Label>
              <Select value={form.delivery_type} onValueChange={v => setForm(f => ({ ...f, delivery_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas_only">SaaS Only</SelectItem>
                  <SelectItem value="saas_and_app">SaaS & App</SelectItem>
                  <SelectItem value="app_only">App Only</SelectItem>
                  <SelectItem value="app_with_landing">App + Landing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Revenue Model</Label>
            <Input value={form.revenue_model} onChange={e => setForm(f => ({ ...f, revenue_model: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
