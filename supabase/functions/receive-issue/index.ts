import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = Deno.env.get("ISSUE_WEBHOOK_KEY");
    if (!expectedKey) {
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (apiKey !== expectedKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // Validate required fields
    const { project_code, title, category, severity, status, description, reported_by, environment, steps_to_reproduce, expected_result, actual_result, recommendation, assigned_to } = body;

    if (!project_code || !title) {
      return new Response(
        JSON.stringify({ error: "project_code and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up project by code
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("id")
      .eq("code", project_code)
      .maybeSingle();

    if (projError || !project) {
      return new Response(
        JSON.stringify({ error: `Project '${project_code}' not found` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert: if an issue with same project + title exists, update it; otherwise insert
    const { data: existing } = await supabase
      .from("qa_issues")
      .select("id")
      .eq("project_id", project.id)
      .eq("title", title)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from("qa_issues")
        .update({
          category: category || "bug",
          severity: severity || "medium",
          status: status || "open",
          description,
          reported_by,
          environment,
          steps_to_reproduce,
          expected_result,
          actual_result,
          recommendation,
          assigned_to,
          updated_at: new Date().toISOString(),
          ...(status === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      result = { action: "updated", issue: data };
    } else {
      const { data, error } = await supabase
        .from("qa_issues")
        .insert({
          project_id: project.id,
          title,
          category: category || "bug",
          severity: severity || "medium",
          status: status || "open",
          description,
          reported_by,
          environment,
          steps_to_reproduce,
          expected_result,
          actual_result,
          recommendation,
          assigned_to,
        })
        .select()
        .single();
      if (error) throw error;
      result = { action: "created", issue: data };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
