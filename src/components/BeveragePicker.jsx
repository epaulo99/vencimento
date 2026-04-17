function BeveragePicker({ bebidas, selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {bebidas.map((bebida) => {
        const active = bebida.id === selectedId;
        return (
          <button
            key={bebida.id}
            type="button"
            onClick={() => onSelect(bebida.id)}
            className={`rounded-2xl border p-2 text-left transition ${
              active
                ? 'border-emerald-400 bg-emerald-500/20 shadow-glow'
                : 'border-slate-200 bg-slate-100'
            }`}
          >
            <img
              src={bebida.imagem}
              alt={bebida.nome}
              className="h-20 w-full rounded-xl bg-white object-contain"
              loading="lazy"
            />
            <p className="mt-2 text-sm font-semibold text-slate-900">{bebida.nome}</p>
            <p className="text-xs text-slate-500">{bebida.categoria}</p>
          </button>
        );
      })}
    </div>
  );
}

export default BeveragePicker;
