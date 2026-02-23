
-- Fix security definer views by setting security_invoker = true
ALTER VIEW public.v_project_burn SET (security_invoker = true);
ALTER VIEW public.v_launch_readiness SET (security_invoker = true);
