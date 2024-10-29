import { createClient } from '@supabase/supabase-js';

// Supabase project URL and anon key (from the values you provided earlier)
const SUPABASE_URL = 'https://ghytrgrqcjtzutkaoalr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoeXRyZ3JxY2p0enV0a2FvYWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2NzQ3NzIsImV4cCI6MjA0NDI1MDc3Mn0.l_T9Z57Cr07G-AMYtqM2DXiI93xv-R6idV2O-xNXoSM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
