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

const COST_TYPES = ['hosting', 'domain', 'email', 'api', 'saas', 'development', 'marketing', 'legal', 'other'] as const;

interface CreateCostModalProps {
  trigger?: React.ReactNode;
  defaultProjectId?: string;
}

export default function CreateCostModal({ trigger, defaultProjectId }: CreateCostModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: projects } = useProjects();

  const [form, setForm] = useState({
    cost_name: '',
    project_id: defaultProjectId || '',
    cost_type: 'saas',
    vendor: '',
    monthly_cost_gbp: '',
    annual_cost_gbp: '',
    one_off_cost_gbp: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cost_name || !form.project_id) {
      toast.error('Name and project are required');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('costs').insert({
      cost_name: form.cost_name,
      project_id: form.project_id,
      cost_type: form.cost_type,
      vendor: form.vendor || null,
      monthly_cost_gbp: form.monthly_cost_gbp ? Number(form.monthly_cost_gbp) : null,
      annual_cost_gbp: form.annual_cost_gbp ? Number(form.annual_cost_gbp) : null,
      one_off_cost_gbp: form.one_off_cost_gbp ? Number(form.one_off_cost_gbp) : null,
      notes: form.notes || null,
    });
    setLoading(false);
    if (error) {
      toast.error('Failed to add cost: ' + error.message);
      return;
    }
    toast.success('Cost added');
    queryClient.invalidateQueries({ queryKey: ['costs'] });
    queryClient.invalidateQueries({ queryKey: ['project-burn'] });
    queryClient.invalidateQueries({ queryKey: ['project'] });
    setOpen(false);
    setForm({ cost_name: '', project_id: defaultProjectId || '', cost_type: 'saas', vendor: '', monthly_cost_gbp: '', annual_cost_gbp: '', one_off_cost_gbp: '', notes: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5 text-xs">
            <Plus size={14} /> Add Cost
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Cost</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cost Name *</Label>
              <Input value={form.cost_name} onChange={e => setForm(f => ({ ...f, cost_name: e.target.value }))} placeholder="e.g. Vercel Pro" />
            </div>
            <div className="space-y-1.5">
              <Label>Project *</Label>
              <Select value={form.project_id} onValueChange={v => setForm(f => ({ ...f, project_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{(projects || []).map(p => <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.cost_type} onValueChange={v => setForm(f => ({ ...f, cost_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COST_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="e.g. Vercel" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Monthly (£)</Label>
              <Input type="number" step="0.01" value={form.monthly_cost_gbp} onChange={e => setForm(f => ({ ...f, monthly_cost_gbp: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Annual (£)</Label>
              <Input type="number" step="0.01" value={form.annual_cost_gbp} onChange={e => setForm(f => ({ ...f, annual_cost_gbp: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>One-off (£)</Label>
              <Input type="number" step="0.01" value={form.one_off_cost_gbp} onChange={e => setForm(f => ({ ...f, one_off_cost_gbp: e.target.value }))} placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details…" rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Adding…' : 'Add Cost'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
