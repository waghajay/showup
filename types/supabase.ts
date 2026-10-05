export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: 'PLACEMENT' | 'COLLEGE' | 'HEALTH' | 'LIFESTYLE';
          active_from: string;
          active_until: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: 'PLACEMENT' | 'COLLEGE' | 'HEALTH' | 'LIFESTYLE';
          active_from: string;
          active_until?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: 'PLACEMENT' | 'COLLEGE' | 'HEALTH' | 'LIFESTYLE';
          active_from?: string;
          active_until?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_completions: {
        Row: {
          id: string;
          user_id: string;
          activity_id: string;
          date: string;
          completed: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_id: string;
          date: string;
          completed?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_id?: string;
          date?: string;
          completed?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_completions_activity_id_fkey';
            columns: ['activity_id'];
            referencedRelation: 'activities';
            referencedColumns: ['id'];
          },
        ];
      };
      user_settings: {
        Row: {
          user_id: string;
          theme: 'system' | 'light' | 'dark';
          notifications_enabled: boolean;
          reminder_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: 'system' | 'light' | 'dark';
          notifications_enabled?: boolean;
          reminder_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          theme?: 'system' | 'light' | 'dark';
          notifications_enabled?: boolean;
          reminder_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
