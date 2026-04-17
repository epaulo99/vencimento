import { ALERT_LIMITS } from '../constants/appData';
import { daysUntil, severityByDays } from './date';

export const enrichLotes = (lotes, bebidasMap) =>
  lotes
    .map((lote) => {
      const bebida = bebidasMap.get(lote.bebidaId);
      const daysLeft = daysUntil(lote.validade);
      return {
        ...lote,
        bebidaNome: bebida?.nome ?? 'Bebida removida',
        bebidaImagem: bebida?.imagem,
        bebidaCategoria: bebida?.categoria,
        daysLeft,
        severity: severityByDays(daysLeft)
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

export const getCriticalItems = (enriched) =>
  enriched.filter((item) => item.daysLeft <= ALERT_LIMITS.critical);

export const getWarningItems = (enriched) =>
  enriched.filter((item) => item.daysLeft > ALERT_LIMITS.critical && item.daysLeft <= ALERT_LIMITS.warning);
