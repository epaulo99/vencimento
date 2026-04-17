import { create } from 'zustand';
import { persistData, hydrateStorage } from '../utils/storage';
import { fetchRemoteState, upsertRemoteState } from '../utils/supabaseState';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { DEFAULT_USERS } from '../constants/appData';

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
};

const hydrated = hydrateStorage();

const normalizeUsername = (value) => String(value ?? '').trim().toLowerCase();
const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();

const getPersistableSlice = (state) => ({
  users: state.users,
  pendingUsers: state.pendingUsers,
  rejectedUsers: state.rejectedUsers,
  theme: state.theme,
  bebidas: state.bebidas,
  lotes: state.lotes,
  currentUser: state.currentUser
});

export const useAppStore = create((set, get) => ({
  users: hydrated.users,
  pendingUsers: hydrated.pendingUsers ?? [],
  rejectedUsers: hydrated.rejectedUsers ?? [],
  theme: hydrated.theme ?? 'light',
  bebidas: hydrated.bebidas,
  lotes: hydrated.lotes,
  currentUser: hydrated.currentUser,
  remoteBootstrapped: false,

  bootstrapFromSupabase: async () => {
    if (get().remoteBootstrapped || !isSupabaseConfigured) {
      set({ remoteBootstrapped: true });
      return;
    }

    const remote = await fetchRemoteState();

    if (remote) {
      set({
        users: remote.users,
        pendingUsers: remote.pendingUsers,
        rejectedUsers: remote.rejectedUsers,
        theme: remote.theme,
        bebidas: remote.bebidas,
        lotes: remote.lotes,
        currentUser: remote.currentUser,
        remoteBootstrapped: true
      });
      persistData(remote);
      return;
    }

    await upsertRemoteState(getPersistableSlice(get()));
    set({ remoteBootstrapped: true });
  },

  login: async ({ username, email, password }) => {
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = String(password ?? '');

    if (!normalizedPassword || (!normalizedEmail && !normalizedUsername)) {
      return { ok: false, message: 'Preencha email e senha.' };
    }

    if (isSupabaseConfigured && supabase) {
      const emailForAuth = normalizedEmail || normalizedUsername;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailForAuth,
        password: normalizedPassword
      });

      if (error || !data.user) {
        return { ok: false, message: 'Email ou senha invalidos.' };
      }

      const authUser = data.user;
      let users = get().users;
      let user = users.find(
        (item) =>
          normalizeEmail(item.email) === normalizeEmail(authUser.email) ||
          (item.authUserId && item.authUserId === authUser.id)
      );

      // Force a remote refresh after auth to avoid stale local data causing false "not approved" errors.
      if (!user) {
        const remote = await fetchRemoteState();
        if (remote) {
          set({
            users: remote.users,
            pendingUsers: remote.pendingUsers,
            rejectedUsers: remote.rejectedUsers,
            theme: remote.theme,
            bebidas: remote.bebidas,
            lotes: remote.lotes,
            currentUser: remote.currentUser
          });
          persistData(remote);
          users = remote.users ?? [];
          user = users.find(
            (item) =>
              normalizeEmail(item.email) === normalizeEmail(authUser.email) ||
              (item.authUserId && item.authUserId === authUser.id)
          );
        }
      }

      // Backward compatibility: link old user rows that only had username.
      if (!user) {
        const metadataUsername = normalizeUsername(authUser.user_metadata?.username);
        if (metadataUsername) {
          const byName = users.find((item) => normalizeUsername(item.username) === metadataUsername);
          if (byName) {
            users = users.map((item) =>
              item.id === byName.id
                ? {
                    ...item,
                    email: authUser.email ?? byName.email ?? '',
                    authUserId: authUser.id
                  }
                : item
            );
            set({ users });
            persistData({ users });
            user = users.find((item) => item.id === byName.id);
          }
        }
      }

      if (!user) {
        await supabase.auth.signOut();
        return { ok: false, message: 'Conta autenticada, mas sem aprovacao do admin.' };
      }

      const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email ?? authUser.email ?? '',
        role: user.role
      };
      set({ currentUser: safeUser });
      persistData({ currentUser: safeUser });
      return { ok: true };
    }

    const identity = normalizedEmail || normalizedUsername;
    let users = get().users;
    let user = users.find(
      (item) =>
        (normalizeUsername(item.username) === identity || normalizeEmail(item.email) === identity) &&
        item.password === normalizedPassword
    );

    if (!user) {
      const fallbackUser = DEFAULT_USERS.find(
        (item) =>
          (normalizeUsername(item.username) === identity || normalizeEmail(item.email) === identity) &&
          item.password === normalizedPassword
      );

      if (fallbackUser) {
        users = [
          fallbackUser,
          ...users.filter((item) => normalizeUsername(item.username) !== normalizeUsername(fallbackUser.username))
        ];
        set({ users });
        persistData({ users });
        user = fallbackUser;
      }
    }

    if (!user) {
      return { ok: false, message: 'Credenciais invalidas.' };
    }

    const safeUser = { id: user.id, username: user.username, email: user.email ?? '', role: user.role };
    set({ currentUser: safeUser });
    persistData({ currentUser: safeUser });
    return { ok: true };
  },

  requestAccess: async ({ username, email, password }) => {
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = String(password ?? '');

    if (!normalizedUsername || !normalizedEmail || !normalizedPassword) {
      return { ok: false, message: 'Preencha usuario, email e senha.' };
    }

    const alreadyUser = get().users.some((item) => normalizeUsername(item.username) === normalizedUsername);
    if (alreadyUser) {
      return { ok: false, message: 'Usuario ja existe. Escolha outro nome.' };
    }

    const alreadyPending = get().pendingUsers.some(
      (item) => normalizeUsername(item.username) === normalizedUsername
    );
    if (alreadyPending) {
      return { ok: false, message: 'Solicitacao ja enviada com esse usuario.' };
    }

    const alreadyRejected = get().rejectedUsers.some(
      (item) => normalizeUsername(item.username) === normalizedUsername
    );
    if (alreadyRejected) {
      return { ok: false, message: 'Esse usuario foi recusado. Use outro nome.' };
    }

    const emailAlreadyUsed = [...get().users, ...get().pendingUsers, ...get().rejectedUsers].some(
      (item) => normalizeEmail(item.email) === normalizedEmail
    );
    if (emailAlreadyUsed) {
      return { ok: false, message: 'Email ja utilizado. Use outro email.' };
    }

    let authUserId = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: normalizedPassword,
        options: {
          data: { username: username.trim() }
        }
      });

      if (error) {
        if (error.message?.toLowerCase().includes('already')) {
          return { ok: false, message: 'Esse email ja esta cadastrado no Supabase.' };
        }
        return { ok: false, message: `Falha no cadastro do Supabase: ${error.message}` };
      }

      authUserId = data.user?.id ?? null;
      await supabase.auth.signOut();
    }

    const pendingUsers = [
      {
        id: makeId(),
        username: username.trim(),
        email: normalizedEmail,
        authUserId,
        requestedAt: new Date().toISOString()
      },
      ...get().pendingUsers
    ];

    set({ pendingUsers });
    persistData({ pendingUsers });
    return { ok: true, message: 'Solicitacao enviada para aprovacao do admin.' };
  },

  approvePendingUser: ({ requestId, role }) => {
    const request = get().pendingUsers.find((item) => item.id === requestId);
    if (!request) return;

    const users = [
      {
        id: makeId(),
        username: request.username,
        email: request.email ?? '',
        authUserId: request.authUserId ?? null,
        role
      },
      ...get().users
    ];

    const pendingUsers = get().pendingUsers.filter((item) => item.id !== requestId);
    const rejectedUsers = get().rejectedUsers.filter(
      (item) => item.username.toLowerCase() !== request.username.toLowerCase()
    );
    set({ users, pendingUsers, rejectedUsers });
    persistData({ users, pendingUsers, rejectedUsers });
  },

  rejectPendingUser: (requestId) => {
    const request = get().pendingUsers.find((item) => item.id === requestId);
    if (!request) return;

    const pendingUsers = get().pendingUsers.filter((item) => item.id !== requestId);
    const rejectedUsers = [
      {
        ...request,
        rejectedAt: new Date().toISOString()
      },
      ...get().rejectedUsers.filter(
        (item) => item.username.toLowerCase() !== request.username.toLowerCase()
      )
    ];
    set({ pendingUsers, rejectedUsers });
    persistData({ pendingUsers, rejectedUsers });
  },

  approveRejectedUser: ({ requestId, role }) => {
    const request = get().rejectedUsers.find((item) => item.id === requestId);
    if (!request) return;

    const users = [
      {
        id: makeId(),
        username: request.username,
        email: request.email ?? '',
        authUserId: request.authUserId ?? null,
        role
      },
      ...get().users
    ];

    const rejectedUsers = get().rejectedUsers.filter((item) => item.id !== requestId);
    set({ users, rejectedUsers });
    persistData({ users, rejectedUsers });
  },

  deleteRejectedUser: (requestId) => {
    const request = get().rejectedUsers.find((item) => item.id === requestId);
    if (!request) {
      return { ok: false, message: 'Solicitacao recusada nao encontrada.' };
    }

    const rejectedUsers = get().rejectedUsers.filter((item) => item.id !== requestId);
    set({ rejectedUsers });
    persistData({ rejectedUsers });
    return { ok: true };
  },

  rejectApprovedUser: (userId) => {
    const target = get().users.find((item) => item.id === userId);
    if (!target) {
      return { ok: false, message: 'Usuario nao encontrado.' };
    }

    const currentUser = get().currentUser;
    if (currentUser?.id === userId) {
      return { ok: false, message: 'Voce nao pode recusar seu proprio usuario.' };
    }

    const adminCount = get().users.filter((item) => item.role === 'admin').length;
    if (target.role === 'admin' && adminCount <= 1) {
      return { ok: false, message: 'Nao e possivel recusar o ultimo admin.' };
    }

    const users = get().users.filter((item) => item.id !== userId);
    const rejectedUsers = [
      {
        id: makeId(),
        username: target.username,
        email: target.email ?? '',
        authUserId: target.authUserId ?? null,
        requestedAt: new Date().toISOString(),
        rejectedAt: new Date().toISOString(),
        previousRole: target.role
      },
      ...get().rejectedUsers.filter(
        (item) => item.username.toLowerCase() !== target.username.toLowerCase()
      )
    ];

    set({ users, rejectedUsers });
    persistData({ users, rejectedUsers });
    return { ok: true };
  },

  updateUserRole: ({ userId, role }) => {
    if (role !== 'admin' && role !== 'barman') {
      return { ok: false, message: 'Perfil invalido.' };
    }

    const target = get().users.find((item) => item.id === userId);
    if (!target) {
      return { ok: false, message: 'Usuario nao encontrado.' };
    }

    const adminCount = get().users.filter((item) => item.role === 'admin').length;
    if (target.role === 'admin' && role === 'barman' && adminCount <= 1) {
      return { ok: false, message: 'Nao e possivel remover o ultimo admin.' };
    }

    const users = get().users.map((item) => (item.id === userId ? { ...item, role } : item));

    const currentUser = get().currentUser;
    const nextCurrentUser =
      currentUser && currentUser.id === userId ? { ...currentUser, role } : currentUser;

    set({ users, currentUser: nextCurrentUser });
    persistData({ users, currentUser: nextCurrentUser });
    return { ok: true };
  },

  setTheme: (theme) => {
    if (theme !== 'light' && theme !== 'dark') return;
    set({ theme });
    persistData({ theme });
  },

  logout: async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    set({ currentUser: null });
    persistData({ currentUser: null });
  },

  addBebida: ({ nome, categoria, imagem }) => {
    const bebida = {
      id: makeId(),
      nome,
      categoria,
      imagem
    };

    const bebidas = [bebida, ...get().bebidas];
    set({ bebidas });
    persistData({ bebidas });
  },

  updateBebida: ({ bebidaId, nome, categoria, imagem }) => {
    const target = get().bebidas.find((item) => item.id === bebidaId);
    if (!target) {
      return { ok: false, message: 'Bebida nao encontrada.' };
    }

    if (!nome?.trim() || !categoria?.trim() || !imagem?.trim()) {
      return { ok: false, message: 'Preencha nome, categoria e imagem.' };
    }

    const bebidas = get().bebidas.map((item) =>
      item.id === bebidaId
        ? {
            ...item,
            nome: nome.trim(),
            categoria: categoria.trim(),
            imagem: imagem.trim()
          }
        : item
    );

    set({ bebidas });
    persistData({ bebidas });
    return { ok: true };
  },

  deleteBebida: (bebidaId) => {
    const target = get().bebidas.find((item) => item.id === bebidaId);
    if (!target) {
      return { ok: false, message: 'Bebida nao encontrada.' };
    }

    const hasLinkedLotes = get().lotes.some((lote) => lote.bebidaId === bebidaId);
    if (hasLinkedLotes) {
      return {
        ok: false,
        message: 'Nao e possivel apagar bebida com lotes ativos. Diminua os lotes primeiro.'
      };
    }

    const bebidas = get().bebidas.filter((item) => item.id !== bebidaId);
    set({ bebidas });
    persistData({ bebidas });
    return { ok: true };
  },

  addLote: ({ bebidaId, bar, quantidade, validade }) => {
    const lote = {
      id: makeId(),
      bebidaId,
      bar,
      quantidade,
      quantidadeRestante: quantidade,
      validade
    };

    const lotes = [lote, ...get().lotes];
    set({ lotes });
    persistData({ lotes });
  },

  sellFromLote: ({ loteId, quantidadeVendida }) => {
    const lotes = get()
      .lotes
      .map((lote) => {
        if (lote.id !== loteId) return lote;
        const quantidadeRestante = Math.max(0, lote.quantidadeRestante - quantidadeVendida);
        return { ...lote, quantidadeRestante };
      })
      .filter((lote) => lote.quantidadeRestante > 0);

    set({ lotes });
    persistData({ lotes });
  }
}));
