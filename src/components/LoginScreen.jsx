import { useState } from 'react';

function LoginScreen({ onLogin, onRequestAccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submitLogin = (event) => {
    event.preventDefault();
    const result = onLogin(form);
    if (!result.ok) {
      setError(result.message);
      setSuccess('');
      return;
    }
    setError('');
    setSuccess('');
  };

  const submitRequest = (event) => {
    event.preventDefault();
    const result = onRequestAccess(form);
    if (!result.ok) {
      setError(result.message);
      setSuccess('');
      return;
    }
    setError('');
    setSuccess(result.message);
    setForm({ username: '', password: '' });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-glow">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Validade de Bebidas</h1>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            onClick={() => {
              setMode('login');
              setError('');
              setSuccess('');
            }}
            className={`rounded-xl px-3 py-2 text-sm font-bold ${
              mode === 'login' ? 'bg-emerald-500 text-slate-900' : 'text-slate-700'
            }`}
            type="button"
          >
            Entrar
          </button>
          <button
            onClick={() => {
              setMode('request');
              setError('');
              setSuccess('');
            }}
            className={`rounded-xl px-3 py-2 text-sm font-bold ${
              mode === 'request' ? 'bg-emerald-500 text-slate-900' : 'text-slate-700'
            }`}
            type="button"
          >
            Novo usuario
          </button>
        </div>

        <form onSubmit={mode === 'login' ? submitLogin : submitRequest} className="space-y-4">
          <label className="block space-y-2 text-sm font-semibold text-slate-700">
            Usuario
            <input
              required
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3"
              placeholder="Digite seu usuario"
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-slate-700">
            Senha
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3"
              placeholder="Digite sua senha"
            />
          </label>

          {error && <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p>}
          {success && <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{success}</p>}

          <button className="w-full rounded-2xl bg-emerald-500 px-4 py-4 text-lg font-bold text-slate-900">
            {mode === 'login' ? 'Entrar' : 'Solicitar acesso'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default LoginScreen;
