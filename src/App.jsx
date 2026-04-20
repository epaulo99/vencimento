import { useEffect, useMemo, useState } from 'react';
import BottomNav from './components/BottomNav';
import CriticalAlertModal from './components/CriticalAlertModal';
import DashboardScreen from './components/DashboardScreen';
import EntryScreen from './components/EntryScreen';
import InventoryScreen from './components/InventoryScreen';
import LoginScreen from './components/LoginScreen';
import SaleModal from './components/SaleModal';
import SettingsScreen from './components/SettingsScreen';
import { useAppStore } from './context/useAppStore';
import { enrichLotes, getCriticalItems, getWarningItems } from './utils/lotes';

function App() {
  const [tab, setTab] = useState('dashboard');
  const [selectedBar, setSelectedBar] = useState('Todos');
  const [saleTarget, setSaleTarget] = useState(null);

  const currentUser = useAppStore((state) => state.currentUser);
  const pendingUsers = useAppStore((state) => state.pendingUsers);
  const rejectedUsers = useAppStore((state) => state.rejectedUsers);
  const theme = useAppStore((state) => state.theme);
  const users = useAppStore((state) => state.users);
  const bebidas = useAppStore((state) => state.bebidas);
  const lotes = useAppStore((state) => state.lotes);
  const login = useAppStore((state) => state.login);
  const requestAccess = useAppStore((state) => state.requestAccess);
  const bootstrapFromSupabase = useAppStore((state) => state.bootstrapFromSupabase);
  const approvePendingUser = useAppStore((state) => state.approvePendingUser);
  const approveRejectedUser = useAppStore((state) => state.approveRejectedUser);
  const deleteRejectedUser = useAppStore((state) => state.deleteRejectedUser);
  const rejectApprovedUser = useAppStore((state) => state.rejectApprovedUser);
  const updateUserRole = useAppStore((state) => state.updateUserRole);
  const rejectPendingUser = useAppStore((state) => state.rejectPendingUser);
  const setTheme = useAppStore((state) => state.setTheme);
  const logout = useAppStore((state) => state.logout);
  const addBebida = useAppStore((state) => state.addBebida);
  const updateBebida = useAppStore((state) => state.updateBebida);
  const deleteBebida = useAppStore((state) => state.deleteBebida);
  const addLote = useAppStore((state) => state.addLote);
  const sellFromLote = useAppStore((state) => state.sellFromLote);

  const bebidasMap = useMemo(() => new Map(bebidas.map((item) => [item.id, item])), [bebidas]);
  const items = useMemo(() => enrichLotes(lotes, bebidasMap), [lotes, bebidasMap]);
  const criticals = useMemo(() => getCriticalItems(items), [items]);
  const warnings = useMemo(() => getWarningItems(items), [items]);

  const openSaleModal = (item) => {
    setSaleTarget(item);
  };

  const handleSell = (loteId, quantidadeVendida) => {
    sellFromLote({ loteId, quantidadeVendida });
    setSaleTarget(null);
  };

  useEffect(() => {
    document.body.classList.toggle('theme-dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      setTab('dashboard');
    }
  }, [currentUser]);

  useEffect(() => {
    void bootstrapFromSupabase();
  }, [bootstrapFromSupabase]);

  if (!currentUser) {
    return <LoginScreen onLogin={login} onRequestAccess={requestAccess} />;
  }

  return (
    <div className={`mx-auto min-h-screen w-full max-w-md px-4 pb-24 ${criticals.length ? 'pt-28' : 'pt-4'}`}>
      <div className="space-y-4">
        {tab === 'dashboard' && (
          <DashboardScreen
            items={items}
            warnings={warnings}
            criticals={criticals}
            selectedBar={selectedBar}
            setSelectedBar={setSelectedBar}
            onSell={openSaleModal}
          />
        )}

        {tab === 'entrada' && (
          <EntryScreen
            bebidas={bebidas}
            onSave={(payload) => {
              addLote(payload);
              setTab('dashboard');
            }}
          />
        )}

        {tab === 'estoque' && <InventoryScreen items={items} onSell={openSaleModal} />}

        {tab === 'config' && (
          <SettingsScreen
            currentUser={currentUser}
            users={users}
            bebidas={bebidas}
            pendingUsers={pendingUsers}
            rejectedUsers={rejectedUsers}
            theme={theme}
            onAddBebida={addBebida}
            onUpdateBebida={updateBebida}
            onDeleteBebida={deleteBebida}
            onApproveUser={approvePendingUser}
            onApproveRejectedUser={approveRejectedUser}
            onDeleteRejectedUser={deleteRejectedUser}
            onRejectApprovedUser={rejectApprovedUser}
            onUpdateUserRole={updateUserRole}
            onRejectUser={rejectPendingUser}
            onThemeChange={setTheme}
            onLogout={logout}
          />
        )}
      </div>

      <BottomNav current={tab} onChange={setTab} />

      <SaleModal item={saleTarget} onClose={() => setSaleTarget(null)} onConfirm={handleSell} />

      <CriticalAlertModal items={criticals} onOpenSale={openSaleModal} />
    </div>
  );
}

export default App;
