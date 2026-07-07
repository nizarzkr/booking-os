// Types générés depuis le schéma Supabase (étape 0.2).
// Régénérer après un changement de schéma : `npm run db:types`
// (ou via le MCP Supabase `generate_typescript_types`).

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
      artist_media: {
        Row: {
          created_at: string
          id: string
          title: string
          url: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          url: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          url?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_media_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_profiles: {
        Row: {
          apple_music_url: string | null
          bandcamp_url: string | null
          created_at: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          soundcloud_url: string | null
          spotify_url: string | null
          tiktok_url: string | null
          workspace_id: string
          youtube_url: string | null
        }
        Insert: {
          apple_music_url?: string | null
          bandcamp_url?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          tiktok_url?: string | null
          workspace_id: string
          youtube_url?: string | null
        }
        Update: {
          apple_music_url?: string | null
          bandcamp_url?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          tiktok_url?: string | null
          workspace_id?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_organizations: {
        Row: {
          contact_id: string
          organization_id: string
        }
        Insert: {
          contact_id: string
          organization_id: string
        }
        Update: {
          contact_id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_organizations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["contact_role"] | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["contact_role"] | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["contact_role"] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          body: string | null
          contact_id: string | null
          direction: Database["public"]["Enums"]["email_direction"]
          gmail_message_id: string | null
          gmail_thread_id: string | null
          id: string
          opportunity_id: string | null
          read: boolean
          sent_at: string
          subject: string | null
          workspace_id: string
        }
        Insert: {
          body?: string | null
          contact_id?: string | null
          direction: Database["public"]["Enums"]["email_direction"]
          gmail_message_id?: string | null
          gmail_thread_id?: string | null
          id?: string
          opportunity_id?: string | null
          read?: boolean
          sent_at?: string
          subject?: string | null
          workspace_id: string
        }
        Update: {
          body?: string | null
          contact_id?: string | null
          direction?: Database["public"]["Enums"]["email_direction"]
          gmail_message_id?: string | null
          gmail_thread_id?: string | null
          id?: string
          opportunity_id?: string | null
          read?: boolean
          sent_at?: string
          subject?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          subject: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          name: string
          subject?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      gmail_tokens: {
        Row: {
          access_token: string
          created_at: string
          email: string
          expires_at: string | null
          id: string
          refresh_token: string
          workspace_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          refresh_token: string
          workspace_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gmail_tokens_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          city: string | null
          contact_id: string | null
          created_at: string
          fee: number | null
          gig_date: string | null
          google_calendar_event_id: string | null
          id: string
          notes: string | null
          organization_id: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          title: string
          updated_at: string
          venue: string | null
          workspace_id: string
        }
        Insert: {
          city?: string | null
          contact_id?: string | null
          created_at?: string
          fee?: number | null
          gig_date?: string | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          title: string
          updated_at?: string
          venue?: string | null
          workspace_id: string
        }
        Update: {
          city?: string | null
          contact_id?: string | null
          created_at?: string
          fee?: number | null
          gig_date?: string | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          title?: string
          updated_at?: string
          venue?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          type: Database["public"]["Enums"]["organization_type"] | null
          website: string | null
          workspace_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          type?: Database["public"]["Enums"]["organization_type"] | null
          website?: string | null
          workspace_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          type?: Database["public"]["Enums"]["organization_type"] | null
          website?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_enrollments: {
        Row: {
          contact_id: string
          created_at: string
          current_step: number
          id: string
          next_send_at: string | null
          sequence_id: string
          status: string
          stop_reason: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          current_step?: number
          id?: string
          next_send_at?: string | null
          sequence_id: string
          status?: string
          stop_reason?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          current_step?: number
          id?: string
          next_send_at?: string | null
          sequence_id?: string
          status?: string
          stop_reason?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_enrollments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_enrollments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_steps: {
        Row: {
          body: string
          created_at: string
          delay_days: number
          id: string
          sequence_id: string
          step_order: number
          subject: string
          workspace_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          delay_days?: number
          id?: string
          sequence_id: string
          step_order?: number
          subject?: string
          workspace_id: string
        }
        Update: {
          body?: string
          created_at?: string
          delay_days?: number
          id?: string
          sequence_id?: string
          step_order?: number
          subject?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_steps_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sequences: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequences_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          contact_id: string | null
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          opportunity_id: string | null
          title: string
          workspace_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          opportunity_id?: string | null
          title: string
          workspace_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          opportunity_id?: string | null
          title?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          city: string | null
          created_at: string
          email_signature: string | null
          id: string
          name: string
          owner_id: string
          reply_to: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email_signature?: string | null
          id?: string
          name: string
          owner_id: string
          reply_to?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email_signature?: string | null
          id?: string
          name?: string
          owner_id?: string
          reply_to?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contact_role:
        | "booker"
        | "programmateur"
        | "agent"
        | "label"
        | "presse"
        | "autre"
      email_direction: "outbound" | "inbound"
      opportunity_status:
        | "prospect"
        | "contacted"
        | "negotiation"
        | "option"
        | "confirmed"
        | "cancelled"
      organization_type: "salle" | "festival" | "agence" | "label" | "autre"
      user_role: "owner" | "member"
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
      contact_role: [
        "booker",
        "programmateur",
        "agent",
        "label",
        "presse",
        "autre",
      ],
      email_direction: ["outbound", "inbound"],
      opportunity_status: [
        "prospect",
        "contacted",
        "negotiation",
        "option",
        "confirmed",
        "cancelled",
      ],
      organization_type: ["salle", "festival", "agence", "label", "autre"],
      user_role: ["owner", "member"],
    },
  },
} as const
