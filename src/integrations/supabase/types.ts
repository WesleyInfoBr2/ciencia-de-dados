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
      ai_prompts: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          product_slug: string
          prompt_content: string
          prompt_key: string
          prompt_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          product_slug?: string
          prompt_content: string
          prompt_key: string
          prompt_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          product_slug?: string
          prompt_content?: string
          prompt_key?: string
          prompt_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analysis_history: {
        Row: {
          analysis_type: string | null
          created_at: string | null
          dataset_name: string | null
          generated_code: string | null
          id: string
          product_slug: string
          question: string
          result_summary: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          analysis_type?: string | null
          created_at?: string | null
          dataset_name?: string | null
          generated_code?: string | null
          id?: string
          product_slug?: string
          question: string
          result_summary?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_type?: string | null
          created_at?: string | null
          dataset_name?: string | null
          generated_code?: string | null
          id?: string
          product_slug?: string
          question?: string
          result_summary?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_usage: {
        Row: {
          created_at: string | null
          id: string
          product_slug: string
          prompt_count: number
          session_id: string | null
          updated_at: string | null
          usage_date: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_slug?: string
          prompt_count?: number
          session_id?: string | null
          updated_at?: string | null
          usage_date?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_slug?: string
          prompt_count?: number
          session_id?: string | null
          updated_at?: string | null
          usage_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
      historico_buscas: {
        Row: {
          created_at: string | null
          filtros_aplicados: Json | null
          id: string
          resultados_count: number | null
          termo_busca: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filtros_aplicados?: Json | null
          id?: string
          resultados_count?: number | null
          termo_busca: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          filtros_aplicados?: Json | null
          id?: string
          resultados_count?: number | null
          termo_busca?: string
          user_id?: string
        }
        Relationships: []
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
      notification_preferences: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string | null
          frequency:
            | Database["public"]["Enums"]["notification_frequency"]
            | null
          id: string
          is_enabled: boolean | null
          notification_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string | null
          frequency?:
            | Database["public"]["Enums"]["notification_frequency"]
            | null
          id?: string
          is_enabled?: boolean | null
          notification_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string | null
          frequency?:
            | Database["public"]["Enums"]["notification_frequency"]
            | null
          id?: string
          is_enabled?: boolean | null
          notification_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_notification_type_fkey"
            columns: ["notification_type"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_types: {
        Row: {
          category: string
          created_at: string | null
          default_channels:
            | Database["public"]["Enums"]["notification_channel"][]
            | null
          description: string | null
          icon: string | null
          id: string
          label: string
        }
        Insert: {
          category: string
          created_at?: string | null
          default_channels?:
            | Database["public"]["Enums"]["notification_channel"][]
            | null
          description?: string | null
          icon?: string | null
          id: string
          label: string
        }
        Update: {
          category?: string
          created_at?: string | null
          default_channels?:
            | Database["public"]["Enums"]["notification_channel"][]
            | null
          description?: string | null
          icon?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          channels_sent:
            | Database["public"]["Enums"]["notification_channel"][]
            | null
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          metadata: Json | null
          notification_type: string
          read_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          channels_sent?:
            | Database["public"]["Enums"]["notification_channel"][]
            | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          channels_sent?:
            | Database["public"]["Enums"]["notification_channel"][]
            | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_notification_type_fkey"
            columns: ["notification_type"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
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
      product_plan_config: {
        Row: {
          allowed_export_formats: string[]
          allowed_file_formats: string[]
          analysis_types: string[]
          created_at: string | null
          daily_prompt_limit: number | null
          has_api_access: boolean | null
          has_custom_reports: boolean | null
          has_visualization_advanced: boolean | null
          history_retention_days: number | null
          id: string
          max_dataset_rows: number | null
          plan: string
          product_slug: string
          support_level: string | null
          updated_at: string | null
        }
        Insert: {
          allowed_export_formats?: string[]
          allowed_file_formats?: string[]
          analysis_types?: string[]
          created_at?: string | null
          daily_prompt_limit?: number | null
          has_api_access?: boolean | null
          has_custom_reports?: boolean | null
          has_visualization_advanced?: boolean | null
          history_retention_days?: number | null
          id?: string
          max_dataset_rows?: number | null
          plan: string
          product_slug: string
          support_level?: string | null
          updated_at?: string | null
        }
        Update: {
          allowed_export_formats?: string[]
          allowed_file_formats?: string[]
          analysis_types?: string[]
          created_at?: string | null
          daily_prompt_limit?: number | null
          has_api_access?: boolean | null
          has_custom_reports?: boolean | null
          has_visualization_advanced?: boolean | null
          history_retention_days?: number | null
          id?: string
          max_dataset_rows?: number | null
          plan?: string
          product_slug?: string
          support_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      revista_favoritos: {
        Row: {
          created_at: string | null
          id: string
          revista_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          revista_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          revista_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revista_favoritos_revista_id_fkey"
            columns: ["revista_id"]
            isOneToOne: false
            referencedRelation: "revistas"
            referencedColumns: ["id"]
          },
        ]
      }
      revistas: {
        Row: {
          acesso_aberto: boolean | null
          acesso_aberto_diamante: boolean | null
          area_qualis: string | null
          area_sjr: string | null
          cobertura: string | null
          created_at: string | null
          editora: string | null
          id: number
          id_revista: number | null
          id_sjr: string | null
          issn: string | null
          issn_formatado: string | null
          pais: string | null
          qualis: string | null
          rank_sjr: number | null
          região: string | null
          sjr: string | null
          sjr_categorias: string | null
          sjr_continuo: number | null
          tipo: string | null
          title: string | null
          titulo: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          acesso_aberto?: boolean | null
          acesso_aberto_diamante?: boolean | null
          area_qualis?: string | null
          area_sjr?: string | null
          cobertura?: string | null
          created_at?: string | null
          editora?: string | null
          id?: number
          id_revista?: number | null
          id_sjr?: string | null
          issn?: string | null
          issn_formatado?: string | null
          pais?: string | null
          qualis?: string | null
          rank_sjr?: number | null
          região?: string | null
          sjr?: string | null
          sjr_categorias?: string | null
          sjr_continuo?: number | null
          tipo?: string | null
          title?: string | null
          titulo: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          acesso_aberto?: boolean | null
          acesso_aberto_diamante?: boolean | null
          area_qualis?: string | null
          area_sjr?: string | null
          cobertura?: string | null
          created_at?: string | null
          editora?: string | null
          id?: number
          id_revista?: number | null
          id_sjr?: string | null
          issn?: string | null
          issn_formatado?: string | null
          pais?: string | null
          qualis?: string | null
          rank_sjr?: number | null
          região?: string | null
          sjr?: string | null
          sjr_categorias?: string | null
          sjr_continuo?: number | null
          tipo?: string | null
          title?: string | null
          titulo?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      revistas_gestao: {
        Row: {
          created_at: string
          custo: string | null
          editora: string | null
          escopo: string | null
          id: number
          idiomas: string[] | null
          issn: string[] | null
          link: string | null
          periodicidade: string | null
          qualis: string | null
          sjr: string | null
          titulo: string | null
        }
        Insert: {
          created_at?: string
          custo?: string | null
          editora?: string | null
          escopo?: string | null
          id?: number
          idiomas?: string[] | null
          issn?: string[] | null
          link?: string | null
          periodicidade?: string | null
          qualis?: string | null
          sjr?: string | null
          titulo?: string | null
        }
        Update: {
          created_at?: string
          custo?: string | null
          editora?: string | null
          escopo?: string | null
          id?: number
          idiomas?: string[] | null
          issn?: string[] | null
          link?: string | null
          periodicidade?: string | null
          qualis?: string | null
          sjr?: string | null
          titulo?: string | null
        }
        Relationships: []
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
      task_types: {
        Row: {
          color: string | null
          created_at: string | null
          default_assignee_role: Database["public"]["Enums"]["app_role"] | null
          description: string | null
          icon: string | null
          id: string
          label: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          default_assignee_role?: Database["public"]["Enums"]["app_role"] | null
          description?: string | null
          icon?: string | null
          id: string
          label: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          default_assignee_role?: Database["public"]["Enums"]["app_role"] | null
          description?: string | null
          icon?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_type: string
          title: string
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type: string
          title: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type?: string
          title?: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_task_type_fkey"
            columns: ["task_type"]
            isOneToOne: false
            referencedRelation: "task_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
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
      wiki_post_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          guest_name: string | null
          id: string
          is_approved: boolean | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          guest_name?: string | null
          id?: string
          is_approved?: boolean | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          guest_name?: string | null
          id?: string
          is_approved?: boolean | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "wiki_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_post_likes: {
        Row: {
          created_at: string | null
          guest_fingerprint: string | null
          id: string
          post_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          guest_fingerprint?: string | null
          id?: string
          post_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          guest_fingerprint?: string | null
          id?: string
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "wiki_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_post_versions: {
        Row: {
          content: Json
          cover_image_url: string | null
          created_at: string | null
          edited_by: string | null
          excerpt: string | null
          icon: string | null
          id: string
          post_id: string
          tags: string[] | null
          title: string
        }
        Insert: {
          content: Json
          cover_image_url?: string | null
          created_at?: string | null
          edited_by?: string | null
          excerpt?: string | null
          icon?: string | null
          id?: string
          post_id: string
          tags?: string[] | null
          title: string
        }
        Update: {
          content?: Json
          cover_image_url?: string | null
          created_at?: string | null
          edited_by?: string | null
          excerpt?: string | null
          icon?: string | null
          id?: string
          post_id?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_post_versions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "wiki_posts"
            referencedColumns: ["id"]
          },
        ]
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
      workflows: {
        Row: {
          actions: Json
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_created_by_fkey"
            columns: ["created_by"]
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
      buscar_revistas: {
        Args: {
          apenas_open_access?: boolean
          filtro_area_qualis?: string
          filtro_area_sjr?: string
          filtro_qualis?: string[]
          limite?: number
          offset_val?: number
          sjr_max?: number
          sjr_min?: number
          termo_busca?: string
        }
        Returns: {
          area_qualis: string
          area_sjr: string
          editora: string
          h_index: number
          id: number
          id_revista: number
          issn: string
          issn_online: string
          open_access: boolean
          pais: string
          qualis: string
          sjr: number
          title: string
          titulo: string
          url: string
        }[]
      }
      check_product_access: {
        Args: { _product_slug: string; _user_id: string }
        Returns: {
          access_level: string
          has_access: boolean
          usage_count: number
          usage_limit: number
        }[]
      }
      get_daily_usage: {
        Args: {
          _product_slug?: string
          _session_id?: string
          _user_id?: string
        }
        Returns: number
      }
      get_members_count: { Args: never; Returns: number }
      get_public_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          username: string
        }[]
      }
      get_unread_notification_count: { Args: never; Returns: number }
      get_user_plan_config: {
        Args: { _product_slug?: string; _user_id?: string }
        Returns: {
          allowed_export_formats: string[]
          allowed_file_formats: string[]
          analysis_types: string[]
          daily_prompt_limit: number
          has_api_access: boolean
          has_custom_reports: boolean
          has_visualization_advanced: boolean
          history_retention_days: number
          max_dataset_rows: number
          plan: string
          support_level: string
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
      increment_daily_usage: {
        Args: {
          _product_slug?: string
          _session_id?: string
          _user_id?: string
        }
        Returns: number
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_notification_read: {
        Args: { notification_id: string }
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
      notification_channel: "email" | "push" | "in_app"
      notification_frequency: "each" | "daily" | "weekly" | "monthly" | "never"
      organization_plan: "free" | "basic" | "premium" | "enterprise"
      project_status: "planning" | "in_progress" | "completed" | "on_hold"
      subscription_plan: "gratuito" | "limitado" | "ilimitado"
      subscription_status: "active" | "expired" | "cancelled" | "pending"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
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
      notification_channel: ["email", "push", "in_app"],
      notification_frequency: ["each", "daily", "weekly", "monthly", "never"],
      organization_plan: ["free", "basic", "premium", "enterprise"],
      project_status: ["planning", "in_progress", "completed", "on_hold"],
      subscription_plan: ["gratuito", "limitado", "ilimitado"],
      subscription_status: ["active", "expired", "cancelled", "pending"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      wiki_post_type: ["conteudo", "como_fazer", "aplicacao_pratica"],
    },
  },
} as const
