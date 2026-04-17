const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: 'DB' },
  { id: 'entrada', label: 'Entrada', icon: '+' },
  { id: 'estoque', label: 'Estoque', icon: 'ST' },
  { id: 'config', label: 'Config', icon: 'CF' }
];

function BottomNav({ current, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 py-2">
        {tabs.map((tab) => {
          const active = tab.id === current;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`rounded-2xl px-2 py-3 text-xs font-semibold transition ${
                active ? 'bg-emerald-500 text-slate-900' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <span className="mb-1 block text-sm font-black">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;