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
      documents: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          file_url: string | null
          id: string
          title: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          file_url?: string | null
          id?: string
          title: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          file_url?: string | null
          id?: string
          title?: string
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
            foreignKeyName: "documents_wedding_id_fkey"
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
          wedding_id: string
        }
        Insert: {
          author_user_id?: string | null
          body: string
          created_at?: string
          id?: string
          wedding_id: string
        }
        Update: {
          author_user_id?: string | null
          body?: string
          created_at?: string
          id?: string
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
      tasks: {
        Row: {
          assignee_user_id: string | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          wedding_id: string
        }
        Insert: {
          assignee_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          wedding_id: string
        }
        Update: {
          assignee_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
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
            foreignKeyName: "tasks_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          notes: string | null
          status: Database["public"]["Enums"]["vendor_status"]
          wedding_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          status?: Database["public"]["Enums"]["vendor_status"]
          wedding_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["vendor_status"]
          wedding_id?: string
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
          event_date: string | null
          id: string
          title: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          culture_label?: string | null
          event_date?: string | null
          id?: string
          title: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          culture_label?: string | null
          event_date?: string | null
          id?: string
          title?: string
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
      task_status: "todo" | "in_progress" | "done"
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
      task_status: ["todo", "in_progress", "done"],
      vendor_status: ["pending", "confirmed", "declined"],
      wedding_member_role: ["owner", "lead", "coordinator", "viewer"],
      wedding_member_status: ["active", "invited", "removed"],
      wedding_status: ["upcoming", "completed", "cancelled"],
    },
  },
} as const
