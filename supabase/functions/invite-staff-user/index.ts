import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const allowedRoles = new Set(['admin', 'project_manager', 'viewer', 'finance', 'partner']);
const allowedAccess = new Set(['view', 'edit', 'full']);

type InviteRequest = {
  email?: string;
  displayName?: string;
  roles?: string[];
  projectAccess?: Record<string, string>;
};

function response(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405);

  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) return response({ error: 'Authentication required' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !anonKey || !serviceRoleKey) return response({ error: 'Server configuration is incomplete' }, 500);

    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: callerData, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData.user) return response({ error: 'Invalid session' }, 401);

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: isAdmin, error: roleCheckError } = await serviceClient.rpc('has_role', { _user_id: callerData.user.id, _role: 'admin' });
    if (roleCheckError || !isAdmin) return response({ error: 'Administrator access required' }, 403);

    const body = await request.json() as InviteRequest;
    const email = body.email?.trim().toLowerCase();
    const displayName = body.displayName?.trim();
    const roles = [...new Set(body.roles ?? [])];
    const projectAccess = Object.entries(body.projectAccess ?? {});
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return response({ error: 'A valid email is required' }, 400);
    if (!displayName) return response({ error: 'A display name is required' }, 400);
    if (!roles.length || roles.some((role) => !allowedRoles.has(role))) return response({ error: 'Select at least one valid role' }, 400);
    if (projectAccess.some(([projectId, access]) => !/^[0-9a-f-]{36}$/i.test(projectId) || !allowedAccess.has(access))) return response({ error: 'Invalid project access request' }, 400);

    const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, { data: { display_name: displayName } });
    if (inviteError || !inviteData.user) return response({ error: inviteError?.message ?? 'Invitation could not be created' }, inviteError?.message.toLowerCase().includes('already') ? 409 : 400);

    const userId = inviteData.user.id;
    const { error: profileError } = await serviceClient.from('profiles').upsert({ id: userId, display_name: displayName, email });
    if (profileError) {
      await serviceClient.auth.admin.deleteUser(userId);
      return response({ error: 'The invitation was rolled back because the profile could not be prepared' }, 500);
    }

    const { error: rolesError } = await serviceClient.from('user_roles').insert(roles.map((role) => ({ user_id: userId, role })));
    if (rolesError) {
      await serviceClient.auth.admin.deleteUser(userId);
      return response({ error: 'The invitation was rolled back because roles could not be assigned' }, 500);
    }

    if (projectAccess.length) {
      const { error: accessError } = await serviceClient.from('project_members').insert(projectAccess.map(([project_id, access_level]) => ({ user_id: userId, project_id, access_level })));
      if (accessError) {
        await serviceClient.auth.admin.deleteUser(userId);
        return response({ error: 'The invitation was rolled back because project access could not be assigned' }, 500);
      }
    }

    return response({ success: true, userId }, 200);
  } catch {
    return response({ error: 'Invitation request could not be completed' }, 500);
  }
});
