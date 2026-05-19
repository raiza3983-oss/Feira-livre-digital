import { DaySchedule, SpecialDate } from './types';
import { Truck, ShoppingBag, Tent, Utensils, Store } from 'lucide-react';

export const STEPS_ORDER = ['pending', 'accepted', 'pending_payment', 'paid', 'preparing', 'shipped', 'ready', 'completed'];

export const BRAZIL_STATES = [
  { id: 'AC', name: 'Acre' },
  { id: 'AL', name: 'Alagoas' },
  { id: 'AP', name: 'Amapá' },
  { id: 'AM', name: 'Amazonas' },
  { id: 'BA', name: 'Bahia' },
  { id: 'CE', name: 'Ceará' },
  { id: 'DF', name: 'Distrito Federal' },
  { id: 'ES', name: 'Espírito Santo' },
  { id: 'GO', name: 'Goiás' },
  { id: 'MA', name: 'Maranhão' },
  { id: 'MT', name: 'Mato Grosso' },
  { id: 'MS', name: 'Mato Grosso do Sul' },
  { id: 'MG', name: 'Minas Gerais' },
  { id: 'PA', name: 'Pará' },
  { id: 'PB', name: 'Paraíba' },
  { id: 'PR', name: 'Paraná' },
  { id: 'PE', name: 'Pernambuco' },
  { id: 'PI', name: 'Piauí' },
  { id: 'RJ', name: 'Rio de Janeiro' },
  { id: 'RN', name: 'Rio Grande do Norte' },
  { id: 'RS', name: 'Rio Grande do Sul' },
  { id: 'RO', name: 'Rondônia' },
  { id: 'RR', name: 'Roraima' },
  { id: 'SC', name: 'Santa Catarina' },
  { id: 'SP', name: 'São Paulo' },
  { id: 'SE', name: 'Sergipe' },
  { id: 'TO', name: 'Tocantins' }
];

export const PRODUCT_CATEGORIES = [
  { id: 'frutas', name: 'Frutas', icon: '🍎' },
  { id: 'legumes', name: 'Hortifruti', icon: '🥦' },
  { id: 'carnes', name: 'Carnes', icon: '🥩' },
  { id: 'pastel', name: 'Pastelaria', icon: '🥟' },
  { id: 'artesanato', name: 'Artesanato', icon: '🎨' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
  { id: 'outros', name: 'Outros', icon: '📦' },
];

export const getShopTypeInfo = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'feirante': 
    case 'feira': 
    case 'feiralivre':
      return { label: 'Feira Livre', icon: Tent };
    case 'mercado': 
    case 'mercadolivre':
      return { label: 'Mercado Livre', icon: ShoppingBag };
    case 'barraca': 
    case 'barracalivre':
      return { label: 'Barraca Livre', icon: Tent };
    case 'atacado': 
    case 'wholesale':
    case 'atacadolivre':
      return { label: 'Atacado Livre', icon: Truck };
    case 'restaurante':
      return { label: 'Restaurante', icon: Utensils };
    default:
      return { label: 'Loja', icon: Store };
  }
};

export const getFullStateName = (stateId?: string) => {
  if (!stateId) return '';
  const state = BRAZIL_STATES.find(s => s.id === stateId.toUpperCase() || s.name.toUpperCase() === stateId.toUpperCase());
  return state ? state.name : stateId;
};
