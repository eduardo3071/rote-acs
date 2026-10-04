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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      acs: {
        Row: {
          cod_ibge: string | null
          code: string
          created_at: string | null
          id: string
          municipio: string | null
          name: string
          territory: string | null
        }
        Insert: {
          cod_ibge?: string | null
          code: string
          created_at?: string | null
          id?: string
          municipio?: string | null
          name: string
          territory?: string | null
        }
        Update: {
          cod_ibge?: string | null
          code?: string
          created_at?: string | null
          id?: string
          municipio?: string | null
          name?: string
          territory?: string | null
        }
        Relationships: []
      }
      cluster_events: {
        Row: {
          affected_family: string | null
          created_at: string | null
          distance_m: number | null
          id: string
          trigger_family: string | null
          trigger_visit: string | null
        }
        Insert: {
          affected_family?: string | null
          created_at?: string | null
          distance_m?: number | null
          id?: string
          trigger_family?: string | null
          trigger_visit?: string | null
        }
        Update: {
          affected_family?: string | null
          created_at?: string | null
          distance_m?: number | null
          id?: string
          trigger_family?: string | null
          trigger_visit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cluster_events_affected_family_fkey"
            columns: ["affected_family"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_events_trigger_family_fkey"
            columns: ["trigger_family"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_events_trigger_visit_fkey"
            columns: ["trigger_visit"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          acs_id: string | null
          children_under5: number | null
          cluster_risk: boolean | null
          cod_ibge: string | null
          created_at: string | null
          has_chronic: boolean
          has_pregnant: boolean
          id: string
          last_visit_at: string | null
          lat: number
          lon: number
          municipio: string | null
          name: string
          risk_reason: string | null
          risk_score: number | null
          source: string | null
          vaccinations_ok: boolean | null
          water_source: string | null
        }
        Insert: {
          acs_id?: string | null
          children_under5?: number | null
          cluster_risk?: boolean | null
          cod_ibge?: string | null
          created_at?: string | null
          has_chronic?: boolean
          has_pregnant?: boolean
          id?: string
          last_visit_at?: string | null
          lat: number
          lon: number
          municipio?: string | null
          name: string
          risk_reason?: string | null
          risk_score?: number | null
          source?: string | null
          vaccinations_ok?: boolean | null
          water_source?: string | null
        }
        Update: {
          acs_id?: string | null
          children_under5?: number | null
          cluster_risk?: boolean | null
          cod_ibge?: string | null
          created_at?: string | null
          has_chronic?: boolean
          has_pregnant?: boolean
          id?: string
          last_visit_at?: string | null
          lat?: number
          lon?: number
          municipio?: string | null
          name?: string
          risk_reason?: string | null
          risk_score?: number | null
          source?: string | null
          vaccinations_ok?: boolean | null
          water_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_acs_id_fkey"
            columns: ["acs_id"]
            isOneToOne: false
            referencedRelation: "acs"
            referencedColumns: ["id"]
          },
        ]
      }
      health_facilities: {
        Row: {
          cnes_code: string | null
          cod_ibge: string | null
          id: string
          lat: number
          lon: number
          municipio: string
          name: string
          source: string | null
          type: string | null
        }
        Insert: {
          cnes_code?: string | null
          cod_ibge?: string | null
          id?: string
          lat: number
          lon: number
          municipio: string
          name: string
          source?: string | null
          type?: string | null
        }
        Update: {
          cnes_code?: string | null
          cod_ibge?: string | null
          id?: string
          lat?: number
          lon?: number
          municipio?: string
          name?: string
          source?: string | null
          type?: string | null
        }
        Relationships: []
      }
      visits: {
        Row: {
          acs_id: string | null
          bp_diastolic: number | null
          bp_systolic: number | null
          children_under5: number | null
          chronic_meds: string | null
          created_at: string | null
          dehydration_signs: string[] | null
          dhis2_exported_at: string | null
          family_id: string | null
          fever_symptom: boolean | null
          gi_symptom: boolean | null
          glucose_mgdl: number | null
          id: string
          prenatal_consults: number | null
          prenatal_weeks: number | null
          protocol_shown: string | null
          symptom_duration: number | null
          symptoms: string[] | null
          synced_at: string | null
          urgent_referral: boolean
          vaccines_late: string | null
          vaccines_status: string | null
          visit_reasons: string[] | null
          visited_at: string
          wash_guidance: string | null
          wash_handwashing: boolean | null
          wash_latrine: boolean | null
          wash_latrine_condition: string | null
          wash_soap: boolean | null
          wash_trash: boolean | null
          water_source: string | null
        }
        Insert: {
          acs_id?: string | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          children_under5?: number | null
          chronic_meds?: string | null
          created_at?: string | null
          dehydration_signs?: string[] | null
          dhis2_exported_at?: string | null
          family_id?: string | null
          fever_symptom?: boolean | null
          gi_symptom?: boolean | null
          glucose_mgdl?: number | null
          id?: string
          prenatal_consults?: number | null
          prenatal_weeks?: number | null
          protocol_shown?: string | null
          symptom_duration?: number | null
          symptoms?: string[] | null
          synced_at?: string | null
          urgent_referral?: boolean
          vaccines_late?: string | null
          vaccines_status?: string | null
          visit_reasons?: string[] | null
          visited_at: string
          wash_guidance?: string | null
          wash_handwashing?: boolean | null
          wash_latrine?: boolean | null
          wash_latrine_condition?: string | null
          wash_soap?: boolean | null
          wash_trash?: boolean | null
          water_source?: string | null
        }
        Update: {
          acs_id?: string | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          children_under5?: number | null
          chronic_meds?: string | null
          created_at?: string | null
          dehydration_signs?: string[] | null
          dhis2_exported_at?: string | null
          family_id?: string | null
          fever_symptom?: boolean | null
          gi_symptom?: boolean | null
          glucose_mgdl?: number | null
          id?: string
          prenatal_consults?: number | null
          prenatal_weeks?: number | null
          protocol_shown?: string | null
          symptom_duration?: number | null
          symptoms?: string[] | null
          synced_at?: string | null
          urgent_referral?: boolean
          vaccines_late?: string | null
          vaccines_status?: string | null
          visit_reasons?: string[] | null
          visited_at?: string
          wash_guidance?: string | null
          wash_handwashing?: boolean | null
          wash_latrine?: boolean | null
          wash_latrine_condition?: string | null
          wash_soap?: boolean | null
          wash_trash?: boolean | null
          water_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_acs_id_fkey"
            columns: ["acs_id"]
            isOneToOne: false
            referencedRelation: "acs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_acs_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
