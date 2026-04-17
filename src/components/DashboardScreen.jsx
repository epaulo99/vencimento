import { BARS } from '../constants/appData';
import { formatDateBR } from '../utils/date';

const severityStyles = {
  critical: 'bg-rose-100 border-rose-300 text-rose-800',
  warning: 'bg-amber-100 border-amber-300 text-amber-800',
  ok: 'bg-emerald-100 border-emerald-300 text-emerald-800'
};

function StockItem({ item, onSell }) {
  return (
    <article className={`rounded-2xl border p-3 ${severityStyles[item.severity]}`}>
      <div className="flex items-start gap-3">
        {item.bebidaImagem ? (
          <img src={item.bebidaImagem} alt={item.bebidaNome} className="h-16 w-16 rounded-xl object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-slate-200" />
        )}

        <div className="flex-1 space-y-1">
          <p className="text-sm font-bold">{item.bebidaNome}</p>
          <p className="text-xs opacity-90">{item.bar}</p>
          <p className="text-xs opacity-90">Validade: {formatDateBR(item.validade)}</p>
          <p className="text-sm font-semibold">Restante: {item.quantidadeRestante}</p>
          <p className="text-xs font-semibold">
            {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)} dias vencido` : `${item.daysLeft} dias restantes`}
          </p>
        </div>
      </div>

      <button
        onClick={() => onSell(item)}
        className="mt-3 w-full rounded-xl bg-slate-100 px-3 py-3 text-sm font-bold"
      >
        Dar baixa
      </button>
    </article>
  );
}

function DashboardScreen({ items, warnings, criticals, selectedBar, setSelectedBar, onSell }) {
  const groups = BARS.map((bar) => ({
    bar,
    count: items.filter((item) => item.bar === bar).length
  }));

  const filteredItems = selectedBar === 'Todos' ? items : items.filter((item) => item.bar === selectedBar);

  return (
    <section className="space-y-4">
      <header className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-800">
            <p className="text-xs">Proximos (30 dias)</p>
            <p className="text-2xl font-black">{warnings.length}</p>
          </div>
          <div className="rounded-2xl bg-rose-500/20 p-3 text-rose-700">
            <p className="text-xs">Criticos (7 dias)</p>
            <p className="text-2xl font-black">{criticals.length}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {groups.map((group) => (
          <div key={group.bar} className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
            <p className="text-[11px] text-slate-500">{group.bar.replace('Bar ', '')}</p>
            <p className="text-2xl font-black text-slate-900">{group.count}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['Todos', ...BARS].map((bar) => (
          <button
            key={bar}
            onClick={() => setSelectedBar(bar)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
              selectedBar === bar ? 'bg-emerald-500 text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {bar}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-amber-700">Proximos do vencimento</h3>
        {filteredItems.filter((item) => item.severity === 'warning').length === 0 ? (
          <p className="rounded-xl bg-white p-3 text-sm text-slate-500">Sem alertas amarelos.</p>
        ) : (
          filteredItems
            .filter((item) => item.severity === 'warning')
            .map((item) => <StockItem key={item.id} item={item} onSell={onSell} />)
        )}
      </div>

      <div className="space-y-2 pb-24">
        <h3 className="text-sm font-semibold text-rose-700">Criticos</h3>
        {filteredItems.filter((item) => item.severity === 'critical').length === 0 ? (
          <p className="rounded-xl bg-white p-3 text-sm text-slate-500">Sem alertas criticos.</p>
        ) : (
          filteredItems
            .filter((item) => item.severity === 'critical')
            .map((item) => <StockItem key={item.id} item={item} onSell={onSell} />)
        )}
      </div>
    </section>
  );
}

export default DashboardScreen;
