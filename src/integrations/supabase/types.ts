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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      entitlements: {
        Row: {
          created_at: string | null
          id: string
          org_id: string
          plan: string | null
          product_id: string
          status: Database["public"]["Enums"]["entitlement_status"] | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          org_id: string
          plan?: string | null
          product_id: string
          status?: Database["public"]["Enums"]["entitlement_status"] | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string
          plan?: string | null
          product_id?: string
          status?: Database["public"]["Enums"]["entitlement_status"] | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      libraries: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          library_type: Database["public"]["Enums"]["library_type"]
          sort_order: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          library_type: Database["public"]["Enums"]["library_type"]
          sort_order?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          library_type?: Database["public"]["Enums"]["library_type"]
          sort_order?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string | null
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
          plan: Database["public"]["Enums"]["organization_plan"] | null
          slug: string
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
          plan?: Database["public"]["Enums"]["organization_plan"] | null
          slug: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          plan?: Database["public"]["Enums"]["organization_plan"] | null
          slug?: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          base_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          base_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          social_networks: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          social_networks?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          social_networks?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      wiki_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      wiki_posts: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          post_type: Database["public"]["Enums"]["wiki_post_type"]
          published_at: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          post_type: Database["public"]["Enums"]["wiki_post_type"]
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          post_type?: Database["public"]["Enums"]["wiki_post_type"]
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "wiki_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role_in_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "member"
      entitlement_status: "active" | "inactive" | "trial" | "expired"
      library_type:
        | "ferramentas"
        | "formacoes"
        | "livros"
        | "codigos"
        | "bancos_dados"
      organization_plan: "free" | "basic" | "premium" | "enterprise"
      wiki_post_type: "conteudo" | "como_fazer" | "aplicacao_pratica"
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
      app_role: ["owner", "admin", "member"],
      entitlement_status: ["active", "inactive", "trial", "expired"],
      library_type: [
        "ferramentas",
        "formacoes",
        "livros",
        "codigos",
        "bancos_dados",
      ],
      organization_plan: ["free", "basic", "premium", "enterprise"],
      wiki_post_type: ["conteudo", "como_fazer", "aplicacao_pratica"],
    },
  },
} as const
