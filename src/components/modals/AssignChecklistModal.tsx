import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ClipboardList } from 'lucide-react';

interface AssignChecklistModalProps {
  projectId: string;
  projectName: string;
  trigger?: React.ReactNode;
}

export default function AssignChecklistModal({ projectId, projectName, trigger }: AssignChecklistModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const queryClient = useQueryClient();

  const { data: templates } = useQuery({
    queryKey: ['checklist-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*, checklist_template_items(id)')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const handleAssign = async () => {
    if (!templateId) { toast.error('Select a template'); return; }
    setLoading(true);

    // Get template items
    const { data: items, error: fetchErr } = await supabase
      .from('checklist_template_items')
      .select('id')
      .eq('template_id', templateId);
    if (fetchErr || !items) { toast.error('Failed to fetch items'); setLoading(false); return; }

    // Check existing
    const { data: existing } = await supabase
      .from('project_checklist_items')
      .select('template_item_id')
      .eq('project_id', projectId);
    const existingIds = new Set((existing || []).map(e => e.template_item_id));

    const newItems = items
      .filter(i => !existingIds.has(i.id))
      .map(i => ({ project_id: projectId, template_item_id: i.id, is_done: false }));

    if (newItems.length === 0) {
      toast.info('All checklist items already assigned');
      setLoading(false);
      setOpen(false);
      return;
    }

    const { error } = await supabase.from('project_checklist_items').insert(newItems);
    setLoading(false);
    if (error) { toast.error('Failed: ' + error.message); return; }

    toast.success(`${newItems.length} checklist items assigned to ${projectName}`);
    queryClient.invalidateQueries({ queryKey: ['project'] });
    queryClient.invalidateQueries({ queryKey: ['launch-readiness'] });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <ClipboardList size={14} /> Assign Checklist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Checklist to {projectName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
              <SelectContent>
                {(templates || []).map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({(t as any).checklist_template_items?.length || 0} items)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={loading}>{loading ? 'Assigning…' : 'Assign'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
