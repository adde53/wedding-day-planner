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
      budget_items: {
        Row: {
          actual_cost: number
          category: string
          created_at: string
          estimated_cost: number
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_cost?: number
          category: string
          created_at?: string
          estimated_cost?: number
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_cost?: number
          category?: string
          created_at?: string
          estimated_cost?: number
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      checklists: {
        Row: {
          category: string
          completed: boolean
          created_at: string
          deadline: string | null
          id: string
          task: string
          timeframe: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          completed?: boolean
          created_at?: string
          deadline?: string | null
          id?: string
          task: string
          timeframe?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          created_at?: string
          deadline?: string | null
          id?: string
          task?: string
          timeframe?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      guests: {
        Row: {
          access_code: string | null
          created_at: string
          dietary_restrictions: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          plus_one: boolean | null
          plus_one_name: string | null
          rsvp_date: string | null
          rsvp_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_code?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean | null
          plus_one_name?: string | null
          rsvp_date?: string | null
          rsvp_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_code?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          plus_one?: boolean | null
          plus_one_name?: string | null
          rsvp_date?: string | null
          rsvp_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          partner_name: string | null
          trial_started_at: string | null
          updated_at: string
          user_id: string
          wedding_date: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          partner_name?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
          wedding_date?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          partner_name?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
          wedding_date?: string | null
        }
        Relationships: []
      }
      seating_chairs: {
        Row: {
          chair_index: number
          created_at: string
          guest_id: string | null
          id: string
          table_id: string
          updated_at: string
        }
        Insert: {
          chair_index: number
          created_at?: string
          guest_id?: string | null
          id?: string
          table_id: string
          updated_at?: string
        }
        Update: {
          chair_index?: number
          created_at?: string
          guest_id?: string | null
          id?: string
          table_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seating_chairs_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seating_chairs_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "seating_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      seating_tables: {
        Row: {
          capacity: number
          created_at: string
          id: string
          name: string
          position_x: number
          position_y: number
          rotation: number
          shape: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          name: string
          position_x?: number
          position_y?: number
          rotation?: number
          shape?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          position_x?: number
          position_y?: number
          rotation?: number
          shape?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wedding_photos: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          photo_url: string
          website_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          photo_url: string
          website_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          photo_url?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_photos_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "wedding_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_websites: {
        Row: {
          additional_info: string | null
          ceremony_address: string | null
          ceremony_location: string | null
          ceremony_time: string | null
          couple_description: string | null
          couple_names: string | null
          couple_photo_url: string | null
          created_at: string
          font_family: string | null
          id: string
          is_published: boolean
          our_story: string | null
          primary_color: string | null
          reception_address: string | null
          reception_location: string | null
          secondary_color: string | null
          slug: string
          theme: string
          updated_at: string
          user_id: string
          wedding_date: string | null
        }
        Insert: {
          additional_info?: string | null
          ceremony_address?: string | null
          ceremony_location?: string | null
          ceremony_time?: string | null
          couple_description?: string | null
          couple_names?: string | null
          couple_photo_url?: string | null
          created_at?: string
          font_family?: string | null
          id?: string
          is_published?: boolean
          our_story?: string | null
          primary_color?: string | null
          reception_address?: string | null
          reception_location?: string | null
          secondary_color?: string | null
          slug: string
          theme?: string
          updated_at?: string
          user_id: string
          wedding_date?: string | null
        }
        Update: {
          additional_info?: string | null
          ceremony_address?: string | null
          ceremony_location?: string | null
          ceremony_time?: string | null
          couple_description?: string | null
          couple_names?: string | null
          couple_photo_url?: string | null
          created_at?: string
          font_family?: string | null
          id?: string
          is_published?: boolean
          our_story?: string | null
          primary_color?: string | null
          reception_address?: string | null
          reception_location?: string | null
          secondary_color?: string | null
          slug?: string
          theme?: string
          updated_at?: string
          user_id?: string
          wedding_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_access_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
