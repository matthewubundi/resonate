// Navigation Types
export type PageView =
  | 'landing'
  | 'login'
  | 'signup'
  | 'onboarding'
  | 'loading'
  | 'review'
  | 'dashboard'
  | 'transform'
  | 'editor'
  | 'analytics'
  | 'history'
  | 'memory'
  | 'personas'
  | 'settings'
  | 'documentation'
  | 'check-email'
  | 'verified'
  | 'terms'
  | 'privacy'
  | 'reset-password';

export interface NavItem {
  id: PageView;
  label: string;
  icon: any; // Using Lucide icons
}

// Data Types (Placeholder)
export interface IdentityProfile {
  id: string;
  name: string;
  version: string;
  tone: string[];
  vocabulary: {
    frequent: string[];
    avoid: string[];
  };
  values: string[];
  rules: {
    always: string[];
    never: string[];
  };
  alignmentScore: number;
}

export interface TransformationItem {
  id: string;
  date: string;
  preview: string;
  score: number;
}

export interface MemoryItem {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  dateAdded: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  avatarColor: string;
}

// Database Schema Types (matches Supabase schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // uuid
          email: string | null;
          created_at: string; // timestamp with time zone
          full_name: string | null;
        };
        Insert: {
          id: string; // uuid (references auth.users)
          email?: string | null;
          created_at?: string;
          full_name?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
          full_name?: string | null;
        };
      };
      identities: {
        Row: {
          id: string; // uuid
          user_id: string; // uuid (references profiles.id)
          identity_json: Record<string, any>; // jsonb
          is_active: boolean;
          version_number: number;
          created_at: string; // timestamp with time zone
          updated_at: string; // timestamp with time zone
        };
        Insert: {
          id?: string; // uuid (auto-generated)
          user_id: string; // uuid (references profiles.id)
          identity_json: Record<string, any>; // jsonb
          is_active?: boolean;
          version_number?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          identity_json?: Record<string, any>;
          is_active?: boolean;
          version_number?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      transformations: {
        Row: {
          id: string; // uuid
          user_id: string; // uuid (references profiles.id)
          input_text: string | null;
          raw_llm_output: string | null;
          final_output: string | null;
          alignment_score: number | null; // numeric(3,1)
          processing_time_ms: number | null;
          model_used: 'gpt-4o-mini' | 'gemini-flash-latest' | string | null;
          created_at: string; // timestamp with time zone
        };
        Insert: {
          id?: string; // uuid (auto-generated)
          user_id: string; // uuid (references profiles.id)
          input_text?: string | null;
          raw_llm_output?: string | null;
          final_output?: string | null;
          alignment_score?: number | null;
          processing_time_ms?: number | null;
          model_used?: 'gpt-4o-mini' | 'gemini-flash-latest' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          input_text?: string | null;
          raw_llm_output?: string | null;
          final_output?: string | null;
          alignment_score?: number | null;
          processing_time_ms?: number | null;
          model_used?: 'gpt-4o-mini' | 'gemini-flash-latest' | null;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience types for database tables
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Identity = Database['public']['Tables']['identities']['Row'];
export type IdentityInsert = Database['public']['Tables']['identities']['Insert'];
export type IdentityUpdate = Database['public']['Tables']['identities']['Update'];

export type Transformation = Database['public']['Tables']['transformations']['Row'];
export type TransformationInsert = Database['public']['Tables']['transformations']['Insert'];
export type TransformationUpdate = Database['public']['Tables']['transformations']['Update'];

export interface GeneratedIdentity {
  tone: string;
  tone_description?: string; // Detailed description of the tone (UI field)
  description?: string; // Database field (maps to tone_description)
  formality: string;
  directness: string;
  sentence_structure?: {
    typical_length: string;
    patterns: string[];
  };
  vocabulary: {
    frequent_words: string[];
    avoid_words: string[];
  };
  values: string[];
  ethics?: string[];
  humour?: string;
  formatting_preferences?: {
    default: string;
    structure: string;
    prefers_summaries?: boolean;
  };
  decision_style?: string;
  rules: {
    always: string[];
    never: string[];
  };
  _disabled_rules?: {
    always: string[];
    never: string[];
  };
}
