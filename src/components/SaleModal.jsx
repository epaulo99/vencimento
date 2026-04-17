import { useState } from 'react';

function SaleModal({ item, onClose, onConfirm }) {
  const [qty, setQty] = useState(1);

  if (!item) return null;

  const max = item.quantidadeRestante;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-bold text-slate-900">Baixa de produto</h3>
        <p className="text-sm text-slate-600">{item.bebidaNome}</p>
        <p className="text-xs text-slate-500">Restante: {item.quantidadeRestante}</p>

        <label className="mt-3 block space-y-2 text-sm font-semibold text-slate-700">
          Quantidade vendida
          <input
            type="number"
            min="1"
            max={max}
            value={qty}
            onChange={(event) => setQty(Number(event.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-xl font-black"
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(item.id, Math.min(max, Math.max(1, Number(qty) || 1)))}
            className="rounded-2xl bg-emerald-500 px-4 py-3 font-black text-slate-900"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaleModal;
