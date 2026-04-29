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
      ai_chat_messages: {
        Row: {
          content: Json
          created_at: string
          id: string
          role: string
          seq: number
          session_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          role: string
          seq?: number
          session_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          role?: string
          seq?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_sessions_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          allocated_paise: number
          category: string
          created_at: string
          id: string
          spent_paise: number
          wedding_id: string
        }
        Insert: {
          allocated_paise?: number
          category: string
          created_at?: string
          id?: string
          spent_paise?: number
          wedding_id: string
        }
        Update: {
          allocated_paise?: number
          category?: string
          created_at?: string
          id?: string
          spent_paise?: number
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      company_employee_invites: {
        Row: {
          claimed_at: string | null
          claimed_by_user_id: string | null
          created_at: string
          delivery_channel: string
          employee_id: string
          expires_at: string
          id: string
          last_sent_at: string
          owner_user_id: string
          revoked_at: string | null
          token: string | null
          token_hash: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          created_at?: string
          delivery_channel?: string
          employee_id: string
          expires_at: string
          id?: string
          last_sent_at?: string
          owner_user_id: string
          revoked_at?: string | null
          token?: string | null
          token_hash: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          created_at?: string
          delivery_channel?: string
          employee_id?: string
          expires_at?: string
          id?: string
          last_sent_at?: string
          owner_user_id?: string
          revoked_at?: string | null
          token?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_employee_invites_claimed_by_user_id_fkey"
            columns: ["claimed_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employee_invites_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "company_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employee_invites_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_employees: {
        Row: {
          created_at: string
          email: string | null
          employment_status: Database["public"]["Enums"]["company_employee_status"]
          id: string
          invited_at: string | null
          name: string
          owner_user_id: string
          phone: string
          role: Database["public"]["Enums"]["company_employee_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          employment_status?: Database["public"]["Enums"]["company_employee_status"]
          id?: string
          invited_at?: string | null
          name: string
          owner_user_id: string
          phone: string
          role?: Database["public"]["Enums"]["company_employee_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          employment_status?: Database["public"]["Enums"]["company_employee_status"]
          id?: string
          invited_at?: string | null
          name?: string
          owner_user_id?: string
          phone?: string
          role?: Database["public"]["Enums"]["company_employee_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_employees_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          created_by_user_id: string | null
          description: string | null
          file_name: string | null
          file_size_bytes: number | null
          file_type: string | null
          file_url: string | null
          id: string
          title: string
          vendor_id: string | null
          wedding_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          title: string
          vendor_id?: string | null
          wedding_id: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          title?: string
          vendor_id?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      message_thread_members: {
        Row: {
          added_by_user_id: string | null
          created_at: string
          thread_id: string
          user_id: string
        }
        Insert: {
          added_by_user_id?: string | null
          created_at?: string
          thread_id: string
          user_id: string
        }
        Update: {
          added_by_user_id?: string | null
          created_at?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_thread_members_added_by_user_id_fkey"
            columns: ["added_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_thread_members_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_thread_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          id: string
          is_default: boolean
          title: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_default?: boolean
          title: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_default?: boolean
          title?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          author_user_id: string | null
          body: string
          created_at: string
          id: string
          thread_id: string
          wedding_id: string
        }
        Insert: {
          author_user_id?: string | null
          body: string
          created_at?: string
          id?: string
          thread_id: string
          wedding_id: string
        }
        Update: {
          author_user_id?: string | null
          body?: string
          created_at?: string
          id?: string
          thread_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          author_user_id: string | null
          body: string
          created_at: string
          id: string
          is_system: boolean
          task_id: string
          wedding_id: string
        }
        Insert: {
          author_user_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_system?: boolean
          task_id: string
          wedding_id: string
        }
        Update: {
          author_user_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_system?: boolean
          task_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_user_id: string | null
          assignee_user_ids: string[]
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          linked_event_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          raised_by_user_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          visibility: Database["public"]["Enums"]["task_visibility"][]
          wedding_id: string
        }
        Insert: {
          assignee_user_id?: string | null
          assignee_user_ids?: string[]
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_event_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          raised_by_user_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          visibility?: Database["public"]["Enums"]["task_visibility"][]
          wedding_id: string
        }
        Update: {
          assignee_user_id?: string | null
          assignee_user_ids?: string[]
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_event_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          raised_by_user_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          visibility?: Database["public"]["Enums"]["task_visibility"][]
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_user_id_fkey"
            columns: ["assignee_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_linked_event_id_fkey"
            columns: ["linked_event_id"]
            isOneToOne: false
            referencedRelation: "wedding_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_raised_by_user_id_fkey"
            columns: ["raised_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_invites: {
        Row: {
          claimed_at: string | null
          claimed_by_user_id: string | null
          created_at: string
          delivery_channel: string
          expires_at: string
          id: string
          last_sent_at: string
          owner_user_id: string
          revoked_at: string | null
          token: string | null
          token_hash: string
          vendor_id: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          created_at?: string
          delivery_channel?: string
          expires_at: string
          id?: string
          last_sent_at?: string
          owner_user_id: string
          revoked_at?: string | null
          token?: string | null
          token_hash: string
          vendor_id: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          created_at?: string
          delivery_channel?: string
          expires_at?: string
          id?: string
          last_sent_at?: string
          owner_user_id?: string
          revoked_at?: string | null
          token?: string | null
          token_hash?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_invites_claimed_by_user_id_fkey"
            columns: ["claimed_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_invites_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_invites_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payments: {
        Row: {
          amount_paise: number
          created_at: string
          created_by_user_id: string | null
          id: string
          note: string | null
          paid_at: string
          vendor_id: string
          wedding_id: string
        }
        Insert: {
          amount_paise: number
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          note?: string | null
          paid_at?: string
          vendor_id: string
          wedding_id: string
        }
        Update: {
          amount_paise?: number
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          note?: string | null
          paid_at?: string
          vendor_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          advance_paid_paise: number
          category: string
          created_at: string
          email: string | null
          id: string
          instagram_handle: string | null
          invite_status: string
          invited_at: string | null
          name: string
          notes: string | null
          phone: string | null
          quoted_price_paise: number
          status: Database["public"]["Enums"]["vendor_status"]
          user_id: string | null
          website_url: string | null
          wedding_id: string
          whatsapp_invite_status: string
          whatsapp_invited_at: string | null
        }
        Insert: {
          address?: string | null
          advance_paid_paise?: number
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          instagram_handle?: string | null
          invite_status?: string
          invited_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          quoted_price_paise?: number
          status?: Database["public"]["Enums"]["vendor_status"]
          user_id?: string | null
          website_url?: string | null
          wedding_id: string
          whatsapp_invite_status?: string
          whatsapp_invited_at?: string | null
        }
        Update: {
          address?: string | null
          advance_paid_paise?: number
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          instagram_handle?: string | null
          invite_status?: string
          invited_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          quoted_price_paise?: number
          status?: Database["public"]["Enums"]["vendor_status"]
          user_id?: string | null
          website_url?: string | null
          wedding_id?: string
          whatsapp_invite_status?: string
          whatsapp_invited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_events: {
        Row: {
          created_at: string
          culture_label: string | null
          end_time: string | null
          event_date: string | null
          id: string
          notes: string | null
          start_time: string | null
          title: string
          venue: string | null
          venue_address: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          culture_label?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          title: string
          venue?: string | null
          venue_address?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          culture_label?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          title?: string
          venue?: string | null
          venue_address?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_events_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_members: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          invited_email: string | null
          role: Database["public"]["Enums"]["wedding_member_role"]
          status: Database["public"]["Enums"]["wedding_member_status"]
          user_id: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          invited_email?: string | null
          role?: Database["public"]["Enums"]["wedding_member_role"]
          status?: Database["public"]["Enums"]["wedding_member_status"]
          user_id?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          invited_email?: string | null
          role?: Database["public"]["Enums"]["wedding_member_role"]
          status?: Database["public"]["Enums"]["wedding_member_status"]
          user_id?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_members_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          bride_name: string
          city: string | null
          couple_name: string
          created_at: string
          creator_id: string
          cultures: string[]
          groom_name: string
          id: string
          slug: string
          spent_budget_paise: number
          status: Database["public"]["Enums"]["wedding_status"]
          total_budget_paise: number
          updated_at: string
          venue_name: string | null
          wedding_date: string | null
        }
        Insert: {
          bride_name: string
          city?: string | null
          couple_name: string
          created_at?: string
          creator_id: string
          cultures?: string[]
          groom_name: string
          id?: string
          slug: string
          spent_budget_paise?: number
          status?: Database["public"]["Enums"]["wedding_status"]
          total_budget_paise?: number
          updated_at?: string
          venue_name?: string | null
          wedding_date?: string | null
        }
        Update: {
          bride_name?: string
          city?: string | null
          couple_name?: string
          created_at?: string
          creator_id?: string
          cultures?: string[]
          groom_name?: string
          id?: string
          slug?: string
          spent_budget_paise?: number
          status?: Database["public"]["Enums"]["wedding_status"]
          total_budget_paise?: number
          updated_at?: string
          venue_name?: string | null
          wedding_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weddings_creator_id_fkey"
            columns: ["creator_id"]
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
      claim_company_employee_invite: {
        Args: {
          p_token_hash: string
          p_user_email: string
          p_user_id: string
          p_user_phone?: string
        }
        Returns: {
          employee_id: string
          owner_user_id: string
          result: string
        }[]
      }
      claim_vendor_invite: {
        Args: {
          p_token_hash: string
          p_user_email: string
          p_user_id: string
          p_user_phone?: string
        }
        Returns: {
          owner_user_id: string
          result: string
          vendor_id: string
        }[]
      }
      create_wedding_with_events: {
        Args: {
          p_bride_name: string
          p_city?: string
          p_cultures?: string[]
          p_events?: Json
          p_groom_name: string
          p_slug?: string
          p_total_budget_paise?: number
          p_venue_name?: string
          p_wedding_date?: string
        }
        Returns: {
          id: string
          slug: string
        }[]
      }
      is_message_thread_member: {
        Args: { target_thread_id: string }
        Returns: boolean
      }
      is_wedding_admin: {
        Args: { target_wedding_id: string }
        Returns: boolean
      }
      is_wedding_member: {
        Args: { target_wedding_id: string }
        Returns: boolean
      }
    }
    Enums: {
      company_employee_role: "coordinator" | "assistant" | "viewer"
      company_employee_status: "invited" | "active" | "inactive"
      task_priority: "high" | "medium" | "low"
      task_status: "todo" | "in_progress" | "done" | "needs_review"
      task_visibility: "team_only" | "client_family" | "vendor"
      vendor_status: "pending" | "confirmed" | "declined"
      wedding_member_role: "owner" | "lead" | "coordinator" | "viewer"
      wedding_member_status: "active" | "invited" | "removed"
      wedding_status: "upcoming" | "completed" | "cancelled"
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
      company_employee_role: ["coordinator", "assistant", "viewer"],
      company_employee_status: ["invited", "active", "inactive"],
      task_priority: ["high", "medium", "low"],
      task_status: ["todo", "in_progress", "done", "needs_review"],
      task_visibility: ["team_only", "client_family", "vendor"],
      vendor_status: ["pending", "confirmed", "declined"],
      wedding_member_role: ["owner", "lead", "coordinator", "viewer"],
      wedding_member_status: ["active", "invited", "removed"],
      wedding_status: ["upcoming", "completed", "cancelled"],
    },
  },
} as const
