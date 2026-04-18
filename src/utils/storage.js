import { DEFAULT_BEBIDAS, DEFAULT_USERS, STORAGE_KEYS } from '../constants/appData';
import { upsertRemoteState } from './supabaseState';

const safeJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getStorage = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const key = '__storage_check__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return window.localStorage;
  } catch {
    return null;
  }
};

const readSnapshot = (storage) => ({
  users: safeJSON(storage.getItem(STORAGE_KEYS.users), DEFAULT_USERS) ?? DEFAULT_USERS,
  pendingUsers: safeJSON(storage.getItem(STORAGE_KEYS.pendingUsers), []) ?? [],
  rejectedUsers: safeJSON(storage.getItem(STORAGE_KEYS.rejectedUsers), []) ?? [],
  theme: storage.getItem(STORAGE_KEYS.theme) === 'dark' ? 'dark' : 'light',
  bebidas: safeJSON(storage.getItem(STORAGE_KEYS.bebidas), DEFAULT_BEBIDAS) ?? DEFAULT_BEBIDAS,
  lotes: safeJSON(storage.getItem(STORAGE_KEYS.lotes), []) ?? []
});

const syncRemote = (storage) => {
  // The logged user is device-local state and must never be shared remotely.
  const snapshot = readSnapshot(storage);
  void upsertRemoteState(snapshot);
};

export const hydrateStorage = () => {
  const storage = getStorage();

  if (!storage) {
    return {
      users: DEFAULT_USERS,
      pendingUsers: [],
      rejectedUsers: [],
      theme: 'light',
      bebidas: DEFAULT_BEBIDAS,
      lotes: [],
      currentUser: null
    };
  }

  const users = safeJSON(storage.getItem(STORAGE_KEYS.users), null);
  const pendingUsers = safeJSON(storage.getItem(STORAGE_KEYS.pendingUsers), null);
  const rejectedUsers = safeJSON(storage.getItem(STORAGE_KEYS.rejectedUsers), null);
  const theme = storage.getItem(STORAGE_KEYS.theme);
  const bebidas = safeJSON(storage.getItem(STORAGE_KEYS.bebidas), null);
  const lotes = safeJSON(storage.getItem(STORAGE_KEYS.lotes), null);

  if (!users) {
    storage.setItem(STORAGE_KEYS.users, JSON.stringify(DEFAULT_USERS));
  }

  if (!bebidas) {
    storage.setItem(STORAGE_KEYS.bebidas, JSON.stringify(DEFAULT_BEBIDAS));
  }

  if (!pendingUsers) {
    storage.setItem(STORAGE_KEYS.pendingUsers, JSON.stringify([]));
  }

  if (!rejectedUsers) {
    storage.setItem(STORAGE_KEYS.rejectedUsers, JSON.stringify([]));
  }

  if (!theme || (theme !== 'light' && theme !== 'dark')) {
    storage.setItem(STORAGE_KEYS.theme, 'light');
  }

  if (!lotes) {
    storage.setItem(STORAGE_KEYS.lotes, JSON.stringify([]));
  }

  return {
    users: users ?? DEFAULT_USERS,
    pendingUsers: pendingUsers ?? [],
    rejectedUsers: rejectedUsers ?? [],
    theme: theme === 'dark' ? 'dark' : 'light',
    bebidas: bebidas ?? DEFAULT_BEBIDAS,
    lotes: lotes ?? [],
    currentUser: safeJSON(storage.getItem(STORAGE_KEYS.currentUser), null)
  };
};

export const persistData = ({ users, pendingUsers, rejectedUsers, theme, bebidas, lotes, currentUser }) => {
  const storage = getStorage();
  if (!storage) return;

  if (users !== undefined) storage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  if (pendingUsers !== undefined) storage.setItem(STORAGE_KEYS.pendingUsers, JSON.stringify(pendingUsers));
  if (rejectedUsers !== undefined) storage.setItem(STORAGE_KEYS.rejectedUsers, JSON.stringify(rejectedUsers));
  if (theme !== undefined) storage.setItem(STORAGE_KEYS.theme, theme);
  if (bebidas !== undefined) storage.setItem(STORAGE_KEYS.bebidas, JSON.stringify(bebidas));
  if (lotes !== undefined) storage.setItem(STORAGE_KEYS.lotes, JSON.stringify(lotes));

  if (currentUser !== undefined && currentUser !== null) {
    storage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
  } else if (currentUser === null) {
    storage.removeItem(STORAGE_KEYS.currentUser);
  }

  syncRemote(storage);
};
