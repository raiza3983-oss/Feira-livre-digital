import { Shop } from '../types';

export const isShopOpen = (opening: string, closing: string, shop?: Shop | null) => {
  if (!opening || !closing) return true;
  try {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (shop && shop.isOpen === false) return false;

    if (shop?.specialDates) {
      const todayStr = now.toISOString().split('T')[0];
      const special = shop.specialDates.find(d => d.date === todayStr);
      if (special) {
        if (!special.active) return false;
        const [oH, oM] = special.open.split(':').map(Number);
        const [cH, cM] = special.close.split(':').map(Number);
        const oTime = oH * 60 + oM;
        const cTime = cH * 60 + cM;
        if (cTime < oTime) return currentTime >= oTime || currentTime <= cTime;
        return currentTime >= oTime && currentTime <= cTime;
      }
    }

    if (shop?.schedule) {
      const dayIdx = String(now.getDay());
      const config = shop.schedule[dayIdx];
      if (config) {
        if (!config.active) return false;
        const [oH, oM] = config.open.split(':').map(Number);
        const [cH, cM] = config.close.split(':').map(Number);
        const oTime = oH * 60 + oM;
        const cTime = cH * 60 + cM;
        if (cTime < oTime) return currentTime >= oTime || currentTime <= cTime;
        return currentTime >= oTime && currentTime <= cTime;
      }
    }
    
    const [openH, openM] = opening.split(':').map(Number);
    const [closeH, closeM] = closing.split(':').map(Number);
    
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;
    
    if (closeTime < openTime) {
      return currentTime >= openTime || currentTime <= closeTime;
    }
    return currentTime >= openTime && currentTime <= closeTime;
  } catch (e) {
    return true;
  }
};

export const translateStatus = (status: string) => {
  switch (status) {
    case 'pending': return 'Pendente';
    case 'accepted': return 'Recebido';
    case 'pending_payment': return 'Aguardando Pagamento';
    case 'paid': return 'Pago';
    case 'preparing': return 'Em Preparação';
    case 'ready': return 'Pronto para Retirada';
    case 'shipped': return 'Em Rota de Entrega';
    case 'completed': return 'Concluído';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
};

export const translatePaymentMethod = (method: string) => {
  switch (method?.toLowerCase()) {
    case 'money': return 'Dinheiro';
    case 'pix': return 'Pix';
    case 'card': return 'Cartão';
    case 'credit_card': return 'Cartão de Crédito';
    case 'debit_card': return 'Cartão de Débito';
    default: return method || 'Outro';
  }
};

export const translateRole = (role: string, loginType?: string, shopType?: string) => {
  if (shopType) {
    switch (shopType) {
      case 'feirante': return 'Feira Livre';
      case 'feira': return 'Feira Livre';
      case 'mercado': return 'Mercado Livre';
      case 'barraca': return 'Barraca Livre';
      case 'atacado': return 'Atacado Livre';
      case 'wholesale': return 'Atacado Livre';
      case 'feiralivre': return 'Feira Livre';
      case 'barracalivre': return 'Barraca Livre';
      case 'mercadolivre': return 'Mercado Livre';
      case 'atacadolivre': return 'Atacado Livre';
      case 'restaurante': return 'Restaurante';
    }
  }

  if (loginType === 'vendor_feirante') return 'Feira Livre';
  if (loginType === 'vendor_barraca') return 'Barraca Livre';
  if (loginType === 'vendor_mercado') return 'Mercado Livre';
  if (loginType === 'vendor_atacado') return 'Atacado Livre';
  if (loginType === 'client') return 'Cliente';

  switch (role) {
    case 'admin': return 'Administrador';
    case 'state_admin': return 'Administrador Estadual';
    case 'municipal_admin': return 'Administrador Municipal';
    case 'vendor': return 'Vendedor';
    case 'client': return 'Cliente';
    case 'wholesale': return 'Atacadista';
    default: return role;
  }
};

export const translateUnit = (unit: string) => {
  if (!unit) return '';
  switch (unit) {
    case 'kg': return 'Quilo';
    case 'gram': return 'Grama';
    case 'box': return 'Caixa';
    case 'bag': return 'Saco';
    case 'unit': return 'Unidade';
    default: return unit;
  }
};
