import { useState } from 'react';

const FALLBACK_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%230f172a%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2230%22 fill=%22%2394a3b8%22 font-family=%22Arial%22%3ESem imagem%3C/text%3E%3C/svg%3E';

const optimizeRemoteUrl = (value) => {
  try {
    const url = new URL(value);
    if (url.hostname.includes('unsplash.com')) {
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('w', '480');
      url.searchParams.set('q', '70');
      return url.toString();
    }
    return value;
  } catch {
    return value;
  }
};

const optimizeUpload = (file) =>
  new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const maxSide = 900;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')?.drawImage(image, 0, 0, width, height);

      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(outputType, 0.8);
      URL.revokeObjectURL(objectUrl);
      resolve(dataUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve('');
    };

    image.src = objectUrl;
  });

const formatRequestDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
};

function SettingsScreen({
  currentUser,
  users,
  bebidas,
  pendingUsers,
  rejectedUsers,
  theme,
  onAddBebida,
  onUpdateBebida,
  onDeleteBebida,
  onApproveUser,
  onApproveRejectedUser,
  onDeleteRejectedUser,
  onRejectApprovedUser,
  onUpdateUserRole,
  onRejectUser,
  onThemeChange,
  onLogout
}) {
  const [form, setForm] = useState({ nome: '', categoria: '', imagem: '' });
  const [editForm, setEditForm] = useState({ nome: '', categoria: '', imagem: '' });
  const [editingBebidaId, setEditingBebidaId] = useState(null);
  const [roleMessage, setRoleMessage] = useState('');
  const [beverageMessage, setBeverageMessage] = useState('');

  const uploadImage = async (event, mode = 'create') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const optimized = await optimizeUpload(file);
    if (!optimized) return;

    if (mode === 'edit') {
      setEditForm((prev) => ({ ...prev, imagem: optimized }));
      return;
    }

    setForm((prev) => ({ ...prev, imagem: optimized }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.nome || !form.categoria || !form.imagem) return;
    onAddBebida({
      ...form,
      imagem: form.imagem.startsWith('http') ? optimizeRemoteUrl(form.imagem) : form.imagem
    });
    setForm({ nome: '', categoria: '', imagem: '' });
    setBeverageMessage('Bebida cadastrada com sucesso.');
  };

  const startEditBebida = (bebida) => {
    setEditingBebidaId(bebida.id);
    setEditForm({
      nome: bebida.nome,
      categoria: bebida.categoria,
      imagem: bebida.imagem
    });
    setBeverageMessage('');
  };

  const cancelEditBebida = () => {
    setEditingBebidaId(null);
    setEditForm({ nome: '', categoria: '', imagem: '' });
  };

  const submitEditBebida = (event) => {
    event.preventDefault();
    if (!editingBebidaId) return;

    const payload = {
      bebidaId: editingBebidaId,
      nome: editForm.nome,
      categoria: editForm.categoria,
      imagem: editForm.imagem.startsWith('http') ? optimizeRemoteUrl(editForm.imagem) : editForm.imagem
    };

    const result = onUpdateBebida(payload);
    if (!result?.ok) {
      setBeverageMessage(result?.message ?? 'Nao foi possivel editar a bebida.');
      return;
    }

    setBeverageMessage('Bebida atualizada com sucesso.');
    cancelEditBebida();
  };

  const handleDeleteBebida = (bebida) => {
    const confirmed = window.confirm(`Deseja apagar a bebida "${bebida.nome}"?`);
    if (!confirmed) return;

    const result = onDeleteBebida(bebida.id);
    if (!result?.ok) {
      setBeverageMessage(result?.message ?? 'Nao foi possivel apagar a bebida.');
      return;
    }

    if (editingBebidaId === bebida.id) {
      cancelEditBebida();
    }
    setBeverageMessage('Bebida apagada com sucesso.');
  };

  const isAdmin = currentUser.role === 'admin';

  const handleRoleChange = (userId, role) => {
    const result = onUpdateUserRole({ userId, role });
    if (!result?.ok) {
      setRoleMessage(result?.message ?? 'Nao foi possivel atualizar o perfil.');
      return;
    }
    setRoleMessage('');
  };

  const handleRejectApproved = (userId) => {
    const result = onRejectApprovedUser(userId);
    if (!result?.ok) {
      setRoleMessage(result?.message ?? 'Nao foi possivel mover para recusados.');
      return;
    }
    setRoleMessage('');
  };

  const handleDeleteRejected = (requestId, username) => {
    const confirmed = window.confirm(`Deseja apagar definitivamente a solicitacao de "${username}"?`);
    if (!confirmed) return;

    const result = onDeleteRejectedUser(requestId);
    if (!result?.ok) {
      setRoleMessage(result?.message ?? 'Nao foi possivel apagar solicitacao recusada.');
      return;
    }
    setRoleMessage('');
  };

  return (
    <section className="space-y-4 pb-24">
      <header className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Logado como</p>
            <p className="text-lg font-bold text-slate-900">
              {currentUser.username} ({currentUser.role})
            </p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900"
          >
            Sair
          </button>
        </div>
        <div className="mt-3 rounded-2xl bg-slate-100 p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => onThemeChange('light')}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${
                theme === 'light' ? 'bg-emerald-500 text-slate-900' : 'text-slate-600'
              }`}
            >
              Claro
            </button>
            <button
              type="button"
              onClick={() => onThemeChange('dark')}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${
                theme === 'dark' ? 'bg-emerald-500 text-slate-900' : 'text-slate-600'
              }`}
            >
              Escuro
            </button>
          </div>
        </div>
      </header>

      {!isAdmin ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Apenas admin pode cadastrar, editar, apagar bebidas e aprovar usuarios.
        </p>
      ) : (
        <>
          <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Usuarios aprovados</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                {users.length}
              </span>
            </div>

            {roleMessage && (
              <p className="rounded-xl bg-amber-100 px-3 py-2 text-sm text-amber-800">{roleMessage}</p>
            )}

            <div className="space-y-2">
              {users.map((user) => (
                <article key={user.id} className="rounded-2xl border border-slate-200 bg-slate-100/90 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.username}</p>
                      <p className="text-xs text-slate-500">Perfil atual: {user.role}</p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
                      {user.id === currentUser.id ? 'Voce' : 'Usuario'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRoleChange(user.id, 'barman')}
                      className={`rounded-xl px-2 py-2 text-xs font-black ${
                        user.role === 'barman'
                          ? 'bg-emerald-500 text-slate-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Barman
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange(user.id, 'admin')}
                      className={`rounded-xl px-2 py-2 text-xs font-black ${
                        user.role === 'admin'
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRejectApproved(user.id)}
                    className="mt-2 w-full rounded-xl bg-rose-600 px-2 py-2 text-xs font-black text-white"
                  >
                    Mover para recusados
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Solicitacoes de acesso</h2>
              <span className="rounded-full bg-rose-500/20 px-2 py-1 text-xs font-bold text-rose-700">
                {pendingUsers.length}
              </span>
            </div>

            {pendingUsers.length === 0 ? (
              <p className="rounded-xl bg-slate-100 px-3 py-3 text-sm text-slate-600">
                Sem solicitacoes pendentes.
              </p>
            ) : (
              <div className="space-y-2">
                {pendingUsers.map((user) => (
                  <article key={user.id} className="rounded-2xl border border-slate-200 bg-slate-100/90 p-3">
                    <p className="text-sm font-bold text-slate-900">{user.username}</p>
                    <p className="text-xs text-slate-500">Solicitado em: {formatRequestDate(user.requestedAt)}</p>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => onApproveUser({ requestId: user.id, role: 'barman' })}
                        className="rounded-xl bg-emerald-500 px-2 py-2 text-xs font-black text-slate-900"
                      >
                        Aprovar barman
                      </button>
                      <button
                        type="button"
                        onClick={() => onApproveUser({ requestId: user.id, role: 'admin' })}
                        className="rounded-xl bg-amber-500 px-2 py-2 text-xs font-black text-slate-900"
                      >
                        Aprovar admin
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectUser(user.id)}
                        className="rounded-xl bg-rose-600 px-2 py-2 text-xs font-black text-white"
                      >
                        Recusar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Solicitacoes recusadas</h2>
              <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700">
                {rejectedUsers.length}
              </span>
            </div>

            {rejectedUsers.length === 0 ? (
              <p className="rounded-xl bg-slate-100 px-3 py-3 text-sm text-slate-600">
                Sem solicitacoes recusadas.
              </p>
            ) : (
              <div className="space-y-2">
                {rejectedUsers.map((user) => (
                  <article key={user.id} className="rounded-2xl border border-slate-200 bg-slate-100/90 p-3">
                    <p className="text-sm font-bold text-slate-900">{user.username}</p>
                    <p className="text-xs text-slate-500">Recusado em: {formatRequestDate(user.rejectedAt)}</p>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => onApproveRejectedUser({ requestId: user.id, role: 'barman' })}
                        className="rounded-xl bg-emerald-500 px-2 py-2 text-xs font-black text-slate-900"
                      >
                        Aprovar barman
                      </button>
                      <button
                        type="button"
                        onClick={() => onApproveRejectedUser({ requestId: user.id, role: 'admin' })}
                        className="rounded-xl bg-amber-500 px-2 py-2 text-xs font-black text-slate-900"
                      >
                        Aprovar admin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRejected(user.id, user.username)}
                        className="rounded-xl bg-rose-600 px-2 py-2 text-xs font-black text-white"
                      >
                        Apagar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <form onSubmit={submit} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-bold text-slate-900">Cadastro de bebidas</h2>

            <input
              required
              value={form.nome}
              onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
              placeholder="Nome"
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3"
            />

            <input
              required
              value={form.categoria}
              onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))}
              placeholder="Categoria"
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3"
            />

            <input
              value={form.imagem}
              onChange={(event) => setForm((prev) => ({ ...prev, imagem: event.target.value }))}
              placeholder="URL da imagem"
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3"
            />

            <label className="block rounded-2xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
              Ou enviar imagem
              <input
                type="file"
                accept="image/*"
                onChange={(event) => uploadImage(event, 'create')}
                className="mt-2 block w-full"
              />
            </label>

            <button type="submit" className="w-full rounded-2xl bg-emerald-500 px-4 py-4 text-base font-black text-slate-900">
              Cadastrar bebida
            </button>
          </form>
        </>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-600">Bebidas cadastradas</h3>

        {beverageMessage && (
          <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-800">{beverageMessage}</p>
        )}

        {isAdmin && editingBebidaId && (
          <form onSubmit={submitEditBebida} className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4">
            <h4 className="text-sm font-black text-amber-800">Editando bebida</h4>

            <input
              required
              value={editForm.nome}
              onChange={(event) => setEditForm((prev) => ({ ...prev, nome: event.target.value }))}
              placeholder="Nome"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />

            <input
              required
              value={editForm.categoria}
              onChange={(event) => setEditForm((prev) => ({ ...prev, categoria: event.target.value }))}
              placeholder="Categoria"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />

            <input
              required
              value={editForm.imagem}
              onChange={(event) => setEditForm((prev) => ({ ...prev, imagem: event.target.value }))}
              placeholder="URL da imagem"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />

            <label className="block rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
              Ou enviar imagem
              <input
                type="file"
                accept="image/*"
                onChange={(event) => uploadImage(event, 'edit')}
                className="mt-2 block w-full"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="submit"
                className="rounded-xl bg-emerald-500 px-3 py-3 text-sm font-black text-slate-900"
              >
                Salvar edicao
              </button>
              <button
                type="button"
                onClick={cancelEditBebida}
                className="rounded-xl bg-slate-200 px-3 py-3 text-sm font-bold text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 gap-3">
          {bebidas.map((bebida) => (
            <article key={bebida.id} className="rounded-2xl border border-slate-200 bg-white p-2">
              <div className="overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={bebida.imagem}
                  alt={bebida.nome}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 480px) 45vw, 220px"
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                  className="h-20 w-full object-contain"
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{bebida.nome}</p>
              <p className="text-xs text-slate-500">{bebida.categoria}</p>

              {isAdmin && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => startEditBebida(bebida)}
                    className="rounded-xl bg-slate-100 px-2 py-2 text-xs font-black text-slate-700"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBebida(bebida)}
                    className="rounded-xl bg-rose-600 px-2 py-2 text-xs font-black text-white"
                  >
                    Apagar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default SettingsScreen;
