import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      exam_registrations: {
        Row: {
          id: string;
          user_id: string;
          exam_category: string;
          exam_type: string;
          state: string;
          exam_date: string;
          student_info: any;
          payment_status: string;
          payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_category: string;
          exam_type: string;
          state: string;
          exam_date: string;
          student_info: any;
          payment_status?: string;
          payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_category?: string;
          exam_type?: string;
          state?: string;
          exam_date?: string;
          student_info?: any;
          payment_status?: string;
          payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exam_results: {
        Row: {
          id: string;
          user_id: string;
          exam_registration_id: string;
          result: string;
          questions_answers: any;
          agreed_to_share: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_registration_id: string;
          result: string;
          questions_answers?: any;
          agreed_to_share?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_registration_id?: string;
          result?: string;
          questions_answers?: any;
          agreed_to_share?: boolean;
          created_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          exam_registration_id: string;
          mode: string;
          difficulty: string;
          score: number;
          total_questions: number;
          time_spent: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_registration_id: string;
          mode: string;
          difficulty: string;
          score?: number;
          total_questions?: number;
          time_spent?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_registration_id?: string;
          mode?: string;
          difficulty?: string;
          score?: number;
          total_questions?: number;
          time_spent?: number;
          created_at?: string;
        };
      };
    };
  };
};