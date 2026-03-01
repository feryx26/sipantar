require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url_here' || supabaseKey === 'your_supabase_anon_key_here') {
  console.warn('⚠️ WARNING: SUPABASE_URL atau SUPABASE_KEY tidak ditemukan atau masih default di file .env');
  console.warn('   Silakan tambahkan kredensial Supabase Anda di file .env di root project.');
  
  // Return a mock client to avoid crashing on startup
   const mockResult = { data: null, error: { message: "Supabase not configured" } };
   const mockArrayResult = { data: [], error: { message: "Supabase not configured" } };
   const mockQuery = {
     select: () => mockQuery,
     insert: () => mockQuery,
     update: () => mockQuery,
     delete: () => mockQuery,
     upsert: () => mockQuery,
     eq: () => mockQuery,
     match: () => mockQuery,
     order: () => mockQuery,
     limit: () => mockQuery,
     single: () => Promise.resolve(mockResult),
     then: (resolve) => resolve(mockArrayResult)
   };

   module.exports = {
     from: () => mockQuery,
     rpc: () => Promise.resolve(mockResult)
   };
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  module.exports = supabase;
}
