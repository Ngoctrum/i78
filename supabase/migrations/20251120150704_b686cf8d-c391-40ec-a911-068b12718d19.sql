-- Add bank settings to site_settings if they don't exist
INSERT INTO public.site_settings (key, value)
VALUES 
  ('bank_name', 'MBank'),
  ('bank_account_number', ''),
  ('bank_account_name', '')
ON CONFLICT (key) DO NOTHING;