import { useMemo, useState } from 'react';
import { BARS } from '../constants/appData';
import BeveragePicker from './BeveragePicker';

function EntryScreen({ bebidas, onSave }) {
  const [form, setForm] = useState({
    bebidaId: bebidas[0]?.id ?? '',
    bar: BARS[0],
    quantidade: 1,
    validade: ''
  });

  const canSave = useMemo(
    () => form.bebidaId && form.bar && Number(form.quantidade) > 0 && form.validade,
    [form]
  );

  const submit = (event) => {
    event.preventDefault();
    if (!canSave) return;

    onSave({
      bebidaId: form.bebidaId,
      bar: form.bar,
      quantidade: Number(form.quantidade),
      validade: form.validade
    });

    setForm((prev) => ({ ...prev, quantidade: 1, validade: '' }));
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Entrada de bebidas</h2>
        <p className="text-sm text-slate-500">Selecione item, bar e validade.</p>
      </header>

      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Bebida</p>
          <BeveragePicker
            bebidas={bebidas}
            selectedId={form.bebidaId}
            onSelect={(bebidaId) => setForm((prev) => ({ ...prev, bebidaId }))}
          />
        </div>

        <label className="block space-y-2 text-sm font-semibold text-slate-700">
          Bar
          <select
            value={form.bar}
            onChange={(event) => setForm((prev) => ({ ...prev, bar: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4 text-base"
          >
            {BARS.map((bar) => (
              <option key={bar} value={bar}>
                {bar}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-sm font-semibold text-slate-700">
          Quantidade
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={form.quantidade}
            onChange={(event) => setForm((prev) => ({ ...prev, quantidade: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4 text-2xl font-bold"
          />
        </label>

        <label className="block space-y-2 text-sm font-semibold text-slate-700">
          Data de validade
          <input
            type="date"
            value={form.validade}
            onChange={(event) => setForm((prev) => ({ ...prev, validade: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4 text-base"
          />
        </label>

        <button
          type="submit"
          disabled={!canSave}
          className="w-full rounded-2xl bg-emerald-500 px-4 py-4 text-lg font-black text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          Salvar lote
        </button>
      </form>
    </section>
  );
}

export default EntryScreen;
