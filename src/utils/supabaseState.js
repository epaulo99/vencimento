import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const STATE_ROW_ID = 'hotel-main-state';

const rowToState = (row) => {
  if (!row) return null;

  return {
    users: row.users ?? [],
    pendingUsers: row.pending_users ?? [],
    rejectedUsers: row.rejected_users ?? [],
    theme: row.theme === 'dark' ? 'dark' : 'light',
    bebidas: row.bebidas ?? [],
    lotes: row.lotes ?? [],
    currentUser: row.current_user_data ?? null
  };
};

const stateToRow = (state) => ({
  id: STATE_ROW_ID,
  users: state.users ?? [],
  pending_users: state.pendingUsers ?? [],
  rejected_users: state.rejectedUsers ?? [],
  theme: state.theme === 'dark' ? 'dark' : 'light',
  bebidas: state.bebidas ?? [],
  lotes: state.lotes ?? [],
  current_user_data: state.currentUser ?? null,
  updated_at: new Date().toISOString()
});

export const fetchRemoteState = async () => {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from('app_state')
    .select('*')
    .eq('id', STATE_ROW_ID)
    .maybeSingle();

  if (error) {
    console.error('Supabase fetch error:', error.message);
    return null;
  }

  return rowToState(data);
};

export const upsertRemoteState = async (state) => {
  if (!isSupabaseConfigured || !supabase) return;

  const payload = stateToRow(state);
  const { error } = await supabase.from('app_state').upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Supabase upsert error:', error.message);
  }
};
