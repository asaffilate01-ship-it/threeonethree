
-- Update can_edit_project to also allow 'full' access level
CREATE OR REPLACE FUNCTION public.can_edit_project(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.projects WHERE id = _project_id AND owner = (
      SELECT display_name FROM public.profiles WHERE id = _user_id
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.project_members WHERE user_id = _user_id AND project_id = _project_id AND access_level IN ('edit', 'full')
  )
$$;
