
-- QA Issues table for testers dashboard
CREATE TABLE public.qa_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'bug',
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  reported_by TEXT,
  assigned_to TEXT,
  environment TEXT DEFAULT 'staging',
  steps_to_reproduce TEXT,
  expected_result TEXT,
  actual_result TEXT,
  recommendation TEXT,
  screenshot_url TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.qa_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON public.qa_issues FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_qa_issues_updated_at
  BEFORE UPDATE ON public.qa_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a comprehensive "Go-Live" checklist template
INSERT INTO public.checklist_templates (id, name, description, stage)
VALUES ('00000000-0000-0000-0000-000000000001', 'Go-Live Master Checklist', 'Comprehensive pre-launch checklist covering all categories', 'live');

-- Seed all go-live checklist template items
INSERT INTO public.checklist_template_items (template_id, item_key, label, category, is_critical, sort_order) VALUES
-- Email & Communications
('00000000-0000-0000-0000-000000000001', 'email_api_configured', 'Email API configured and tested (SendGrid/Mailgun/SES)', 'Email & Communications', true, 1),
('00000000-0000-0000-0000-000000000001', 'email_spf_configured', 'SPF record configured for sending domain', 'Email & Communications', true, 2),
('00000000-0000-0000-0000-000000000001', 'email_dkim_configured', 'DKIM record configured for sending domain', 'Email & Communications', true, 3),
('00000000-0000-0000-0000-000000000001', 'email_dmarc_configured', 'DMARC policy configured', 'Email & Communications', true, 4),
('00000000-0000-0000-0000-000000000001', 'email_templates_tested', 'Transactional email templates tested', 'Email & Communications', false, 5),
('00000000-0000-0000-0000-000000000001', 'email_unsubscribe', 'Unsubscribe mechanism working', 'Email & Communications', false, 6),

-- Social Media & Links
('00000000-0000-0000-0000-000000000001', 'social_links_configured', 'Social media links added to footer/about', 'Social Media', false, 10),
('00000000-0000-0000-0000-000000000001', 'social_og_tags', 'Open Graph / social share meta tags configured', 'Social Media', false, 11),
('00000000-0000-0000-0000-000000000001', 'social_twitter_card', 'Twitter Card meta tags configured', 'Social Media', false, 12),
('00000000-0000-0000-0000-000000000001', 'social_accounts_created', 'Social media accounts created (FB, IG, X, LinkedIn)', 'Social Media', false, 13),
('00000000-0000-0000-0000-000000000001', 'social_favicon', 'Favicon and app icons configured', 'Social Media', false, 14),

-- Payments & Stripe
('00000000-0000-0000-0000-000000000001', 'stripe_live_keys', 'Stripe live API keys configured', 'Payments', true, 20),
('00000000-0000-0000-0000-000000000001', 'stripe_webhooks', 'Stripe webhooks configured and tested', 'Payments', true, 21),
('00000000-0000-0000-0000-000000000001', 'stripe_products_live', 'Stripe products/prices created in live mode', 'Payments', true, 22),
('00000000-0000-0000-0000-000000000001', 'stripe_error_handling', 'Payment error handling tested', 'Payments', false, 23),
('00000000-0000-0000-0000-000000000001', 'stripe_refund_flow', 'Refund/cancellation flow tested', 'Payments', false, 24),

-- WhatsApp & Messaging
('00000000-0000-0000-0000-000000000001', 'whatsapp_api_configured', 'WhatsApp Business API configured', 'WhatsApp & Messaging', false, 30),
('00000000-0000-0000-0000-000000000001', 'whatsapp_templates', 'WhatsApp message templates approved', 'WhatsApp & Messaging', false, 31),
('00000000-0000-0000-0000-000000000001', 'sms_gateway_configured', 'SMS gateway configured (Twilio/MessageBird)', 'WhatsApp & Messaging', false, 32),
('00000000-0000-0000-0000-000000000001', 'phone_numbers_assigned', 'Business phone numbers assigned and verified', 'WhatsApp & Messaging', false, 33),

-- Domains & DNS
('00000000-0000-0000-0000-000000000001', 'domain_registered', 'Production domain registered', 'Domains & DNS', true, 40),
('00000000-0000-0000-0000-000000000001', 'domain_dns_configured', 'DNS records configured (A, CNAME, MX)', 'Domains & DNS', true, 41),
('00000000-0000-0000-0000-000000000001', 'domain_ssl_active', 'SSL certificate active and auto-renewing', 'Domains & DNS', true, 42),
('00000000-0000-0000-0000-000000000001', 'domain_www_redirect', 'www to non-www redirect configured (or vice versa)', 'Domains & DNS', false, 43),
('00000000-0000-0000-0000-000000000001', 'domain_cdn_configured', 'CDN configured (Cloudflare/Vercel)', 'Domains & DNS', false, 44),

-- Security (OWASP Top 10)
('00000000-0000-0000-0000-000000000001', 'sec_injection', 'A01: Injection prevention (SQL, NoSQL, XSS)', 'Security OWASP', true, 50),
('00000000-0000-0000-0000-000000000001', 'sec_broken_auth', 'A02: Broken authentication fixed (MFA, session mgmt)', 'Security OWASP', true, 51),
('00000000-0000-0000-0000-000000000001', 'sec_sensitive_data', 'A03: Sensitive data exposure protected (encryption at rest/transit)', 'Security OWASP', true, 52),
('00000000-0000-0000-0000-000000000001', 'sec_xxe', 'A04: XXE prevention verified', 'Security OWASP', false, 53),
('00000000-0000-0000-0000-000000000001', 'sec_broken_access', 'A05: Broken access control fixed (RLS, RBAC)', 'Security OWASP', true, 54),
('00000000-0000-0000-0000-000000000001', 'sec_misconfig', 'A06: Security misconfiguration checked (headers, CORS)', 'Security OWASP', true, 55),
('00000000-0000-0000-0000-000000000001', 'sec_xss', 'A07: XSS prevention verified', 'Security OWASP', true, 56),
('00000000-0000-0000-0000-000000000001', 'sec_deserialization', 'A08: Insecure deserialization prevented', 'Security OWASP', false, 57),
('00000000-0000-0000-0000-000000000001', 'sec_components', 'A09: Vulnerable components scanned (npm audit)', 'Security OWASP', true, 58),
('00000000-0000-0000-0000-000000000001', 'sec_logging', 'A10: Insufficient logging & monitoring addressed', 'Security OWASP', true, 59),
('00000000-0000-0000-0000-000000000001', 'sec_rate_limiting', 'Rate limiting configured on APIs', 'Security OWASP', true, 60),
('00000000-0000-0000-0000-000000000001', 'sec_csp_headers', 'Content Security Policy headers set', 'Security OWASP', false, 61),

-- APIs (Incoming & Outgoing)
('00000000-0000-0000-0000-000000000001', 'api_docs', 'API documentation published (Swagger/OpenAPI)', 'APIs', false, 70),
('00000000-0000-0000-0000-000000000001', 'api_auth', 'API authentication configured (JWT/API keys)', 'APIs', true, 71),
('00000000-0000-0000-0000-000000000001', 'api_rate_limit', 'API rate limiting configured', 'APIs', true, 72),
('00000000-0000-0000-0000-000000000001', 'api_error_responses', 'API error responses standardised', 'APIs', false, 73),
('00000000-0000-0000-0000-000000000001', 'api_versioning', 'API versioning strategy defined', 'APIs', false, 74),
('00000000-0000-0000-0000-000000000001', 'api_webhooks_outgoing', 'Outgoing webhooks configured and tested', 'APIs', false, 75),
('00000000-0000-0000-0000-000000000001', 'api_webhooks_incoming', 'Incoming webhook endpoints secured', 'APIs', false, 76),
('00000000-0000-0000-0000-000000000001', 'api_third_party_fallbacks', 'Third-party API fallback/retry logic implemented', 'APIs', false, 77),

-- Testing & QA
('00000000-0000-0000-0000-000000000001', 'test_unit', 'Unit tests written and passing', 'Testing & QA', false, 80),
('00000000-0000-0000-0000-000000000001', 'test_integration', 'Integration tests written and passing', 'Testing & QA', false, 81),
('00000000-0000-0000-0000-000000000001', 'test_e2e', 'End-to-end tests passing', 'Testing & QA', true, 82),
('00000000-0000-0000-0000-000000000001', 'test_load', 'Load/performance testing completed', 'Testing & QA', false, 83),
('00000000-0000-0000-0000-000000000001', 'test_mobile', 'Mobile responsiveness tested (iOS/Android)', 'Testing & QA', true, 84),
('00000000-0000-0000-0000-000000000001', 'test_browser_compat', 'Cross-browser testing completed', 'Testing & QA', true, 85),
('00000000-0000-0000-0000-000000000001', 'test_accessibility', 'Accessibility testing (WCAG 2.1 AA)', 'Testing & QA', false, 86),
('00000000-0000-0000-0000-000000000001', 'test_error_monitoring', 'Error monitoring configured (Sentry/LogRocket)', 'Testing & QA', true, 87),
('00000000-0000-0000-0000-000000000001', 'test_staging_signoff', 'Staging environment signed off', 'Testing & QA', true, 88),

-- Infrastructure & Hosting
('00000000-0000-0000-0000-000000000001', 'infra_prod_env', 'Production environment provisioned', 'Infrastructure', true, 90),
('00000000-0000-0000-0000-000000000001', 'infra_backup', 'Database backup configured', 'Infrastructure', true, 91),
('00000000-0000-0000-0000-000000000001', 'infra_monitoring', 'Uptime monitoring configured', 'Infrastructure', true, 92),
('00000000-0000-0000-0000-000000000001', 'infra_ci_cd', 'CI/CD pipeline configured', 'Infrastructure', false, 93),
('00000000-0000-0000-0000-000000000001', 'infra_env_vars', 'Production environment variables set', 'Infrastructure', true, 94),

-- Legal & Compliance
('00000000-0000-0000-0000-000000000001', 'legal_privacy_policy', 'Privacy policy published', 'Legal & Compliance', true, 100),
('00000000-0000-0000-0000-000000000001', 'legal_terms', 'Terms of service published', 'Legal & Compliance', true, 101),
('00000000-0000-0000-0000-000000000001', 'legal_cookie_consent', 'Cookie consent banner implemented', 'Legal & Compliance', true, 102),
('00000000-0000-0000-0000-000000000001', 'legal_gdpr', 'GDPR compliance verified', 'Legal & Compliance', true, 103),
('00000000-0000-0000-0000-000000000001', 'legal_data_retention', 'Data retention policy defined', 'Legal & Compliance', false, 104);
