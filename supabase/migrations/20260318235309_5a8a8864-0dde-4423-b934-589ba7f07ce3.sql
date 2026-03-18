
-- Add WhatsApp tracking fields
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS whatsapp_configured boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Add LinkedIn social URL (missing from current social fields)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS social_linkedin text;

-- Add API keys status tracking
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS stripe_configured boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS analytics_configured boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS social_accounts_done boolean DEFAULT false;
