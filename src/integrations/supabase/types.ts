export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_profiles: {
        Row: {
          id: string
          model: string | null
          monthly_budget_gbp: number | null
          project_id: string
          provider: string
          tokens_estimate: number | null
          usage_notes: string | null
        }
        Insert: {
          id?: string
          model?: string | null
          monthly_budget_gbp?: number | null
          project_id: string
          provider: string
          tokens_estimate?: number | null
          usage_notes?: string | null
        }
        Update: {
          id?: string
          model?: string | null
          monthly_budget_gbp?: number | null
          project_id?: string
          provider?: string
          tokens_estimate?: number | null
          usage_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_profiles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profiles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profiles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_template_items: {
        Row: {
          category: string | null
          id: string
          is_critical: boolean | null
          item_key: string
          label: string
          sort_order: number | null
          template_id: string
        }
        Insert: {
          category?: string | null
          id?: string
          is_critical?: boolean | null
          item_key: string
          label: string
          sort_order?: number | null
          template_id: string
        }
        Update: {
          category?: string | null
          id?: string
          is_critical?: boolean | null
          item_key?: string
          label?: string
          sort_order?: number | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          description: string | null
          id: string
          name: string
          stage: Database["public"]["Enums"]["project_stage"] | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          stage?: Database["public"]["Enums"]["project_stage"] | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          stage?: Database["public"]["Enums"]["project_stage"] | null
        }
        Relationships: []
      }
      costs: {
        Row: {
          annual_cost_gbp: number | null
          cost_name: string
          cost_type: string | null
          end_date: string | null
          id: string
          monthly_cost_gbp: number | null
          notes: string | null
          one_off_cost_gbp: number | null
          project_id: string
          start_date: string | null
          vendor: string | null
        }
        Insert: {
          annual_cost_gbp?: number | null
          cost_name: string
          cost_type?: string | null
          end_date?: string | null
          id?: string
          monthly_cost_gbp?: number | null
          notes?: string | null
          one_off_cost_gbp?: number | null
          project_id: string
          start_date?: string | null
          vendor?: string | null
        }
        Update: {
          annual_cost_gbp?: number | null
          cost_name?: string
          cost_type?: string | null
          end_date?: string | null
          id?: string
          monthly_cost_gbp?: number | null
          notes?: string | null
          one_off_cost_gbp?: number | null
          project_id?: string
          start_date?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      dns_records: {
        Row: {
          domain_id: string
          id: string
          is_verified: boolean | null
          name: string
          notes: string | null
          record_type: string
          ttl: number | null
          value: string
        }
        Insert: {
          domain_id: string
          id?: string
          is_verified?: boolean | null
          name: string
          notes?: string | null
          record_type: string
          ttl?: number | null
          value: string
        }
        Update: {
          domain_id?: string
          id?: string
          is_verified?: boolean | null
          name?: string
          notes?: string | null
          record_type?: string
          ttl?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "dns_records_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          annual_cost_gbp: number | null
          auto_renew: boolean | null
          domain_name: string
          id: string
          notes: string | null
          project_id: string
          purchase_date: string | null
          registrar: string | null
          renew_date: string | null
          status: string | null
        }
        Insert: {
          annual_cost_gbp?: number | null
          auto_renew?: boolean | null
          domain_name: string
          id?: string
          notes?: string | null
          project_id: string
          purchase_date?: string | null
          registrar?: string | null
          renew_date?: string | null
          status?: string | null
        }
        Update: {
          annual_cost_gbp?: number | null
          auto_renew?: boolean | null
          domain_name?: string
          id?: string
          notes?: string | null
          project_id?: string
          purchase_date?: string | null
          registrar?: string | null
          renew_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domains_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domains_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domains_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      email_services: {
        Row: {
          annual_cost_gbp: number | null
          dkim_configured: boolean | null
          dmarc_configured: boolean | null
          id: string
          monthly_cost_gbp: number | null
          notes: string | null
          primary_domain: string | null
          project_id: string
          provider: string
          spf_configured: boolean | null
        }
        Insert: {
          annual_cost_gbp?: number | null
          dkim_configured?: boolean | null
          dmarc_configured?: boolean | null
          id?: string
          monthly_cost_gbp?: number | null
          notes?: string | null
          primary_domain?: string | null
          project_id: string
          provider: string
          spf_configured?: boolean | null
        }
        Update: {
          annual_cost_gbp?: number | null
          dkim_configured?: boolean | null
          dmarc_configured?: boolean | null
          id?: string
          monthly_cost_gbp?: number | null
          notes?: string | null
          primary_domain?: string | null
          project_id?: string
          provider?: string
          spf_configured?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "email_services_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_services_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_services_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      hosting: {
        Row: {
          annual_cost_gbp: number | null
          environment: string
          hosting_type: string | null
          id: string
          monthly_cost_gbp: number | null
          notes: string | null
          project_id: string
          provider: string
          region: string | null
          start_date: string | null
        }
        Insert: {
          annual_cost_gbp?: number | null
          environment?: string
          hosting_type?: string | null
          id?: string
          monthly_cost_gbp?: number | null
          notes?: string | null
          project_id: string
          provider: string
          region?: string | null
          start_date?: string | null
        }
        Update: {
          annual_cost_gbp?: number | null
          environment?: string
          hosting_type?: string | null
          id?: string
          monthly_cost_gbp?: number | null
          notes?: string | null
          project_id?: string
          provider?: string
          region?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hosting_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hosting_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hosting_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          category: Database["public"]["Enums"]["integration_category"]
          docs_url: string | null
          id: string
          name: string
          notes: string | null
          vendor: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["integration_category"]
          docs_url?: string | null
          id?: string
          name: string
          notes?: string | null
          vendor?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["integration_category"]
          docs_url?: string | null
          id?: string
          name?: string
          notes?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          completed_at: string | null
          due_date: string | null
          id: string
          name: string
          notes: string | null
          project_id: string
        }
        Insert: {
          completed_at?: string | null
          due_date?: string | null
          id?: string
          name: string
          notes?: string | null
          project_id: string
        }
        Update: {
          completed_at?: string | null
          due_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      project_checklist_items: {
        Row: {
          done_at: string | null
          id: string
          is_done: boolean
          notes: string | null
          project_id: string
          template_item_id: string
        }
        Insert: {
          done_at?: string | null
          id?: string
          is_done?: boolean
          notes?: string | null
          project_id: string
          template_item_id: string
        }
        Update: {
          done_at?: string | null
          id?: string
          is_done?: boolean
          notes?: string | null
          project_id?: string
          template_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_checklist_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_checklist_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_checklist_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_checklist_items_template_item_id_fkey"
            columns: ["template_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_template_items"
            referencedColumns: ["id"]
          },
        ]
      }
      project_integrations: {
        Row: {
          annual_cost_gbp: number | null
          config_notes: string | null
          id: string
          integration_id: string
          is_configured: boolean
          is_live: boolean
          is_required: boolean
          monthly_cost_gbp: number | null
          project_id: string
        }
        Insert: {
          annual_cost_gbp?: number | null
          config_notes?: string | null
          id?: string
          integration_id: string
          is_configured?: boolean
          is_live?: boolean
          is_required?: boolean
          monthly_cost_gbp?: number | null
          project_id: string
        }
        Update: {
          annual_cost_gbp?: number | null
          config_notes?: string | null
          id?: string
          integration_id?: string
          is_configured?: boolean
          is_live?: boolean
          is_required?: boolean
          monthly_cost_gbp?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_integrations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      project_platforms: {
        Row: {
          id: string
          is_built: boolean
          is_required: boolean
          notes: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          project_id: string
        }
        Insert: {
          id?: string
          is_built?: boolean
          is_required?: boolean
          notes?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          project_id: string
        }
        Update: {
          id?: string
          is_built?: boolean
          is_required?: boolean
          notes?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_platforms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_platforms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_platforms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      project_settings: {
        Row: {
          created_at: string
          id: string
          is_sensitive: boolean
          notes: string | null
          project_id: string
          setting_group: string
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_sensitive?: boolean
          notes?: string | null
          project_id: string
          setting_group: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_sensitive?: boolean
          notes?: string | null
          project_id?: string
          setting_group?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      project_surfaces: {
        Row: {
          auth_required: boolean
          id: string
          is_built: boolean
          is_required: boolean
          notes: string | null
          project_id: string
          surface: Database["public"]["Enums"]["surface_type"]
        }
        Insert: {
          auth_required?: boolean
          id?: string
          is_built?: boolean
          is_required?: boolean
          notes?: string | null
          project_id: string
          surface: Database["public"]["Enums"]["surface_type"]
        }
        Update: {
          auth_required?: boolean
          id?: string
          is_built?: boolean
          is_required?: boolean
          notes?: string | null
          project_id?: string
          surface?: Database["public"]["Enums"]["surface_type"]
        }
        Relationships: [
          {
            foreignKeyName: "project_surfaces_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_surfaces_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_surfaces_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          audience: string | null
          code: string
          created_at: string
          id: string
          industry: string | null
          is_active: boolean
          launch_target_date: string | null
          name: string
          notes: string | null
          owner: string | null
          revenue_model: string | null
          short_description: string | null
          stage: Database["public"]["Enums"]["project_stage"]
          updated_at: string
        }
        Insert: {
          audience?: string | null
          code: string
          created_at?: string
          id?: string
          industry?: string | null
          is_active?: boolean
          launch_target_date?: string | null
          name: string
          notes?: string | null
          owner?: string | null
          revenue_model?: string | null
          short_description?: string | null
          stage?: Database["public"]["Enums"]["project_stage"]
          updated_at?: string
        }
        Update: {
          audience?: string | null
          code?: string
          created_at?: string
          id?: string
          industry?: string | null
          is_active?: boolean
          launch_target_date?: string | null
          name?: string
          notes?: string | null
          owner?: string | null
          revenue_model?: string | null
          short_description?: string | null
          stage?: Database["public"]["Enums"]["project_stage"]
          updated_at?: string
        }
        Relationships: []
      }
      qa_issues: {
        Row: {
          actual_result: string | null
          assigned_to: string | null
          category: string
          created_at: string
          description: string | null
          environment: string | null
          expected_result: string | null
          id: string
          project_id: string
          recommendation: string | null
          reported_by: string | null
          resolved_at: string | null
          screenshot_url: string | null
          severity: string
          status: string
          steps_to_reproduce: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_result?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string | null
          environment?: string | null
          expected_result?: string | null
          id?: string
          project_id: string
          recommendation?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          severity?: string
          status?: string
          steps_to_reproduce?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_result?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string | null
          environment?: string | null
          expected_result?: string | null
          id?: string
          project_id?: string
          recommendation?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          severity?: string
          status?: string
          steps_to_reproduce?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      ssl_certificates: {
        Row: {
          annual_cost_gbp: number | null
          domain_id: string
          expiry_date: string | null
          id: string
          is_active: boolean | null
          is_free: boolean | null
          issue_date: string | null
          notes: string | null
          provider: string | null
        }
        Insert: {
          annual_cost_gbp?: number | null
          domain_id: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          issue_date?: string | null
          notes?: string | null
          provider?: string | null
        }
        Update: {
          annual_cost_gbp?: number | null
          domain_id?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          issue_date?: string | null
          notes?: string | null
          provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ssl_certificates_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      task_links: {
        Row: {
          id: string
          label: string
          task_id: string
          url: string
        }
        Insert: {
          id?: string
          label: string
          task_id: string
          url: string
        }
        Update: {
          id?: string
          label?: string
          task_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_links_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          blocked_reason: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          project_id: string
          status: Database["public"]["Enums"]["task_status"]
          surface_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          blocked_reason?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          project_id: string
          status?: Database["public"]["Enums"]["task_status"]
          surface_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          blocked_reason?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          project_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          surface_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "project_surfaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_launch_readiness: {
        Row: {
          done_items: number | null
          id: string | null
          name: string | null
          readiness_percent: number | null
          stage: Database["public"]["Enums"]["project_stage"] | null
          total_items: number | null
        }
        Relationships: []
      }
      v_project_burn: {
        Row: {
          est_monthly_burn_gbp: number | null
          id: string | null
          name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      integration_category:
        | "payments"
        | "email"
        | "sms"
        | "whatsapp"
        | "auth"
        | "storage"
        | "analytics"
        | "seo"
        | "maps"
        | "ai"
        | "crm"
        | "telephony"
        | "other"
      platform_type:
        | "website"
        | "saas_web"
        | "pwa"
        | "native_ios"
        | "native_android"
        | "api_only"
        | "white_label"
      priority_level: "low" | "medium" | "high" | "critical"
      project_stage:
        | "idea"
        | "inception"
        | "started"
        | "basic_build"
        | "testing"
        | "beta"
        | "soft_launch"
        | "live"
        | "scaling"
        | "paused"
      surface_type:
        | "admin_dashboard"
        | "user_app"
        | "vendor_app"
        | "driver_app"
        | "merchant_portal"
        | "staff_portal"
        | "client_portal"
        | "super_admin"
        | "public_marketing_site"
      task_status:
        | "backlog"
        | "in_progress"
        | "blocked"
        | "testing"
        | "ready"
        | "done"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      integration_category: [
        "payments",
        "email",
        "sms",
        "whatsapp",
        "auth",
        "storage",
        "analytics",
        "seo",
        "maps",
        "ai",
        "crm",
        "telephony",
        "other",
      ],
      platform_type: [
        "website",
        "saas_web",
        "pwa",
        "native_ios",
        "native_android",
        "api_only",
        "white_label",
      ],
      priority_level: ["low", "medium", "high", "critical"],
      project_stage: [
        "idea",
        "inception",
        "started",
        "basic_build",
        "testing",
        "beta",
        "soft_launch",
        "live",
        "scaling",
        "paused",
      ],
      surface_type: [
        "admin_dashboard",
        "user_app",
        "vendor_app",
        "driver_app",
        "merchant_portal",
        "staff_portal",
        "client_portal",
        "super_admin",
        "public_marketing_site",
      ],
      task_status: [
        "backlog",
        "in_progress",
        "blocked",
        "testing",
        "ready",
        "done",
        "cancelled",
      ],
    },
  },
} as const
