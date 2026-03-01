require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Pastikan variabel ini ada di file .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di file .env');
  console.error('   Silakan tambahkan kredensial Supabase Anda.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;