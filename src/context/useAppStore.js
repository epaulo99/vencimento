import { create } from 'zustand';
import { persistData, hydrateStorage } from '../utils/storage';
import { fetchRemoteState, upsertRemoteState } from '../utils/supabaseState';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
};

const hydrated = hydrateStorage();

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

  login: ({ username, password }) => {
    const user = get().users.find(
      (item) => item.username.toLowerCase() === username.toLowerCase() && item.password === password
    );

    if (!user) {
      return { ok: false, message: 'Credenciais invalidas.' };
    }

    const safeUser = { id: user.id, username: user.username, role: user.role };
    set({ currentUser: safeUser });
    persistData({ currentUser: safeUser });
    return { ok: true };
  },

  requestAccess: ({ username, password }) => {
    const normalized = username.trim().toLowerCase();
    if (!normalized || !password) {
      return { ok: false, message: 'Preencha usuario e senha.' };
    }

    const alreadyUser = get().users.some((item) => item.username.toLowerCase() === normalized);
    if (alreadyUser) {
      return { ok: false, message: 'Usuario ja existe. Tente fazer login.' };
    }

    const alreadyPending = get().pendingUsers.some((item) => item.username.toLowerCase() === normalized);
    if (alreadyPending) {
      return { ok: false, message: 'Solicitacao ja enviada e aguardando aprovacao.' };
    }

    const alreadyRejected = get().rejectedUsers.some((item) => item.username.toLowerCase() === normalized);
    if (alreadyRejected) {
      return { ok: false, message: 'Solicitacao foi recusada. Aguarde nova aprovacao do admin.' };
    }

    const pendingUsers = [
      {
        id: makeId(),
        username: username.trim(),
        password,
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
        password: request.password,
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
        password: request.password,
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
        password: target.password,
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

  logout: () => {
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
