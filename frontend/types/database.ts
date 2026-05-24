export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: "candidate" | "recruiter"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "candidate" | "recruiter"
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          role?: "candidate" | "recruiter"
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          requirements: string[]
          salary_min: number | null
          salary_max: number | null
          location: string | null
          remote: boolean
          status: "active" | "paused" | "closed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          requirements?: string[]
          salary_min?: number | null
          salary_max?: number | null
          location?: string | null
          remote?: boolean
          status?: "active" | "paused" | "closed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          requirements?: string[]
          salary_min?: number | null
          salary_max?: number | null
          location?: string | null
          remote?: boolean
          status?: "active" | "paused" | "closed"
          updated_at?: string
        }
        Relationships: []
      }
      simulations: {
        Row: {
          id: string
          job_id: string
          candidate_id: string
          status: "pending" | "in_progress" | "completed" | "failed"
          score: number | null
          video_url: string | null
          analysis: Json | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          job_id: string
          candidate_id: string
          status?: "pending" | "in_progress" | "completed" | "failed"
          score?: number | null
          video_url?: string | null
          analysis?: Json | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          status?: "pending" | "in_progress" | "completed" | "failed"
          score?: number | null
          video_url?: string | null
          analysis?: Json | null
          completed_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: "free" | "pro" | "enterprise"
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: "active" | "canceled" | "past_due"
          current_period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: "free" | "pro" | "enterprise"
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: "active" | "canceled" | "past_due"
          current_period_end?: string | null
          created_at?: string
        }
        Update: {
          plan?: "free" | "pro" | "enterprise"
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: "active" | "canceled" | "past_due"
          current_period_end?: string | null
        }
        Relationships: []
      }
      copilot_sessions: {
        Row: {
          id: string
          user_id: string
          messages: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          messages?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          messages?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: "candidate" | "recruiter"
      job_status: "active" | "paused" | "closed"
      simulation_status: "pending" | "in_progress" | "completed" | "failed"
      subscription_plan: "free" | "pro" | "enterprise"
    }
    CompositeTypes: Record<string, never>
  }
}
