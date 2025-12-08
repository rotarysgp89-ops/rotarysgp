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
      agendamentos: {
        Row: {
          contato: string
          created_at: string | null
          data: string
          id: string
          nome_responsavel: string
          observacoes: string | null
          updated_at: string | null
          valor_cobrado: number | null
        }
        Insert: {
          contato: string
          created_at?: string | null
          data: string
          id?: string
          nome_responsavel: string
          observacoes?: string | null
          updated_at?: string | null
          valor_cobrado?: number | null
        }
        Update: {
          contato?: string
          created_at?: string | null
          data?: string
          id?: string
          nome_responsavel?: string
          observacoes?: string | null
          updated_at?: string | null
          valor_cobrado?: number | null
        }
        Relationships: []
      }
      associados: {
        Row: {
          contato_celular: string
          contato_email: string
          contato_telefone: string
          cpf: string
          created_at: string | null
          data_associacao: string | null
          data_nascimento: string
          endereco_bairro: string
          endereco_cep: string
          endereco_cidade: string
          endereco_complemento: string | null
          endereco_estado: string
          endereco_numero: string
          endereco_rua: string
          id: string
          nome_completo: string
          observacoes: string | null
          rg: string
          status: Database["public"]["Enums"]["associado_status"] | null
          updated_at: string | null
        }
        Insert: {
          contato_celular: string
          contato_email: string
          contato_telefone: string
          cpf: string
          created_at?: string | null
          data_associacao?: string | null
          data_nascimento: string
          endereco_bairro: string
          endereco_cep: string
          endereco_cidade: string
          endereco_complemento?: string | null
          endereco_estado: string
          endereco_numero: string
          endereco_rua: string
          id?: string
          nome_completo: string
          observacoes?: string | null
          rg: string
          status?: Database["public"]["Enums"]["associado_status"] | null
          updated_at?: string | null
        }
        Update: {
          contato_celular?: string
          contato_email?: string
          contato_telefone?: string
          cpf?: string
          created_at?: string | null
          data_associacao?: string | null
          data_nascimento?: string
          endereco_bairro?: string
          endereco_cep?: string
          endereco_cidade?: string
          endereco_complemento?: string | null
          endereco_estado?: string
          endereco_numero?: string
          endereco_rua?: string
          id?: string
          nome_completo?: string
          observacoes?: string | null
          rg?: string
          status?: Database["public"]["Enums"]["associado_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categorias_contas: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["transacao_tipo"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          tipo: Database["public"]["Enums"]["transacao_tipo"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["transacao_tipo"]
          updated_at?: string | null
        }
        Relationships: []
      }
      familiares: {
        Row: {
          associado_id: string
          cpf: string | null
          created_at: string | null
          data_nascimento: string
          id: string
          nome: string
          parentesco: Database["public"]["Enums"]["parentesco"]
          updated_at: string | null
        }
        Insert: {
          associado_id: string
          cpf?: string | null
          created_at?: string | null
          data_nascimento: string
          id?: string
          nome: string
          parentesco: Database["public"]["Enums"]["parentesco"]
          updated_at?: string | null
        }
        Update: {
          associado_id?: string
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string
          id?: string
          nome?: string
          parentesco?: Database["public"]["Enums"]["parentesco"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "familiares_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "associados"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos_financeiros: {
        Row: {
          categoria_id: string | null
          created_at: string | null
          data: string
          descricao: string
          id: string
          observacoes: string | null
          tipo: Database["public"]["Enums"]["transacao_tipo"]
          updated_at: string | null
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string | null
          data: string
          descricao: string
          id?: string
          observacoes?: string | null
          tipo: Database["public"]["Enums"]["transacao_tipo"]
          updated_at?: string | null
          valor: number
        }
        Update: {
          categoria_id?: string | null
          created_at?: string | null
          data?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          tipo?: Database["public"]["Enums"]["transacao_tipo"]
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_financeiros_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          id: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "associado"
      associado_status: "ativo" | "inativo"
      parentesco: "cônjuge" | "filho(a)" | "pai/mãe" | "irmão/irmã" | "outro"
      transacao_tipo: "receita" | "despesa"
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
      app_role: ["admin", "associado"],
      associado_status: ["ativo", "inativo"],
      parentesco: ["cônjuge", "filho(a)", "pai/mãe", "irmão/irmã", "outro"],
      transacao_tipo: ["receita", "despesa"],
    },
  },
} as const
