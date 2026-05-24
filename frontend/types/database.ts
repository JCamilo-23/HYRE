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
      business_profiles: {
        Row: {
          city: string | null
          company_name: string
          company_size: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          nit: string | null
          updated_at: string
          verified: boolean
          website_url: string | null
        }
        Insert: {
          city?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          id: string
          industry?: string | null
          logo_url?: string | null
          nit?: string | null
          updated_at?: string
          verified?: boolean
          website_url?: string | null
        }
        Update: {
          city?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          nit?: string | null
          updated_at?: string
          verified?: boolean
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          bio: string | null
          birth_year: number | null
          career_stage: string | null
          city: string | null
          created_at: string
          cv_url: string | null
          id: string
          level: number
          linkedin_url: string | null
          nova_cv_score: number | null
          profile_completeness: number
          simulations_completed: number
          skills: string[]
          updated_at: string
          xp: number
        }
        Insert: {
          bio?: string | null
          birth_year?: number | null
          career_stage?: string | null
          city?: string | null
          created_at?: string
          cv_url?: string | null
          id: string
          level?: number
          linkedin_url?: string | null
          nova_cv_score?: number | null
          profile_completeness?: number
          simulations_completed?: number
          skills?: string[]
          updated_at?: string
          xp?: number
        }
        Update: {
          bio?: string | null
          birth_year?: number | null
          career_stage?: string | null
          city?: string | null
          created_at?: string
          cv_url?: string | null
          id?: string
          level?: number
          linkedin_url?: string | null
          nova_cv_score?: number | null
          profile_completeness?: number
          simulations_completed?: number
          skills?: string[]
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      copilot_sessions: {
        Row: {
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copilot_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_matches: {
        Row: {
          candidate_id: string
          candidate_note: string | null
          company_note: string | null
          created_at: string
          id: string
          job_id: string
          match_score: number
          simulation_completed_at: string | null
          simulation_feedback: string | null
          simulation_improvements: Json | null
          simulation_passed: boolean | null
          simulation_quality: string | null
          simulation_score: number | null
          simulation_strengths: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          candidate_note?: string | null
          company_note?: string | null
          created_at?: string
          id?: string
          job_id: string
          match_score: number
          simulation_completed_at?: string | null
          simulation_feedback?: string | null
          simulation_improvements?: Json | null
          simulation_passed?: boolean | null
          simulation_quality?: string | null
          simulation_score?: number | null
          simulation_strengths?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          candidate_note?: string | null
          company_note?: string | null
          created_at?: string
          id?: string
          job_id?: string
          match_score?: number
          simulation_completed_at?: string | null
          simulation_feedback?: string | null
          simulation_improvements?: Json | null
          simulation_passed?: boolean | null
          simulation_quality?: string | null
          simulation_score?: number | null
          simulation_strengths?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_matches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          location: string | null
          remote: boolean
          requirements: string[]
          salary_max: number | null
          salary_min: number | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          location?: string | null
          remote?: boolean
          requirements?: string[]
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          location?: string | null
          remote?: boolean
          requirements?: string[]
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_analyses: {
        Row: {
          ats_issues: Json | null
          bullets_analysis: Json | null
          created_at: string | null
          cv_id: string
          feedback_detailed: Json | null
          feedback_summary: string | null
          id: string
          keyword_gaps: Json | null
          model_used: string | null
          processing_time_ms: number | null
          score_ats: number | null
          score_communication: number | null
          score_general: number | null
          score_recruiter: number | null
          score_technical: number | null
          score_visual: number | null
          sections_detected: string[] | null
          sections_missing: string[] | null
          strengths: Json | null
          top_actions: Json | null
          user_id: string
          version: number | null
          weaknesses: Json | null
        }
        Insert: {
          ats_issues?: Json | null
          bullets_analysis?: Json | null
          created_at?: string | null
          cv_id: string
          feedback_detailed?: Json | null
          feedback_summary?: string | null
          id?: string
          keyword_gaps?: Json | null
          model_used?: string | null
          processing_time_ms?: number | null
          score_ats?: number | null
          score_communication?: number | null
          score_general?: number | null
          score_recruiter?: number | null
          score_technical?: number | null
          score_visual?: number | null
          sections_detected?: string[] | null
          sections_missing?: string[] | null
          strengths?: Json | null
          top_actions?: Json | null
          user_id: string
          version?: number | null
          weaknesses?: Json | null
        }
        Update: {
          ats_issues?: Json | null
          bullets_analysis?: Json | null
          created_at?: string | null
          cv_id?: string
          feedback_detailed?: Json | null
          feedback_summary?: string | null
          id?: string
          keyword_gaps?: Json | null
          model_used?: string | null
          processing_time_ms?: number | null
          score_ats?: number | null
          score_communication?: number | null
          score_general?: number | null
          score_recruiter?: number | null
          score_technical?: number | null
          score_visual?: number | null
          sections_detected?: string[] | null
          sections_missing?: string[] | null
          strengths?: Json | null
          top_actions?: Json | null
          user_id?: string
          version?: number | null
          weaknesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "nova_analyses_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "nova_cvs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nova_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_cv_versions: {
        Row: {
          content: Json | null
          created_at: string | null
          cv_id: string | null
          id: string
          pdf_url: string | null
          template: string | null
          user_id: string | null
          version_type: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          cv_id?: string | null
          id?: string
          pdf_url?: string | null
          template?: string | null
          user_id?: string | null
          version_type?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          cv_id?: string | null
          id?: string
          pdf_url?: string | null
          template?: string | null
          user_id?: string | null
          version_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nova_cv_versions_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "nova_cvs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nova_cv_versions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_cvs: {
        Row: {
          created_at: string | null
          error_message: string | null
          file_type: string | null
          file_url: string | null
          id: string
          industry: string | null
          is_primary: boolean | null
          language: string | null
          name: string
          parsed_sections: Json | null
          raw_text: string | null
          seniority: string | null
          status: string
          target_role: string | null
          updated_at: string | null
          user_id: string | null
          word_count: number | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          industry?: string | null
          is_primary?: boolean | null
          language?: string | null
          name?: string
          parsed_sections?: Json | null
          raw_text?: string | null
          seniority?: string | null
          status?: string
          target_role?: string | null
          updated_at?: string | null
          user_id?: string | null
          word_count?: number | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          industry?: string | null
          is_primary?: boolean | null
          language?: string | null
          name?: string
          parsed_sections?: Json | null
          raw_text?: string | null
          seniority?: string | null
          status?: string
          target_role?: string | null
          updated_at?: string | null
          user_id?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nova_cvs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      simulations: {
        Row: {
          analysis: Json | null
          candidate_id: string
          completed_at: string | null
          created_at: string
          id: string
          job_id: string
          score: number | null
          status: Database["public"]["Enums"]["simulation_status"]
          video_url: string | null
        }
        Insert: {
          analysis?: Json | null
          candidate_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          job_id: string
          score?: number | null
          status?: Database["public"]["Enums"]["simulation_status"]
          video_url?: string | null
        }
        Update: {
          analysis?: Json | null
          candidate_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          job_id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["simulation_status"]
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_simulator_sessions: {
        Row: {
          company_name: string
          created_at: string
          id: string
          job_id: string | null
          messages: Json
          role_title: string
          scenario_context: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string
          created_at?: string
          id?: string
          job_id?: string | null
          messages?: Json
          role_title: string
          scenario_context?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          job_id?: string | null
          messages?: Json
          role_title?: string
          scenario_context?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_simulator_sessions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_simulator_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      xp_next_level: { Args: { xp_val: number }; Returns: number }
      xp_to_level: { Args: { xp_val: number }; Returns: number }
    }
    Enums: {
      job_status: "active" | "paused" | "closed"
      simulation_status: "pending" | "in_progress" | "completed" | "failed"
      subscription_plan: "free" | "pro" | "enterprise"
      subscription_status: "active" | "canceled" | "past_due"
      user_role: "candidate" | "recruiter" | "business"
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
      job_status: ["active", "paused", "closed"],
      simulation_status: ["pending", "in_progress", "completed", "failed"],
      subscription_plan: ["free", "pro", "enterprise"],
      subscription_status: ["active", "canceled", "past_due"],
      user_role: ["candidate", "recruiter", "business"],
    },
  },
} as const