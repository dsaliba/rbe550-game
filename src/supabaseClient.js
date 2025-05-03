import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kbquyeylsdmjivjfyljc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticXV5ZXlsc2Rtaml2amZ5bGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTkwOTMsImV4cCI6MjA2MTc3NTA5M30.OrlGpzrh90UCmKI2-E0wONXnHGh92KPAjE08kyL_0mo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
