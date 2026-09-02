import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://jdmphnhftjqaaiwovtgt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_Hu4FXl3p9bO67J1yTDteug_fLeg80Ue";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;
