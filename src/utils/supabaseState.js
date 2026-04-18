import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const SETTINGS_ID = 'hotel-main-settings';
const LEGACY_STATE_ROW_ID = 'hotel-main-state';

const COLLECTION_TABLES = [
  { key: 'users', table: 'app_users' },
  { key: 'pendingUsers', table: 'app_pending_users' },
  { key: 'rejectedUsers', table: 'app_rejected_users' },
  { key: 'bebidas', table: 'app_bebidas' },
  { key: 'lotes', table: 'app_lotes' }
];

const mapRowsToItems = (rows) =>
  (rows ?? []).map((row) => ({
    id: row.id,
    ...(row.data ?? {}),
    updatedAt: row.updated_at ?? row.data?.updatedAt ?? null
  }));

const fetchCollection = async (table) => {
  const { data, error } = await supabase
    .from(table)
    .select('id,data,updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Supabase fetch error (${table}): ${error.message}`);
  }

  return mapRowsToItems(data);
};

const fetchSettings = async () => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase fetch error (app_settings): ${error.message}`);
  }

  return {
    theme: data?.theme === 'dark' ? 'dark' : 'light',
    exists: Boolean(data)
  };
};

const fetchLegacyState = async () => {
  const { data, error } = await supabase
    .from('app_state')
    .select('*')
    .eq('id', LEGACY_STATE_ROW_ID)
    .maybeSingle();

  if (error || !data) return null;

  return {
    users: data.users ?? [],
    pendingUsers: data.pending_users ?? [],
    rejectedUsers: data.rejected_users ?? [],
    theme: data.theme === 'dark' ? 'dark' : 'light',
    bebidas: data.bebidas ?? [],
    lotes: data.lotes ?? []
  };
};

const normalizeItemForRow = (item) => {
  const next = { ...(item ?? {}) };
  if (!next.id) {
    return null;
  }
  delete next.updatedAt;
  return { id: next.id, data: next, updated_at: new Date().toISOString() };
};

const syncCollection = async (table, items) => {
  const rows = (items ?? []).map(normalizeItemForRow).filter(Boolean);

  const { data: existing, error: existingError } = await supabase.from(table).select('id');
  if (existingError) {
    throw new Error(`Supabase list error (${table}): ${existingError.message}`);
  }

  if (rows.length) {
    const { error: upsertError } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
    if (upsertError) {
      throw new Error(`Supabase upsert error (${table}): ${upsertError.message}`);
    }
  }

  const keepIds = new Set(rows.map((row) => row.id));
  const staleIds = (existing ?? []).map((row) => row.id).filter((id) => !keepIds.has(id));
  if (staleIds.length) {
    const { error: deleteError } = await supabase.from(table).delete().in('id', staleIds);
    if (deleteError) {
      throw new Error(`Supabase delete error (${table}): ${deleteError.message}`);
    }
  }
};

const saveSettings = async ({ theme }) => {
  const { error } = await supabase.from('app_settings').upsert(
    {
      id: SETTINGS_ID,
      theme: theme === 'dark' ? 'dark' : 'light',
      // Session must stay local to the browser/device.
      current_user_data: null,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(`Supabase upsert error (app_settings): ${error.message}`);
  }
};

export const fetchRemoteStateResult = async () => {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [users, pendingUsers, rejectedUsers, bebidas, lotes, settings] = await Promise.all([
      fetchCollection('app_users'),
      fetchCollection('app_pending_users'),
      fetchCollection('app_rejected_users'),
      fetchCollection('app_bebidas'),
      fetchCollection('app_lotes'),
      fetchSettings()
    ]);

    const hasAnyRow =
      users.length > 0 ||
      pendingUsers.length > 0 ||
      rejectedUsers.length > 0 ||
      bebidas.length > 0 ||
      lotes.length > 0 ||
      settings.exists;

    if (!hasAnyRow) {
      const legacy = await fetchLegacyState();
      if (legacy) {
        return { ok: true, exists: true, state: legacy, error: null };
      }
      return { ok: true, exists: false, state: null, error: null };
    }

    return {
      ok: true,
      exists: true,
      state: {
        users,
        pendingUsers,
        rejectedUsers,
        bebidas,
        lotes,
        theme: settings.theme
      },
      error: null
    };
  } catch (error) {
    console.error(String(error));
    return { ok: false, exists: false, state: null, error };
  }
};

export const fetchRemoteState = async () => {
  const result = await fetchRemoteStateResult();
  if (!result?.ok) return null;
  return result.state;
};

export const upsertRemoteState = async (state) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    for (const collection of COLLECTION_TABLES) {
      await syncCollection(collection.table, state?.[collection.key] ?? []);
    }

    await saveSettings({
      theme: state?.theme ?? 'light'
    });
  } catch (error) {
    console.error(String(error));
  }
};
