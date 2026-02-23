import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Settings, Save } from 'lucide-react';

const SETTING_FIELDS: Record<string, { key: string; label: string; placeholder: string; sensitive?: boolean }[]> = {
  social: [
    { key: 'facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/...' },
    { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/...' },
    { key: 'twitter_url', label: 'Twitter / X', placeholder: 'https://x.com/...' },
    { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/...' },
    { key: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
    { key: 'tiktok_url', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
  ],
  api: [
    { key: 'stripe_publishable_key', label: 'Stripe Publishable Key', placeholder: 'pk_live_...' },
    { key: 'stripe_secret_key', label: 'Stripe Secret Key', placeholder: 'sk_live_...', sensitive: true },
    { key: 'stripe_webhook_secret', label: 'Stripe Webhook Secret', placeholder: 'whsec_...', sensitive: true },
    { key: 'google_analytics_id', label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX' },
    { key: 'google_tag_manager_id', label: 'GTM ID', placeholder: 'GTM-XXXXXXX' },
    { key: 'meta_pixel_id', label: 'Meta Pixel ID', placeholder: '1234567890' },
  ],
  contact: [
    { key: 'primary_phone', label: 'Primary Phone', placeholder: '+44 7xxx xxx xxx' },
    { key: 'secondary_phone', label: 'Secondary Phone', placeholder: '+44 7xxx xxx xxx' },
    { key: 'support_email', label: 'Support Email', placeholder: 'support@...' },
    { key: 'sales_email', label: 'Sales Email', placeholder: 'sales@...' },
    { key: 'noreply_email', label: 'No-Reply Email', placeholder: 'noreply@...' },
  ],
  whatsapp: [
    { key: 'whatsapp_business_number', label: 'Business Number', placeholder: '+44 7xxx xxx xxx' },
    { key: 'whatsapp_api_key', label: 'API Key', placeholder: 'Your WhatsApp API key', sensitive: true },
    { key: 'whatsapp_business_id', label: 'Business Account ID', placeholder: 'WABA ID' },
    { key: 'whatsapp_phone_number_id', label: 'Phone Number ID', placeholder: 'Phone number ID' },
  ],
};

const GROUP_LABELS: Record<string, string> = {
  social: 'Social Media',
  api: 'API Keys',
  contact: 'Contact Details',
  whatsapp: 'WhatsApp',
};

interface ProjectSettingsModalProps {
  projectId: string;
  projectName: string;
  trigger?: React.ReactNode;
}

export default function ProjectSettingsModal({ projectId, projectName, trigger }: ProjectSettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['project-settings', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('project_settings')
        .select('*')
        .eq('project_id', projectId);
      if (error) throw error;
      return data as { setting_group: string; setting_key: string; setting_value: string | null }[];
    },
    enabled: open && !!projectId,
  });

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s: any) => {
        map[`${s.setting_group}__${s.setting_key}`] = s.setting_value || '';
      });
      setValues(map);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const upserts: any[] = [];
    Object.entries(SETTING_FIELDS).forEach(([group, fields]) => {
      fields.forEach(field => {
        const key = `${group}__${field.key}`;
        const val = values[key];
        if (val !== undefined && val !== '') {
          upserts.push({
            project_id: projectId,
            setting_group: group,
            setting_key: field.key,
            setting_value: val,
            is_sensitive: field.sensitive || false,
          });
        }
      });
    });

    if (upserts.length > 0) {
      const { error } = await (supabase as any)
        .from('project_settings')
        .upsert(upserts, { onConflict: 'project_id,setting_group,setting_key' });
      if (error) {
        toast.error('Failed to save: ' + error.message);
        setSaving(false);
        return;
      }
    }

    toast.success('Settings saved');
    queryClient.invalidateQueries({ queryKey: ['project-settings', projectId] });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Settings size={14} /> Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{projectName} — Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="social" className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            {Object.keys(GROUP_LABELS).map(g => (
              <TabsTrigger key={g} value={g} className="text-xs">{GROUP_LABELS[g]}</TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(SETTING_FIELDS).map(([group, fields]) => (
            <TabsContent key={group} value={group} className="space-y-3 mt-4">
              {fields.map(field => {
                const key = `${group}__${field.key}`;
                return (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{field.label}</Label>
                    <Input
                      type={field.sensitive ? 'password' : 'text'}
                      value={values[key] || ''}
                      onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="text-sm"
                    />
                  </div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
        <div className="flex justify-end gap-2 pt-4 border-t border-border/50 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save size={14} /> {saving ? 'Saving…' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
