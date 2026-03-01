const supabase = require('./supabase_client');
const sqliteDb = require('./database');

const USE_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_url_here';

const dbAdapter = {
  // Generic query method
  async query(table, action, data = null, options = {}) {
    if (USE_SUPABASE) {
      let query = supabase.from(table);
      
      switch (action) {
        case 'select':
          if (options.select) query = query.select(options.select);
          else query = query.select('*');
          
          if (options.match) query = query.match(options.match);
          if (options.eq) {
            for (const [key, val] of Object.entries(options.eq)) {
              query = query.eq(key, val);
            }
          }
          if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending });
          if (options.limit) query = query.limit(options.limit);
          if (options.single) query = query.single();
          
          const { data: resSelect, error: errSelect } = await query;
          if (errSelect) throw errSelect;
          return resSelect;

        case 'insert':
          const { data: resInsert, error: errInsert } = await query.insert(data).select();
          if (errInsert) throw errInsert;
          return resInsert;

        case 'update':
          let updateQuery = query.update(data);
          if (options.match) updateQuery = updateQuery.match(options.match);
          if (options.eq) {
            for (const [key, val] of Object.entries(options.eq)) {
              updateQuery = updateQuery.eq(key, val);
            }
          }
          const { data: resUpdate, error: errUpdate } = await updateQuery.select();
          if (errUpdate) throw errUpdate;
          return resUpdate;

        case 'delete':
          let deleteQuery = query.delete();
          if (options.match) deleteQuery = deleteQuery.match(options.match);
          if (options.eq) {
            for (const [key, val] of Object.entries(options.eq)) {
              deleteQuery = deleteQuery.eq(key, val);
            }
          }
          const { data: resDelete, error: errDelete } = await deleteQuery.select();
          if (errDelete) throw errDelete;
          return resDelete;

        case 'rpc':
          const { data: resRpc, error: errRpc } = await supabase.rpc(table, data);
          if (errRpc) throw errRpc;
          return resRpc;

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } else {
      // Fallback to SQLite (this is more complex because of raw SQL)
      // For now, we'll just throw an error or handle it in index.js
      throw new Error('SQLite fallback not implemented in adapter. Use Supabase.');
    }
  },
  
  isSupabase() {
    return USE_SUPABASE;
  }
};

module.exports = dbAdapter;
