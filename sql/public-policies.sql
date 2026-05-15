-- MassageFlow RLS policies
-- Run this script in Supabase SQL Editor after creating your tables.

-- Enable RLS
ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_forms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely (idempotent)
DROP POLICY IF EXISTS therapist_profiles_select_public ON therapist_profiles;
DROP POLICY IF EXISTS therapist_profiles_select_own ON therapist_profiles;
DROP POLICY IF EXISTS therapist_profiles_insert_own ON therapist_profiles;
DROP POLICY IF EXISTS therapist_profiles_update_own ON therapist_profiles;

DROP POLICY IF EXISTS appointments_select_own ON appointments;
DROP POLICY IF EXISTS appointments_insert_public_booking ON appointments;
DROP POLICY IF EXISTS appointments_insert_own ON appointments;
DROP POLICY IF EXISTS appointments_update_own ON appointments;
DROP POLICY IF EXISTS appointments_delete_own ON appointments;

DROP POLICY IF EXISTS clients_select_own ON clients;
DROP POLICY IF EXISTS clients_insert_public_booking ON clients;
DROP POLICY IF EXISTS clients_insert_own ON clients;
DROP POLICY IF EXISTS clients_update_own ON clients;
DROP POLICY IF EXISTS clients_delete_own ON clients;

DROP POLICY IF EXISTS sessions_select_own ON sessions;
DROP POLICY IF EXISTS sessions_insert_own ON sessions;
DROP POLICY IF EXISTS sessions_update_own ON sessions;
DROP POLICY IF EXISTS sessions_delete_own ON sessions;

DROP POLICY IF EXISTS invoices_select_own ON invoices;
DROP POLICY IF EXISTS invoices_insert_own ON invoices;
DROP POLICY IF EXISTS invoices_update_own ON invoices;
DROP POLICY IF EXISTS invoices_delete_own ON invoices;

DROP POLICY IF EXISTS health_forms_insert_public ON health_forms;

-- therapist_profiles
-- Public read is needed for /therapist/[slug].
CREATE POLICY therapist_profiles_select_public ON therapist_profiles
  FOR SELECT
  USING (true);

CREATE POLICY therapist_profiles_select_own ON therapist_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY therapist_profiles_insert_own ON therapist_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY therapist_profiles_update_own ON therapist_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- appointments
CREATE POLICY appointments_select_own ON appointments
  FOR SELECT
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

-- Public booking allows anonymous insertion for first booking.
CREATE POLICY appointments_insert_public_booking ON appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (is_new_client = true);

CREATE POLICY appointments_insert_own ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY appointments_update_own ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY appointments_delete_own ON appointments
  FOR DELETE
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

-- clients
CREATE POLICY clients_select_own ON clients
  FOR SELECT
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

-- Public booking can create a client shell record.
CREATE POLICY clients_insert_public_booking ON clients
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY clients_insert_own ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY clients_update_own ON clients
  FOR UPDATE
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY clients_delete_own ON clients
  FOR DELETE
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

-- sessions
CREATE POLICY sessions_select_own ON sessions
  FOR SELECT
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY sessions_insert_own ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY sessions_update_own ON sessions
  FOR UPDATE
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY sessions_delete_own ON sessions
  FOR DELETE
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

-- invoices
CREATE POLICY invoices_select_own ON invoices
  FOR SELECT
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY invoices_insert_own ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY invoices_update_own ON invoices
  FOR UPDATE
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY invoices_delete_own ON invoices
  FOR DELETE
  TO authenticated
  USING (
    therapist_id IN (
      SELECT id FROM therapist_profiles WHERE user_id = auth.uid()
    )
  );

-- health_forms
CREATE POLICY health_forms_insert_public ON health_forms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
