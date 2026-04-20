import { useEffect, useState } from 'react';

function SaleModal({ item, onClose, onConfirm }) {
  const [qty, setQty] = useState('');

  useEffect(() => {
    if (!item) return;
    setQty('');
  }, [item?.id, item?.quantidadeRestante]);

  if (!item) return null;

  const max = item.quantidadeRestante;
  const numericQty = Number(qty);
  const safeQty = Math.min(max, Math.max(1, Number.isFinite(numericQty) ? numericQty : 0));
  const canConfirm = Number.isFinite(numericQty) && numericQty >= 1;

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
            placeholder="0"
            onChange={(event) => {
              const nextValue = event.target.value;
              if (nextValue === '') {
                setQty('');
                return;
              }

              const next = Number(nextValue);
              setQty(String(Math.min(max, Math.max(0, Number.isFinite(next) ? next : 0))));
            }}
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-xl font-black placeholder:text-slate-400"
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirm(item.id, safeQty)}
            className="rounded-2xl bg-emerald-500 px-4 py-3 font-black text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaleModal;
