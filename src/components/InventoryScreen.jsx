import { useMemo, useState } from 'react';
import { BARS } from '../constants/appData';
import { formatDateBR } from '../utils/date';

function InventoryScreen({ items, onSell }) {
  const [bar, setBar] = useState('Todos');

  const filtered = useMemo(() => {
    const list = bar === 'Todos' ? items : items.filter((item) => item.bar === bar);
    return list;
  }, [bar, items]);

  return (
    <section className="space-y-4 pb-24">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Estoque por lote</h2>
        <p className="text-sm text-slate-500">Ordenado por validade</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['Todos', ...BARS].map((item) => (
          <button
            key={item}
            onClick={() => setBar(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              bar === item ? 'bg-emerald-500 text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Nenhum lote nesse filtro.
          </p>
        )}

        {filtered.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{item.bebidaNome}</p>
                <p className="text-xs text-slate-500">{item.bar}</p>
                <p className="text-xs text-slate-500">Validade: {formatDateBR(item.validade)}</p>
              </div>
              <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-900">
                {item.quantidadeRestante}
              </p>
            </div>
            <button
              onClick={() => onSell(item)}
              className="mt-3 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-900"
            >
              Baixa de produto
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default InventoryScreen;
