// Konfigurasi Supabase
const SUPABASE_URL = 'https://ezptverusfwibpyilkkw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FUw7BbV7rlyGcGBi1olICg_0jJFXDXV';
const API_BASE = `${SUPABASE_URL}/rest/v1`;

// Headers default untuk semua request ke Supabase REST API
const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};
