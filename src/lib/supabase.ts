/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://fixasasxirdzlkrmphjo.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LjYOYPi1PWXZWDKuZUEY4Q_dstJj_eK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
