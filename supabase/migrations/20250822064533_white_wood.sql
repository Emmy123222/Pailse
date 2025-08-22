/*
  # Create myPAILES Exam Platform Database Schema

  1. New Tables
    - `exam_registrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `exam_category` (text)
      - `exam_type` (text)
      - `state` (text)
      - `exam_date` (date)
      - `student_info` (jsonb)
      - `payment_status` (text, default 'pending')
      - `payment_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `exam_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `exam_registration_id` (uuid, references exam_registrations)
      - `result` (text) -- 'pass' or 'fail'
      - `questions_answers` (jsonb) -- stored Q&A data
      - `agreed_to_share` (boolean, default false)
      - `created_at` (timestamp)
    
    - `study_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `exam_registration_id` (uuid, references exam_registrations)
      - `mode` (text) -- 'flashcards', 'multiple_choice', 'typing'
      - `difficulty` (text) -- 'easy', 'medium', 'hard'
      - `score` (integer)
      - `total_questions` (integer)
      - `time_spent` (integer) -- in seconds
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading shared data for AI training
*/

CREATE TABLE IF NOT EXISTS exam_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_category text NOT NULL,
  exam_type text NOT NULL,
  state text NOT NULL,
  exam_date date NOT NULL,
  student_info jsonb NOT NULL DEFAULT '{}',
  payment_status text DEFAULT 'pending',
  payment_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_registration_id uuid REFERENCES exam_registrations(id) ON DELETE CASCADE NOT NULL,
  result text NOT NULL CHECK (result IN ('pass', 'fail')),
  questions_answers jsonb DEFAULT '{}',
  agreed_to_share boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_registration_id uuid REFERENCES exam_registrations(id) ON DELETE CASCADE NOT NULL,
  mode text NOT NULL CHECK (mode IN ('flashcards', 'multiple_choice', 'typing')),
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  time_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exam_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for exam_registrations
CREATE POLICY "Users can manage their own exam registrations"
  ON exam_registrations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for exam_results
CREATE POLICY "Users can manage their own exam results"
  ON exam_results
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read shared results for AI training"
  ON exam_results
  FOR SELECT
  TO authenticated
  USING (agreed_to_share = true);

-- Policies for study_sessions
CREATE POLICY "Users can manage their own study sessions"
  ON study_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for exam_registrations
CREATE TRIGGER update_exam_registrations_updated_at
  BEFORE UPDATE ON exam_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();