export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      competitor_analysis: {
        Row: {
          analysis_status: string
          competitor_video_id: string
          created_at: string
          feedback_data: Json
          id: string
          overall_score: number
          updated_at: string
        }
        Insert: {
          analysis_status?: string
          competitor_video_id: string
          created_at?: string
          feedback_data: Json
          id?: string
          overall_score: number
          updated_at?: string
        }
        Update: {
          analysis_status?: string
          competitor_video_id?: string
          created_at?: string
          feedback_data?: Json
          id?: string
          overall_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_analysis_competitor_video_id_fkey"
            columns: ["competitor_video_id"]
            isOneToOne: false
            referencedRelation: "competitor_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_videos: {
        Row: {
          caption: string | null
          comments_count: number | null
          competitor_id: string
          created_at: string
          duration_seconds: number | null
          hashtags_count: number | null
          id: string
          instagram_id: string
          is_selected_for_analysis: boolean | null
          likes_count: number | null
          posted_at: string | null
          thumbnail_url: string | null
          updated_at: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          caption?: string | null
          comments_count?: number | null
          competitor_id: string
          created_at?: string
          duration_seconds?: number | null
          hashtags_count?: number | null
          id?: string
          instagram_id: string
          is_selected_for_analysis?: boolean | null
          likes_count?: number | null
          posted_at?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          caption?: string | null
          comments_count?: number | null
          competitor_id?: string
          created_at?: string
          duration_seconds?: number | null
          hashtags_count?: number | null
          id?: string
          instagram_id?: string
          is_selected_for_analysis?: boolean | null
          likes_count?: number | null
          posted_at?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_videos_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          follower_count: number | null
          following_count: number | null
          id: string
          instagram_username: string
          is_verified: boolean | null
          last_scraped_at: string | null
          posts_count: number | null
          profile_picture_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          instagram_username: string
          is_verified?: boolean | null
          last_scraped_at?: string | null
          posts_count?: number | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          instagram_username?: string
          is_verified?: boolean | null
          last_scraped_at?: string | null
          posts_count?: number | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_series: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      created_videos: {
        Row: {
          build_up: string | null
          call_to_action: string | null
          content_series_id: string | null
          created_at: string
          hook: string | null
          id: string
          main_smp: string | null
          script_annotations: Json | null
          secondary_smps: string[] | null
          shots: string[] | null
          title: string
          updated_at: string
          user_id: string
          value_add: string | null
        }
        Insert: {
          build_up?: string | null
          call_to_action?: string | null
          content_series_id?: string | null
          created_at?: string
          hook?: string | null
          id?: string
          main_smp?: string | null
          script_annotations?: Json | null
          secondary_smps?: string[] | null
          shots?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          value_add?: string | null
        }
        Update: {
          build_up?: string | null
          call_to_action?: string | null
          content_series_id?: string | null
          created_at?: string
          hook?: string | null
          id?: string
          main_smp?: string | null
          script_annotations?: Json | null
          secondary_smps?: string[] | null
          shots?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          value_add?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "created_videos_content_series_id_fkey"
            columns: ["content_series_id"]
            isOneToOne: false
            referencedRelation: "content_series"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string | null
          feedback_data: Json
          id: string
          overall_score: number
          video_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_data: Json
          id?: string
          overall_score: number
          video_id: string
        }
        Update: {
          created_at?: string | null
          feedback_data?: Json
          id?: string
          overall_score?: number
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      my_profile: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          follower_count: number | null
          following_count: number | null
          id: string
          instagram_username: string
          is_verified: boolean | null
          last_scraped_at: string | null
          posts_count: number | null
          profile_picture_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          instagram_username: string
          is_verified?: boolean | null
          last_scraped_at?: string | null
          posts_count?: number | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          instagram_username?: string
          is_verified?: boolean | null
          last_scraped_at?: string | null
          posts_count?: number | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      my_profile_analysis: {
        Row: {
          analysis_status: string
          created_at: string
          feedback_data: Json
          id: string
          my_profile_video_id: string
          overall_score: number
          updated_at: string
        }
        Insert: {
          analysis_status?: string
          created_at?: string
          feedback_data: Json
          id?: string
          my_profile_video_id: string
          overall_score: number
          updated_at?: string
        }
        Update: {
          analysis_status?: string
          created_at?: string
          feedback_data?: Json
          id?: string
          my_profile_video_id?: string
          overall_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "my_profile_analysis_my_profile_video_id_fkey"
            columns: ["my_profile_video_id"]
            isOneToOne: false
            referencedRelation: "my_profile_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      my_profile_videos: {
        Row: {
          caption: string | null
          comments_count: number | null
          created_at: string
          duration_seconds: number | null
          hashtags_count: number | null
          id: string
          instagram_id: string
          is_selected_for_analysis: boolean | null
          likes_count: number | null
          my_profile_id: string
          posted_at: string | null
          thumbnail_url: string | null
          updated_at: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          duration_seconds?: number | null
          hashtags_count?: number | null
          id?: string
          instagram_id: string
          is_selected_for_analysis?: boolean | null
          likes_count?: number | null
          my_profile_id: string
          posted_at?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string
          duration_seconds?: number | null
          hashtags_count?: number | null
          id?: string
          instagram_id?: string
          is_selected_for_analysis?: boolean | null
          likes_count?: number | null
          my_profile_id?: string
          posted_at?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "my_profile_videos_my_profile_id_fkey"
            columns: ["my_profile_id"]
            isOneToOne: false
            referencedRelation: "my_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      script_drafts: {
        Row: {
          content: string | null
          created_at: string
          creative_items: Json | null
          editor_mode: string
          id: string
          sections: Json | null
          shots: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          creative_items?: Json | null
          editor_mode?: string
          id?: string
          sections?: Json | null
          shots?: Json | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          creative_items?: Json | null
          editor_mode?: string
          id?: string
          sections?: Json | null
          shots?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      section_drafts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          section_id: string
          shots: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          section_id: string
          shots?: Json | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          section_id?: string
          shots?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_mission: {
        Row: {
          audience_content_consumption: string | null
          audience_interests: string | null
          audience_pain_points: string | null
          audience_perception: string | null
          content_character: string | null
          content_personality: string | null
          content_tone: string | null
          created_at: string | null
          differentiating_factor: string | null
          id: string
          mission: string | null
          niche: string | null
          positioning_type: string | null
          solution_approach: string | null
          target_audience: string | null
          updated_at: string | null
          user_id: string
          value_proposition: string | null
        }
        Insert: {
          audience_content_consumption?: string | null
          audience_interests?: string | null
          audience_pain_points?: string | null
          audience_perception?: string | null
          content_character?: string | null
          content_personality?: string | null
          content_tone?: string | null
          created_at?: string | null
          differentiating_factor?: string | null
          id?: string
          mission?: string | null
          niche?: string | null
          positioning_type?: string | null
          solution_approach?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id: string
          value_proposition?: string | null
        }
        Update: {
          audience_content_consumption?: string | null
          audience_interests?: string | null
          audience_pain_points?: string | null
          audience_perception?: string | null
          content_character?: string | null
          content_personality?: string | null
          content_tone?: string | null
          created_at?: string | null
          differentiating_factor?: string | null
          id?: string
          mission?: string | null
          niche?: string | null
          positioning_type?: string | null
          solution_approach?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id?: string
          value_proposition?: string | null
        }
        Relationships: []
      }
      user_shots: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          status: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
