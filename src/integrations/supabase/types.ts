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
      event_registrations: {
        Row: {
          attended: boolean | null
          event_id: string
          id: string
          registered_at: string | null
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id: string
          id?: string
          registered_at?: string | null
          user_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string
          id?: string
          registered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          current_attendees: number | null
          description: string | null
          end_date: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_url: string | null
          organizer_id: string
          price: number | null
          slug: string
          start_date: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_url?: string | null
          organizer_id: string
          price?: number | null
          slug: string
          start_date: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_url?: string | null
          organizer_id?: string
          price?: number | null
          slug?: string
          start_date?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      library_files: {
        Row: {
          created_at: string | null
          file_size: number | null
          file_url: string
          filename: string
          id: string
          library_item_id: string | null
          mime_type: string | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          file_url: string
          filename: string
          id?: string
          library_item_id?: string | null
          mime_type?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          file_url?: string
          filename?: string
          id?: string
          library_item_id?: string | null
          mime_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_files_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          attributes: Json | null
          category: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          name: string
          price: string
          short_description: string | null
          slug: string
          status: string | null
          tags: string[] | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          attributes?: Json | null
          category: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          price?: string
          short_description?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          attributes?: Json | null
          category?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          price?: string
          short_description?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website_url?: string | null
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
      product_access: {
        Row: {
          access_type: string
          expires_at: string | null
          granted_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          product_id: string
          usage_count: number | null
          usage_limit: number | null
          user_id: string
        }
        Insert: {
          access_type: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          product_id: string
          usage_count?: number | null
          usage_limit?: number | null
          user_id: string
        }
        Update: {
          access_type?: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          product_id?: string
          usage_count?: number | null
          usage_limit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_access_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_url: string | null
          created_at: string | null
          custom_domain: string | null
          description: string | null
          features: Json | null
          github_repo_url: string | null
          id: string
          is_available: boolean | null
          is_public: boolean | null
          launch_date: string | null
          name: string
          pricing: Json | null
          slug: string
          status: string | null
          supabase_project_id: string | null
          updated_at: string | null
        }
        Insert: {
          base_url?: string | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          features?: Json | null
          github_repo_url?: string | null
          id?: string
          is_available?: boolean | null
          is_public?: boolean | null
          launch_date?: string | null
          name: string
          pricing?: Json | null
          slug: string
          status?: string | null
          supabase_project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          base_url?: string | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          features?: Json | null
          github_repo_url?: string | null
          id?: string
          is_available?: boolean | null
          is_public?: boolean | null
          launch_date?: string | null
          name?: string
          pricing?: Json | null
          slug?: string
          status?: string | null
          supabase_project_id?: string | null
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
      project_likes: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          author_id: string
          content: string | null
          created_at: string | null
          demo_url: string | null
          description: string | null
          difficulty_level: Database["public"]["Enums"]["course_level"]
          id: string
          industry: string | null
          is_featured: boolean | null
          is_public: boolean | null
          likes_count: number | null
          repository_url: string | null
          slug: string
          status: Database["public"]["Enums"]["project_status"]
          tags: string[] | null
          technologies: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id: string
          content?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["course_level"]
          id?: string
          industry?: string | null
          is_featured?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          repository_url?: string | null
          slug: string
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          technologies?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string
          content?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["course_level"]
          id?: string
          industry?: string | null
          is_featured?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          repository_url?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          technologies?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      technologies: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty_level: Database["public"]["Enums"]["course_level"] | null
          documentation_url: string | null
          id: string
          is_featured: boolean | null
          logo_url: string | null
          name: string
          popularity_score: number | null
          slug: string
          tags: string[] | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["course_level"] | null
          documentation_url?: string | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          name: string
          popularity_score?: number | null
          slug: string
          tags?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["course_level"] | null
          documentation_url?: string | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          name?: string
          popularity_score?: number | null
          slug?: string
          tags?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          added_date: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_free: boolean | null
          is_online: boolean | null
          name: string
          status: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          added_date?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_free?: boolean | null
          is_online?: boolean | null
          name: string
          status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          added_date?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_free?: boolean | null
          is_online?: boolean | null
          name?: string
          status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          product_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          product_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wiki_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
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
          content: Json
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          icon: string | null
          id: string
          is_published: boolean | null
          post_type: Database["public"]["Enums"]["wiki_post_type"] | null
          properties: Json | null
          published_at: string | null
          reading_time: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: Json
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          post_type?: Database["public"]["Enums"]["wiki_post_type"] | null
          properties?: Json | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: Json
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          post_type?: Database["public"]["Enums"]["wiki_post_type"] | null
          properties?: Json | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          tags?: string[] | null
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
      wiki_revisions: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          post_id: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          post_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_revisions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "wiki_posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_product_access: {
        Args: { _product_slug: string; _user_id: string }
        Returns: {
          access_level: string
          has_access: boolean
          usage_count: number
          usage_limit: number
        }[]
      }
      get_public_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          username: string
        }[]
      }
      get_user_role_in_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_subscription: {
        Args: { _user_id: string }
        Returns: {
          expires_at: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "owner" | "admin" | "member"
      course_level: "beginner" | "intermediate" | "advanced"
      course_status: "draft" | "published" | "archived"
      dataset_format: "csv" | "json" | "parquet" | "xlsx" | "sql" | "other"
      enrollment_status: "enrolled" | "completed" | "dropped" | "in_progress"
      entitlement_status: "active" | "inactive" | "trial" | "expired"
      event_type: "workshop" | "webinar" | "meetup" | "conference" | "hackathon"
      library_category: "tools" | "courses" | "codes" | "sources" | "datasets"
      library_price: "free" | "paid" | "freemium" | "subscription"
      library_type:
        | "ferramentas"
        | "formacoes"
        | "livros"
        | "codigos"
        | "bancos_dados"
      organization_plan: "free" | "basic" | "premium" | "enterprise"
      project_status: "planning" | "in_progress" | "completed" | "on_hold"
      subscription_plan: "gratuito" | "limitado" | "ilimitado"
      subscription_status: "active" | "expired" | "cancelled" | "pending"
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
      course_level: ["beginner", "intermediate", "advanced"],
      course_status: ["draft", "published", "archived"],
      dataset_format: ["csv", "json", "parquet", "xlsx", "sql", "other"],
      enrollment_status: ["enrolled", "completed", "dropped", "in_progress"],
      entitlement_status: ["active", "inactive", "trial", "expired"],
      event_type: ["workshop", "webinar", "meetup", "conference", "hackathon"],
      library_category: ["tools", "courses", "codes", "sources", "datasets"],
      library_price: ["free", "paid", "freemium", "subscription"],
      library_type: [
        "ferramentas",
        "formacoes",
        "livros",
        "codigos",
        "bancos_dados",
      ],
      organization_plan: ["free", "basic", "premium", "enterprise"],
      project_status: ["planning", "in_progress", "completed", "on_hold"],
      subscription_plan: ["gratuito", "limitado", "ilimitado"],
      subscription_status: ["active", "expired", "cancelled", "pending"],
      wiki_post_type: ["conteudo", "como_fazer", "aplicacao_pratica"],
    },
  },
} as const
