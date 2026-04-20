import { useEffect, useMemo, useState } from 'react';
import { formatDateBR } from '../utils/date';

const MINIMIZED_KEY = 'criticalAlertMinimized';

const getInitialMinimized = () => {
  try {
    return window.localStorage.getItem(MINIMIZED_KEY) === '1';
  } catch {
    return false;
  }
};

const saveMinimized = (value) => {
  try {
    window.localStorage.setItem(MINIMIZED_KEY, value ? '1' : '0');
  } catch {
    // Ignore storage restrictions.
  }
};

const playBeep = () => {
  try {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch {
    // Browser can block audio without user interaction.
  }
};

function CriticalAlertModal({ items, onOpenSale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [blink, setBlink] = useState(true);
  const [isMinimized, setIsMinimized] = useState(getInitialMinimized);

  const target = useMemo(() => {
    if (!items.length) return null;
    return items[activeIndex % items.length];
  }, [items, activeIndex]);

  useEffect(() => {
    if (!items.length) {
      setActiveIndex(0);
      return undefined;
    }

    const interval = setInterval(() => {
      setBlink((value) => !value);
      setActiveIndex((index) => (index + 1) % items.length);
      if (navigator.vibrate) navigator.vibrate([120, 100, 120]);
      playBeep();
    }, 6000);

    if (navigator.vibrate) navigator.vibrate([180, 90, 180]);
    playBeep();

    return () => clearInterval(interval);
  }, [items]);

  const toggleMinimized = () => {
    const next = !isMinimized;
    setIsMinimized(next);
    saveMinimized(next);
  };

  if (!target) return null;

  if (isMinimized) {
    return (
      <div className="pointer-events-none fixed right-3 top-3 z-50">
        <button
          onClick={toggleMinimized}
          className={`pointer-events-auto flex items-center gap-2 rounded-full border border-rose-300/80 px-3 py-2 text-sm font-black text-white shadow-2xl ${
            blink ? 'bg-rose-700/95' : 'bg-rose-800/95'
          }`}
          aria-label="Expandir alertas criticos"
          title="Expandir alertas criticos"
        >
          <span aria-hidden="true">AL</span>
          <span>{items.length}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed left-1/2 top-3 z-50 w-[min(94vw,420px)] -translate-x-1/2">
      <div
        className={`pointer-events-auto rounded-2xl border border-rose-300/80 px-3 py-3 text-white shadow-2xl ${
          blink ? 'bg-rose-700/95' : 'bg-rose-800/95'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wide">Critico ativo ({items.length})</p>
          <div className="flex items-center gap-2">
            <p className="rounded-full bg-black/25 px-2 py-1 text-[11px] font-semibold">{target.bar}</p>
            <button
              onClick={toggleMinimized}
              className="rounded-full bg-black/25 px-2 py-1 text-[11px] font-bold"
              aria-label="Minimizar alertas criticos"
              title="Minimizar"
            >
              Minimizar
            </button>
          </div>
        </div>

        <p className="mt-1 text-base font-black">{target.bebidaNome}</p>
        <p className="text-xs text-rose-100">
          Vence em {target.daysLeft} dia(s) - {formatDateBR(target.validade)} - Restante: {target.quantidadeRestante}
        </p>

        <div className="mt-2">
          <button
            onClick={() => onOpenSale(target)}
            className="w-full rounded-xl bg-black/25 px-3 py-2 text-xs font-bold"
          >
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
}

export default CriticalAlertModal;
