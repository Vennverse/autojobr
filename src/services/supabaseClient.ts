import { createClient } from '@supabase/supabase-js';
import { databaseConfig } from './databaseConfig';

// Validate database configuration
if (!databaseConfig.validateConfig()) {
  throw new Error('Invalid database configuration. Please check your environment variables.');
}

const config = databaseConfig.getConfig();

if (!databaseConfig.isSupabase()) {
  throw new Error('Current configuration is not set for Supabase. Please set VITE_DB_TYPE=supabase');
}

export const supabase = createClient(config.url, config.apiKey!);

// Test connection
supabase.from('users').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('Supabase connection failed:', error);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  });

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          is_onboarded: boolean;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          current_city: string | null;
          current_state: string | null;
          current_country: string | null;
          current_zip_code: string | null;
          linkedin_url: string | null;
          portfolio_url: string | null;
          github_url: string | null;
          current_company: string | null;
          current_job_title: string | null;
          current_industry: string | null;
          experience_years: number;
          skills: string[] | null;
          education: any;
          certifications: string[] | null;
          languages: any;
          country_of_work: string | null;
          legally_authorized: boolean;
          requires_sponsorship: boolean;
          current_status: string;
          status_details: string | null;
          notice_period: string | null;
          earliest_start_date: string | null;
          willing_to_relocate: boolean;
          desired_salary_min: number | null;
          desired_salary_max: number | null;
          desired_salary_currency: string;
          desired_salary_period: string;
          employment_types: string[] | null;
          preferred_locations: string[] | null;
          remote_preference: string;
          gender_identity: string | null;
          race_ethnicity: string[] | null;
          disability_status: string | null;
          veteran_status: string | null;
          worked_at_company_before: boolean;
          family_in_company: boolean;
          conflict_of_interest: boolean;
          conflict_details: string | null;
          criminal_record: boolean;
          criminal_record_details: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          is_onboarded?: boolean;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          current_city?: string | null;
          current_state?: string | null;
          current_country?: string | null;
          current_zip_code?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          github_url?: string | null;
          current_company?: string | null;
          current_job_title?: string | null;
          current_industry?: string | null;
          experience_years?: number;
          skills?: string[] | null;
          education?: any;
          certifications?: string[] | null;
          languages?: any;
          country_of_work?: string | null;
          legally_authorized?: boolean;
          requires_sponsorship?: boolean;
          current_status?: string;
          status_details?: string | null;
          notice_period?: string | null;
          earliest_start_date?: string | null;
          willing_to_relocate?: boolean;
          desired_salary_min?: number | null;
          desired_salary_max?: number | null;
          desired_salary_currency?: string;
          desired_salary_period?: string;
          employment_types?: string[] | null;
          preferred_locations?: string[] | null;
          remote_preference?: string;
          gender_identity?: string | null;
          race_ethnicity?: string[] | null;
          disability_status?: string | null;
          veteran_status?: string | null;
          worked_at_company_before?: boolean;
          family_in_company?: boolean;
          conflict_of_interest?: boolean;
          conflict_details?: string | null;
          criminal_record?: boolean;
          criminal_record_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          is_onboarded?: boolean;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          current_city?: string | null;
          current_state?: string | null;
          current_country?: string | null;
          current_zip_code?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          github_url?: string | null;
          current_company?: string | null;
          current_job_title?: string | null;
          current_industry?: string | null;
          experience_years?: number;
          skills?: string[] | null;
          education?: any;
          certifications?: string[] | null;
          languages?: any;
          country_of_work?: string | null;
          legally_authorized?: boolean;
          requires_sponsorship?: boolean;
          current_status?: string;
          status_details?: string | null;
          notice_period?: string | null;
          earliest_start_date?: string | null;
          willing_to_relocate?: boolean;
          desired_salary_min?: number | null;
          desired_salary_max?: number | null;
          desired_salary_currency?: string;
          desired_salary_period?: string;
          employment_types?: string[] | null;
          preferred_locations?: string[] | null;
          remote_preference?: string;
          gender_identity?: string | null;
          race_ethnicity?: string[] | null;
          disability_status?: string | null;
          veteran_status?: string | null;
          worked_at_company_before?: boolean;
          family_in_company?: boolean;
          conflict_of_interest?: boolean;
          conflict_details?: string | null;
          criminal_record?: boolean;
          criminal_record_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          external_id: string | null;
          title: string;
          company: string;
          location: string;
          job_type: string;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          description: string | null;
          requirements: string[] | null;
          benefits: string[] | null;
          posted_date: string | null;
          application_deadline: string | null;
          is_remote: boolean;
          company_logo_url: string | null;
          tags: string[] | null;
          source: string | null;
          application_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id?: string | null;
          title: string;
          company: string;
          location: string;
          job_type: string;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          description?: string | null;
          requirements?: string[] | null;
          benefits?: string[] | null;
          posted_date?: string | null;
          application_deadline?: string | null;
          is_remote?: boolean;
          company_logo_url?: string | null;
          tags?: string[] | null;
          source?: string | null;
          application_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string | null;
          title?: string;
          company?: string;
          location?: string;
          job_type?: string;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          description?: string | null;
          requirements?: string[] | null;
          benefits?: string[] | null;
          posted_date?: string | null;
          application_deadline?: string | null;
          is_remote?: boolean;
          company_logo_url?: string | null;
          tags?: string[] | null;
          source?: string | null;
          application_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          status: string;
          applied_date: string;
          last_updated: string;
          notes: string | null;
          interview_date: string | null;
          salary_negotiation: number | null;
          resume_id: string | null;
          cover_letter_id: string | null;
          portfolio_id: string | null;
          source: string;
          application_method: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          status?: string;
          applied_date?: string;
          last_updated?: string;
          notes?: string | null;
          interview_date?: string | null;
          salary_negotiation?: number | null;
          resume_id?: string | null;
          cover_letter_id?: string | null;
          portfolio_id?: string | null;
          source?: string;
          application_method?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          status?: string;
          applied_date?: string;
          last_updated?: string;
          notes?: string | null;
          interview_date?: string | null;
          salary_negotiation?: number | null;
          resume_id?: string | null;
          cover_letter_id?: string | null;
          portfolio_id?: string | null;
          source?: string;
          application_method?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          document_type: string;
          file_name: string;
          file_url: string | null;
          file_content: string | null;
          file_size: number | null;
          mime_type: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_type: string;
          file_name: string;
          file_url?: string | null;
          file_content?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_type?: string;
          file_name?: string;
          file_url?: string | null;
          file_content?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      extension_settings: {
        Row: {
          id: string;
          user_id: string;
          auto_apply_enabled: boolean;
          daily_application_limit: number;
          applications_today: number;
          last_reset_date: string;
          include_keywords: string[] | null;
          exclude_keywords: string[] | null;
          salary_min: number | null;
          experience_levels: string[] | null;
          company_types: string[] | null;
          job_types: string[] | null;
          email_notifications: boolean;
          browser_notifications: boolean;
          application_updates: boolean;
          job_alerts: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          auto_apply_enabled?: boolean;
          daily_application_limit?: number;
          applications_today?: number;
          last_reset_date?: string;
          include_keywords?: string[] | null;
          exclude_keywords?: string[] | null;
          salary_min?: number | null;
          experience_levels?: string[] | null;
          company_types?: string[] | null;
          job_types?: string[] | null;
          email_notifications?: boolean;
          browser_notifications?: boolean;
          application_updates?: boolean;
          job_alerts?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          auto_apply_enabled?: boolean;
          daily_application_limit?: number;
          applications_today?: number;
          last_reset_date?: string;
          include_keywords?: string[] | null;
          exclude_keywords?: string[] | null;
          salary_min?: number | null;
          experience_levels?: string[] | null;
          company_types?: string[] | null;
          job_types?: string[] | null;
          email_notifications?: boolean;
          browser_notifications?: boolean;
          application_updates?: boolean;
          job_alerts?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}