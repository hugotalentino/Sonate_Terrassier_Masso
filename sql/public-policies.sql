-- Allow public users to create new appointments (for public booking page)
CREATE POLICY "Allow public appointment creation" ON appointments
  FOR INSERT
  WITH CHECK (is_new_client = true);

-- Allow public users to insert health forms
CREATE POLICY "Allow public health form creation" ON health_forms
  FOR INSERT
  WITH CHECK (true);

-- Allow public users to read therapist profiles (for /about page)
CREATE POLICY "Allow public therapist profile read" ON therapist_profiles
  FOR SELECT
  USING (true);
