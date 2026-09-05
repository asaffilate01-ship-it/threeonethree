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
    PostgrestVersion: "14.5"
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
      compliance_register: {
        Row: {
          account_id: string | null
          authority: string | null
          category: string
          created_at: string
          due_date: string | null
          entity_name: string | null
          evidence_url: string | null
          exception_reason: string | null
          external_adviser: string | null
          id: string
          legal_basis_or_scope: string | null
          preparer_id: string | null
          project_id: string | null
          renewal_date: string | null
          requirement: string
          reviewer_id: string | null
          risk_level: string
          status: string
          territory: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          authority?: string | null
          category: string
          created_at?: string
          due_date?: string | null
          entity_name?: string | null
          evidence_url?: string | null
          exception_reason?: string | null
          external_adviser?: string | null
          id?: string
          legal_basis_or_scope?: string | null
          preparer_id?: string | null
          project_id?: string | null
          renewal_date?: string | null
          requirement: string
          reviewer_id?: string | null
          risk_level?: string
          status?: string
          territory: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          authority?: string | null
          category?: string
          created_at?: string
          due_date?: string | null
          entity_name?: string | null
          evidence_url?: string | null
          exception_reason?: string | null
          external_adviser?: string | null
          id?: string
          legal_basis_or_scope?: string | null
          preparer_id?: string | null
          project_id?: string | null
          renewal_date?: string | null
          requirement?: string
          reviewer_id?: string | null
          risk_level?: string
          status?: string
          territory?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_register_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_register_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_register_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_register_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      costs: {
        Row: {
          annual_cost_gbp: number | null
          cost_name: string
          cost_type: string | null
          end_date: string | null
          id: string
          is_reimbursed: boolean | null
          monthly_cost_gbp: number | null
          notes: string | null
          one_off_cost_gbp: number | null
          paid_by: string | null
          project_id: string
          reimbursed_to: string | null
          start_date: string | null
          vendor: string | null
        }
        Insert: {
          annual_cost_gbp?: number | null
          cost_name: string
          cost_type?: string | null
          end_date?: string | null
          id?: string
          is_reimbursed?: boolean | null
          monthly_cost_gbp?: number | null
          notes?: string | null
          one_off_cost_gbp?: number | null
          paid_by?: string | null
          project_id: string
          reimbursed_to?: string | null
          start_date?: string | null
          vendor?: string | null
        }
        Update: {
          annual_cost_gbp?: number | null
          cost_name?: string
          cost_type?: string | null
          end_date?: string | null
          id?: string
          is_reimbursed?: boolean | null
          monthly_cost_gbp?: number | null
          notes?: string | null
          one_off_cost_gbp?: number | null
          paid_by?: string | null
          project_id?: string
          reimbursed_to?: string | null
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
      crm_accounts: {
        Row: {
          account_type: string
          company_number: string | null
          created_at: string
          email: string | null
          id: string
          legal_name: string | null
          name: string
          next_action: string | null
          next_action_due: string | null
          notes: string | null
          owner_id: string | null
          owner_label: string | null
          phone: string | null
          project_id: string | null
          risk_rating: string | null
          stage: string
          tax_identifier: string | null
          territory: string
          updated_at: string
          volume_label: string | null
          website: string | null
        }
        Insert: {
          account_type: string
          company_number?: string | null
          created_at?: string
          email?: string | null
          id?: string
          legal_name?: string | null
          name: string
          next_action?: string | null
          next_action_due?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_label?: string | null
          phone?: string | null
          project_id?: string | null
          risk_rating?: string | null
          stage?: string
          tax_identifier?: string | null
          territory: string
          updated_at?: string
          volume_label?: string | null
          website?: string | null
        }
        Update: {
          account_type?: string
          company_number?: string | null
          created_at?: string
          email?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          next_action?: string | null
          next_action_due?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_label?: string | null
          phone?: string | null
          project_id?: string | null
          risk_rating?: string | null
          stage?: string
          tax_identifier?: string | null
          territory?: string
          updated_at?: string
          volume_label?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_accounts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_accounts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_accounts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          account_id: string
          created_at: string
          do_not_contact: boolean
          email: string | null
          full_name: string
          id: string
          is_decision_maker: boolean
          job_title: string | null
          lawful_contact_basis: string | null
          notes: string | null
          owner_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          do_not_contact?: boolean
          email?: string | null
          full_name: string
          id?: string
          is_decision_maker?: boolean
          job_title?: string | null
          lawful_contact_basis?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          do_not_contact?: boolean
          email?: string | null
          full_name?: string
          id?: string
          is_decision_maker?: boolean
          job_title?: string | null
          lawful_contact_basis?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          account_id: string
          created_at: string
          currency: string
          expected_close_date: string | null
          id: string
          loss_reason: string | null
          owner_id: string | null
          probability: number | null
          project_id: string | null
          stage: string
          title: string
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          value: number | null
        }
        Insert: {
          account_id: string
          created_at?: string
          currency?: string
          expected_close_date?: string | null
          id?: string
          loss_reason?: string | null
          owner_id?: string | null
          probability?: number | null
          project_id?: string | null
          stage?: string
          title: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          account_id?: string
          created_at?: string
          currency?: string
          expected_close_date?: string | null
          id?: string
          loss_reason?: string | null
          owner_id?: string | null
          probability?: number | null
          project_id?: string | null
          stage?: string
          title?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_project_id_fkey"
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
      marketing_campaigns: {
        Row: {
          audience_side: string
          budget: number | null
          channel: string
          created_at: string
          currency: string
          customers: number
          end_date: string | null
          id: string
          leads: number
          meetings: number
          name: string
          next_action: string | null
          objective: string
          owner_id: string | null
          project_id: string | null
          spend: number
          start_date: string | null
          status: string
          territory: string
          trials: number
          updated_at: string
        }
        Insert: {
          audience_side: string
          budget?: number | null
          channel: string
          created_at?: string
          currency?: string
          customers?: number
          end_date?: string | null
          id?: string
          leads?: number
          meetings?: number
          name: string
          next_action?: string | null
          objective: string
          owner_id?: string | null
          project_id?: string | null
          spend?: number
          start_date?: string | null
          status?: string
          territory: string
          trials?: number
          updated_at?: string
        }
        Update: {
          audience_side?: string
          budget?: number | null
          channel?: string
          created_at?: string
          currency?: string
          customers?: number
          end_date?: string | null
          id?: string
          leads?: number
          meetings?: number
          name?: string
          next_action?: string | null
          objective?: string
          owner_id?: string | null
          project_id?: string | null
          spend?: number
          start_date?: string | null
          status?: string
          territory?: string
          trials?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
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
      onboarding_cases: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          account_id: string
          created_at: string
          id: string
          owner_id: string | null
          project_id: string | null
          reviewer_id: string | null
          risk_rating: string | null
          status: string
          target_go_live: string | null
          territory: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          account_id: string
          created_at?: string
          id?: string
          owner_id?: string | null
          project_id?: string | null
          reviewer_id?: string | null
          risk_rating?: string | null
          status?: string
          target_go_live?: string | null
          territory: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          account_id?: string
          created_at?: string
          id?: string
          owner_id?: string | null
          project_id?: string | null
          reviewer_id?: string | null
          risk_rating?: string | null
          status?: string
          target_go_live?: string | null
          territory?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_cases_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_cases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_cases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_cases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_steps: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          due_date: string | null
          evidence_url: string | null
          exception_reason: string | null
          id: string
          onboarding_case_id: string
          owner_id: string | null
          reviewer_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          evidence_url?: string | null
          exception_reason?: string | null
          id?: string
          onboarding_case_id: string
          owner_id?: string | null
          reviewer_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          evidence_url?: string | null
          exception_reason?: string | null
          id?: string
          onboarding_case_id?: string
          owner_id?: string | null
          reviewer_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_steps_onboarding_case_id_fkey"
            columns: ["onboarding_case_id"]
            isOneToOne: false
            referencedRelation: "onboarding_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_tasks: {
        Row: {
          created_at: string
          created_by: string | null
          dependency: string | null
          description: string | null
          due_date: string | null
          evidence_url: string | null
          id: string
          owner: string | null
          owner_id: string | null
          priority: string
          project_code: string | null
          reviewer: string | null
          reviewer_id: string | null
          status: string
          territory: string
          third_party: string | null
          third_party_action_id: string | null
          title: string
          updated_at: string
          workstream: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dependency?: string | null
          description?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id: string
          owner?: string | null
          owner_id?: string | null
          priority?: string
          project_code?: string | null
          reviewer?: string | null
          reviewer_id?: string | null
          status?: string
          territory: string
          third_party?: string | null
          third_party_action_id?: string | null
          title: string
          updated_at?: string
          workstream: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dependency?: string | null
          description?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          owner?: string | null
          owner_id?: string | null
          priority?: string
          project_code?: string | null
          reviewer?: string | null
          reviewer_id?: string | null
          status?: string
          territory?: string
          third_party?: string | null
          third_party_action_id?: string | null
          title?: string
          updated_at?: string
          workstream?: string
        }
        Relationships: [
          {
            foreignKeyName: "operating_tasks_project_code_fkey"
            columns: ["project_code"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "operating_tasks_third_party_action_id_fkey"
            columns: ["third_party_action_id"]
            isOneToOne: false
            referencedRelation: "third_party_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      operations_audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          id: number
          new_data: Json | null
          old_data: Json | null
          row_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          row_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          row_id?: string
          table_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      project_additional_work: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          project_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          project_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_additional_work_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_additional_work_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_additional_work_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      project_apis: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          project_id: string
          status: string
          vendor: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          project_id: string
          status?: string
          vendor?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          project_id?: string
          status?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_apis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_apis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_apis_project_id_fkey"
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
      project_compliance: {
        Row: {
          cost_gbp: number | null
          created_at: string
          expiry_date: string | null
          id: string
          name: string
          notes: string | null
          project_id: string
          status: string
        }
        Insert: {
          cost_gbp?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          name: string
          notes?: string | null
          project_id: string
          status?: string
        }
        Update: {
          cost_gbp?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_compliance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_compliance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_compliance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      project_countries: {
        Row: {
          country_code: string
          country_name: string
          created_at: string
          currency: string
          id: string
          is_primary: boolean | null
          notes: string | null
          project_id: string
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string
          currency?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          project_id: string
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string
          currency?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_countries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_countries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_countries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
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
      project_investments: {
        Row: {
          amount_gbp: number
          created_at: string
          id: string
          invested_at: string | null
          investor_name: string
          notes: string | null
          project_id: string
          shares_percent: number | null
        }
        Insert: {
          amount_gbp?: number
          created_at?: string
          id?: string
          invested_at?: string | null
          investor_name: string
          notes?: string | null
          project_id: string
          shares_percent?: number | null
        }
        Update: {
          amount_gbp?: number
          created_at?: string
          id?: string
          invested_at?: string | null
          investor_name?: string
          notes?: string | null
          project_id?: string
          shares_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_investments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_investments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_investments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          access_level: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          access_level?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          access_level?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_overheads: {
        Row: {
          amount_gbp: number
          category: string
          created_at: string
          frequency: string
          id: string
          name: string
          notes: string | null
          project_id: string
        }
        Insert: {
          amount_gbp?: number
          category: string
          created_at?: string
          frequency?: string
          id?: string
          name: string
          notes?: string | null
          project_id: string
        }
        Update: {
          amount_gbp?: number
          category?: string
          created_at?: string
          frequency?: string
          id?: string
          name?: string
          notes?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_overheads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_overheads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_overheads_project_id_fkey"
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
      project_subscription_tiers: {
        Row: {
          billing_period: string | null
          country_id: string | null
          country_name: string | null
          created_at: string
          currency: string | null
          features: string | null
          id: string
          notes: string | null
          price_gbp: number | null
          project_id: string
          tier_name: string
        }
        Insert: {
          billing_period?: string | null
          country_id?: string | null
          country_name?: string | null
          created_at?: string
          currency?: string | null
          features?: string | null
          id?: string
          notes?: string | null
          price_gbp?: number | null
          project_id: string
          tier_name: string
        }
        Update: {
          billing_period?: string | null
          country_id?: string | null
          country_name?: string | null
          created_at?: string
          currency?: string | null
          features?: string | null
          id?: string
          notes?: string | null
          price_gbp?: number | null
          project_id?: string
          tier_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_subscription_tiers_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "project_countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_subscription_tiers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_subscription_tiers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_subscription_tiers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      project_subsidiary_apps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          notes: string | null
          project_id: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          project_id: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_subsidiary_apps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_subsidiary_apps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_subsidiary_apps_project_id_fkey"
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
          analytics_configured: boolean | null
          audience: string | null
          audit_done: boolean | null
          broadcasts_done: boolean | null
          code: string
          created_at: string
          dead_links_checked: boolean | null
          delivery_type: string | null
          domain_awaiting: boolean | null
          edge_functions_checked: boolean | null
          email_api_configured: boolean | null
          gdpr_done: boolean | null
          has_logo: boolean | null
          id: string
          industry: string | null
          is_active: boolean
          is_live: boolean | null
          is_multi_country: boolean | null
          last_opened_at: string | null
          launch_target_date: string | null
          legals_done: boolean | null
          logo_url: string | null
          name: string
          native_done: boolean | null
          native_required: boolean | null
          notes: string | null
          og_done: boolean | null
          owner: string | null
          payment_gateway_configured: boolean | null
          privacy_done: boolean | null
          push_notifications_done: boolean | null
          pwa_done: boolean | null
          pwa_required: boolean | null
          revenue_model: string | null
          roles_permissions_checked: boolean | null
          security_checked: boolean | null
          security_owasp_checked: boolean | null
          seo_done: boolean | null
          short_description: string | null
          social_accounts_done: boolean | null
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_tiktok: string | null
          social_x: string | null
          social_youtube: string | null
          stage: Database["public"]["Enums"]["project_stage"]
          stripe_configured: boolean | null
          terms_done: boolean | null
          test_domain: string | null
          updated_at: string
          whatsapp_configured: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          analytics_configured?: boolean | null
          audience?: string | null
          audit_done?: boolean | null
          broadcasts_done?: boolean | null
          code: string
          created_at?: string
          dead_links_checked?: boolean | null
          delivery_type?: string | null
          domain_awaiting?: boolean | null
          edge_functions_checked?: boolean | null
          email_api_configured?: boolean | null
          gdpr_done?: boolean | null
          has_logo?: boolean | null
          id?: string
          industry?: string | null
          is_active?: boolean
          is_live?: boolean | null
          is_multi_country?: boolean | null
          last_opened_at?: string | null
          launch_target_date?: string | null
          legals_done?: boolean | null
          logo_url?: string | null
          name: string
          native_done?: boolean | null
          native_required?: boolean | null
          notes?: string | null
          og_done?: boolean | null
          owner?: string | null
          payment_gateway_configured?: boolean | null
          privacy_done?: boolean | null
          push_notifications_done?: boolean | null
          pwa_done?: boolean | null
          pwa_required?: boolean | null
          revenue_model?: string | null
          roles_permissions_checked?: boolean | null
          security_checked?: boolean | null
          security_owasp_checked?: boolean | null
          seo_done?: boolean | null
          short_description?: string | null
          social_accounts_done?: boolean | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_x?: string | null
          social_youtube?: string | null
          stage?: Database["public"]["Enums"]["project_stage"]
          stripe_configured?: boolean | null
          terms_done?: boolean | null
          test_domain?: string | null
          updated_at?: string
          whatsapp_configured?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          analytics_configured?: boolean | null
          audience?: string | null
          audit_done?: boolean | null
          broadcasts_done?: boolean | null
          code?: string
          created_at?: string
          dead_links_checked?: boolean | null
          delivery_type?: string | null
          domain_awaiting?: boolean | null
          edge_functions_checked?: boolean | null
          email_api_configured?: boolean | null
          gdpr_done?: boolean | null
          has_logo?: boolean | null
          id?: string
          industry?: string | null
          is_active?: boolean
          is_live?: boolean | null
          is_multi_country?: boolean | null
          last_opened_at?: string | null
          launch_target_date?: string | null
          legals_done?: boolean | null
          logo_url?: string | null
          name?: string
          native_done?: boolean | null
          native_required?: boolean | null
          notes?: string | null
          og_done?: boolean | null
          owner?: string | null
          payment_gateway_configured?: boolean | null
          privacy_done?: boolean | null
          push_notifications_done?: boolean | null
          pwa_done?: boolean | null
          pwa_required?: boolean | null
          revenue_model?: string | null
          roles_permissions_checked?: boolean | null
          security_checked?: boolean | null
          security_owasp_checked?: boolean | null
          seo_done?: boolean | null
          short_description?: string | null
          social_accounts_done?: boolean | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_x?: string | null
          social_youtube?: string | null
          stage?: Database["public"]["Enums"]["project_stage"]
          stripe_configured?: boolean | null
          terms_done?: boolean | null
          test_domain?: string | null
          updated_at?: string
          whatsapp_configured?: boolean | null
          whatsapp_number?: string | null
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
      team_positions: {
        Row: {
          created_at: string
          department: string
          engagement: string
          filled_headcount: number
          hiring_phase: string
          id: string
          owner_id: string | null
          planned_headcount: number
          qualification_required: string | null
          responsibilities: string[]
          role_title: string
          status: string
          territory: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          engagement?: string
          filled_headcount?: number
          hiring_phase?: string
          id?: string
          owner_id?: string | null
          planned_headcount?: number
          qualification_required?: string | null
          responsibilities?: string[]
          role_title: string
          status?: string
          territory: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          engagement?: string
          filled_headcount?: number
          hiring_phase?: string
          id?: string
          owner_id?: string | null
          planned_headcount?: number
          qualification_required?: string | null
          responsibilities?: string[]
          role_title?: string
          status?: string
          territory?: string
          updated_at?: string
        }
        Relationships: []
      }
      third_party_actions: {
        Row: {
          account_id: string | null
          can_be_brought_in_house: boolean
          category: string
          created_at: string
          dependency: string | null
          due_date: string | null
          escalation_owner_id: string | null
          evidence_url: string | null
          external_owner_name: string | null
          id: string
          internal_owner_id: string | null
          notes: string | null
          organisation: string
          project_id: string | null
          qualification_required: string | null
          renewal_date: string | null
          required_deliverable: string
          status: string
          territory: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          can_be_brought_in_house?: boolean
          category: string
          created_at?: string
          dependency?: string | null
          due_date?: string | null
          escalation_owner_id?: string | null
          evidence_url?: string | null
          external_owner_name?: string | null
          id?: string
          internal_owner_id?: string | null
          notes?: string | null
          organisation: string
          project_id?: string | null
          qualification_required?: string | null
          renewal_date?: string | null
          required_deliverable: string
          status?: string
          territory: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          can_be_brought_in_house?: boolean
          category?: string
          created_at?: string
          dependency?: string | null
          due_date?: string | null
          escalation_owner_id?: string | null
          evidence_url?: string | null
          external_owner_name?: string | null
          id?: string
          internal_owner_id?: string | null
          notes?: string | null
          organisation?: string
          project_id?: string | null
          qualification_required?: string | null
          renewal_date?: string | null
          required_deliverable?: string
          status?: string
          territory?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "third_party_actions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "third_party_actions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "third_party_actions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_launch_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "third_party_actions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_burn"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      can_edit_project: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_operations: { Args: { _user_id: string }; Returns: boolean }
      can_view_project: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "project_manager" | "viewer" | "finance" | "partner"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "project_manager", "viewer", "finance", "partner"],
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
