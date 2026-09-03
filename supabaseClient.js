import { createClient } from '@supabase/supabase-js';

// Essas duas informações são seguras para ficar aqui no código:
// a "publishable key" (antigo "anon public") é feita para uso público no navegador.
// Nunca coloque aqui a "service_role secret" — essa sim é sensível.
const SUPABASE_URL = 'https://ikjexnliqwpmvuwncowg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_WrrmPg8P9_5wokTdGFw0jA_ZAXXL7Iy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
