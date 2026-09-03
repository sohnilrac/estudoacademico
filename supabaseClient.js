import { createClient } from '@supabase/supabase-js';

// Essas duas informações são seguras para ficar aqui no código:
// a "publishable key" (antigo "anon public") é feita para uso público no navegador.
// Nunca coloque aqui a "service_role secret" — essa sim é sensível.
const SUPABASE_URL = 'https://ikjexnliqwpmvuwncowg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_WrrmPg8P9_5wokTdGFw0jA_ZAXXL7Iy';

// Este app não usa login/autenticação — só leitura/escrita pública na tabela `albums`.
// Desligamos a persistência de sessão para o cliente Supabase não tentar acessar
// `localStorage` durante o build/prerender do Next.js (ambiente sem navegador),
// o que causava falha no deploy.
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
