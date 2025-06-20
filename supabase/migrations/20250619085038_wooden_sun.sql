/*
  # AutoJobr Database Schema

  1. New Tables
    - `users` - User accounts and authentication
    - `user_profiles` - Detailed user profile information
    - `jobs` - Job listings and details
    - `applications` - Job applications tracking
    - `documents` - User documents (resumes, cover letters)
    - `extension_settings` - Chrome extension configuration
    - `application_logs` - Activity logs for applications

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for public job listings

  3. Functions
    - Auto-update timestamps
    - Application status tracking
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_onboarded boolean DEFAULT false,
  
  -- Personal Details
  first_name text,
  last_name text,
  phone text,
  current_city text,
  current_state text,
  current_country text,
  current_zip_code text,
  linkedin_url text,
  portfolio_url text,
  github_url text,
  
  -- Professional Details
  current_company text,
  current_job_title text,
  current_industry text,
  experience_years integer DEFAULT 0,
  skills text[], -- Array of skills
  education jsonb DEFAULT '[]'::jsonb, -- Array of education objects
  certifications text[],
  languages jsonb DEFAULT '[]'::jsonb, -- Array of language objects
  
  -- Work Authorization
  country_of_work text,
  legally_authorized boolean DEFAULT false,
  requires_sponsorship boolean DEFAULT false,
  current_status text DEFAULT 'citizen',
  status_details text,
  
  -- Employment Preferences
  notice_period text,
  earliest_start_date date,
  willing_to_relocate boolean DEFAULT false,
  desired_salary_min integer,
  desired_salary_max integer,
  desired_salary_currency text DEFAULT 'USD',
  desired_salary_period text DEFAULT 'yearly',
  employment_types text[],
  preferred_locations text[],
  remote_preference text DEFAULT 'flexible',
  
  -- Diversity Info (optional)
  gender_identity text,
  race_ethnicity text[],
  disability_status text,
  veteran_status text,
  
  -- Background Info
  worked_at_company_before boolean DEFAULT false,
  family_in_company boolean DEFAULT false,
  conflict_of_interest boolean DEFAULT false,
  conflict_details text,
  criminal_record boolean DEFAULT false,
  criminal_record_details text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  document_type text NOT NULL, -- 'resume', 'cover_letter', 'portfolio'
  file_name text NOT NULL,
  file_url text,
  file_content text, -- Extracted text content
  file_size integer,
  mime_type text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Extension settings table
CREATE TABLE IF NOT EXISTS extension_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  auto_apply_enabled boolean DEFAULT false,
  daily_application_limit integer DEFAULT 10,
  applications_today integer DEFAULT 0,
  last_reset_date date DEFAULT CURRENT_DATE,
  
  -- Application Filters
  include_keywords text[],
  exclude_keywords text[],
  salary_min integer,
  experience_levels text[],
  company_types text[],
  job_types text[],
  
  -- Notifications
  email_notifications boolean DEFAULT true,
  browser_notifications boolean DEFAULT true,
  application_updates boolean DEFAULT true,
  job_alerts boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id text, -- ID from job board
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  job_type text NOT NULL, -- 'full-time', 'part-time', 'contract', 'internship'
  salary_min integer,
  salary_max integer,
  salary_currency text DEFAULT 'USD',
  description text,
  requirements text[],
  benefits text[],
  posted_date timestamptz,
  application_deadline timestamptz,
  is_remote boolean DEFAULT false,
  company_logo_url text,
  tags text[],
  source text, -- 'linkedin', 'indeed', 'glassdoor', etc.
  application_url text,
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  status text DEFAULT 'applied', -- 'applied', 'reviewing', 'interview', 'offer', 'rejected'
  applied_date timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  notes text,
  interview_date timestamptz,
  salary_negotiation integer,
  
  -- Documents used for this application
  resume_id uuid REFERENCES documents(id),
  cover_letter_id uuid REFERENCES documents(id),
  portfolio_id uuid REFERENCES documents(id),
  
  source text DEFAULT 'manual', -- 'manual', 'extension', 'api'
  application_method text DEFAULT 'manual',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, job_id)
);

-- Application logs table
CREATE TABLE IF NOT EXISTS application_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'applied', 'status_changed', 'interview_scheduled', etc.
  old_value text,
  new_value text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Users can read own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for extension_settings
CREATE POLICY "Users can read own extension settings"
  ON extension_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own extension settings"
  ON extension_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own extension settings"
  ON extension_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for jobs (public read, admin write)
CREATE POLICY "Anyone can read active jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for applications
CREATE POLICY "Users can read own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON applications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for application_logs
CREATE POLICY "Users can read own application logs"
  ON application_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application logs"
  ON application_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_extension_settings_updated_at BEFORE UPDATE ON extension_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to reset daily application counter
CREATE OR REPLACE FUNCTION reset_daily_application_counter()
RETURNS void AS $$
BEGIN
  UPDATE extension_settings 
  SET applications_today = 0, last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ language 'plpgsql';

-- Function to log application status changes
CREATE OR REPLACE FUNCTION log_application_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO application_logs (application_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, NEW.user_id, 'status_changed', OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for application status changes
CREATE TRIGGER log_application_status_change 
  AFTER UPDATE ON applications 
  FOR EACH ROW 
  EXECUTE FUNCTION log_application_change();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_extension_settings_user_id ON extension_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date);
CREATE INDEX IF NOT EXISTS idx_application_logs_application_id ON application_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_application_logs_user_id ON application_logs(user_id);