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
  { id: 'Alimentação Pronta e Lanches', name: 'Alimentação Pronta e Lanches', icon: '🍔' },
  { id: 'Antiguidades, Cultura e Lazer.', name: 'Antiguidades, Cultura e Lazer.', icon: '🏺' },
  { id: 'Aquarismo e Pequenos Animais', name: 'Aquarismo e Pequenos Animais', icon: '🐠' },
  { id: 'Armarinhos, Tecidos e Artesanato.', name: 'Armarinhos, Tecidos e Artesanato.', icon: '🧵' },
  { id: 'Carnes, Peixes e Embutidos.', name: 'Carnes, Peixes e Embutidos.', icon: '🥩' },
  { id: 'Conservas, Licores.', name: 'Conservas, Licores.', icon: '🍯' },
  { id: 'Combustíveis e Acendimento Tradicional', name: 'Combustíveis e Acendimento Tradicional', icon: '🔥' },
  { id: 'Cordoaria e Amarração Profissional', name: 'Cordoaria e Amarração Profissional', icon: '🪢' },
  { id: 'Cosméticos, Perfumaria e Bem-Estar.', name: 'Cosméticos, Perfumaria e Bem-Estar.', icon: '🧴' },
  { id: 'Economia Circular e Sucata', name: 'Economia Circular e Sucata', icon: '♻️' },
  { id: 'Eletrônicos, Mídias, Objetos Eletrônicos.', name: 'Eletrônicos, Mídias, Objetos Eletrônicos.', icon: '📱' },
  { id: 'Embalagens e Descartáveis', name: 'Embalagens e Descartáveis', icon: '📦' },
  { id: 'Entretenimento de Rua e Arte Urbana', name: 'Entretenimento de Rua e Arte Urbana', icon: '🎸' },
  { id: 'Frutas Frescas', name: 'Frutas Frescas', icon: '🍎' },
  { id: 'Laticínios e Ovos', name: 'Laticínios e Ovos', icon: '🧀' },
  { id: 'Legumes, Verduras, Ervas e Raízes.', name: 'Legumes, Verduras, Ervas e Raízes.', icon: '🥬' },
  { id: 'Mercearia, Grãos e Temperos.', name: 'Mercearia, Grãos e Temperos.', icon: '🫘' },
  { id: 'Misticismo, Religiosidade e Artigos de Fé.', name: 'Misticismo, Religiosidade e Artigos de Fé.', icon: '🕯️' },
  { id: 'Mobilidade Urbana', name: 'Mobilidade Urbana', icon: '🚲' },
  { id: 'Plantas e Jardinagem', name: 'Plantas e Jardinagem', icon: '🪴' },
  { id: 'Produtos Artesanais', name: 'Produtos Artesanais', icon: '🎨' },
  { id: 'Produtos Químicos de Limpeza', name: 'Produtos Químicos de Limpeza', icon: '🧼' },
  { id: 'Produtos Sazonais e Festivos', name: 'Produtos Sazonais e Festivos', icon: '🎉' },
  { id: 'Produtos para Pets e Agropecuária', name: 'Produtos para Pets e Agropecuária', icon: '🐶' },
  { id: 'Saúde Popular e Ortopedia Básica', name: 'Saúde Popular e Ortopedia Básica', icon: '💊' },
  { id: 'Selaria e Artigos de Couro', name: 'Selaria e Artigos de Couro', icon: '👢' },
  { id: 'Serviços Rápidos e Logística de Apoio', name: 'Serviços Rápidos e Logística de Apoio', icon: '🛠️' },
  { id: 'Utensílios de Cozinha', name: 'Utensílios de Cozinha', icon: '🍳' },
  { id: 'Utilidades para Construção e Pequenos Reparos', name: 'Utilidades para Construção e Pequenos Reparos', icon: '🔨' },
  { id: 'Vestuário, Acessórios e Conveniência.', name: 'Vestuário, Acessórios e Conveniência.', icon: '👕' }
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
