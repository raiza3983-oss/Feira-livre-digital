import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { 
  Users, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Info, 
  Search, 
  Download, 
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  Tent,
  Truck,
  ShoppingBag,
  Store,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface LojaRecord {
  id: string;
  nome: string;
  categoria: string;
  produtosVendidos: number;
  vendasMes: number;
  vendasTotais: number;
  totalAcumulado: number;
  atingiuMeta: boolean;
  taxaVitaliciaPaga: boolean;
  conta: string;
}

export default function PainelFinanceiroContabil() {
  const [lojas, setLojas] = useState<LojaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterMeta, setFilterMeta] = useState("Todos");

  const dataReferencia = new Date();
  const primeiroDiaMes = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth(), 1);
  const ultimoDiaMes = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() + 1, 0);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        // Load Shops
        const shopsSnapshot = await getDocs(collection(db, "shops"));
        const shopsData = shopsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load Completed Orders for all time to calculate total sales
        const ordersRef = collection(db, "orders");
        const ordersQuery = query(
          ordersRef, 
          where("status", "==", "completed")
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

        const shopsProcessed = shopsData.map((shop: any) => {
          const shopOrders = ordersData.filter(o => o.shopId === shop.id);
          
          // Monthly sales
          const shopOrdersMes = shopOrders.filter(o => {
            if (!o.createdAt) return false;
            const date = o.createdAt.toDate();
            return date >= primeiroDiaMes && date <= ultimoDiaMes;
          });

          const vendasMes = shopOrdersMes.reduce((acc, o) => acc + (o.totalValue || 0), 0);
          const vendasTotais = shopOrders.reduce((acc, o) => acc + (o.totalValue || 0), 0);
          const produtosVendidos = shopOrdersMes.reduce((acc, o) => acc + (o.items?.length || 0), 0);
          const atingiuMeta = vendasMes >= 250;
          
          let estadoConta = "Em uso gratuito";
          if (shop.taxaVitaliciaPaga) {
            estadoConta = "Ativada";
          } else if (atingiuMeta) {
            estadoConta = "Aguardando pagamento";
          }

          return {
            id: shop.id,
            nome: shop.name || "Loja sem nome",
            categoria: shop.category || "Geral",
            produtosVendidos,
            vendasMes,
            vendasTotais,
            totalAcumulado: vendasMes,
            atingiuMeta,
            taxaVitaliciaPaga: !!shop.taxaVitaliciaPaga,
            conta: estadoConta,
          };
        });

        setLojas(shopsProcessed);
      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  const totalLojas = lojas.length;
  const lojasAtingiramMeta = lojas.filter(l => l.atingiuMeta).length;
  const lojasNaoAtingiramMeta = totalLojas - lojasAtingiramMeta;

  const filteredLojas = useMemo(() => {
    return lojas.filter(loja => {
      const matchesSearch = loja.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategoria === "Todas" || loja.categoria === filterCategoria;
      const matchesMeta = filterMeta === "Todos" || 
        (filterMeta === "Atingida" && loja.atingiuMeta) || 
        (filterMeta === "Pendente" && !loja.atingiuMeta);
      
      return matchesSearch && matchesCategory && matchesMeta;
    });
  }, [lojas, searchTerm, filterCategoria, filterMeta]);

  async function marcarComoPago(lojaId: string) {
    try {
      const shopRef = doc(db, "shops", lojaId);
      await updateDoc(shopRef, { taxaVitaliciaPaga: true });
      
      setLojas(prev => prev.map(l => l.id === lojaId ? { 
        ...l, 
        taxaVitaliciaPaga: true, 
        conta: "Ativada" 
      } : l));
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight">Painel Financeiro Contábil</h1>
          <p className="text-slate-500 font-medium text-sm">Acompanhe o desempenho financeiro das lojas e a meta mensal de vendas.</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Período de referência</p>
            <p className="text-sm font-bold text-slate-700">
              {primeiroDiaMes.toLocaleDateString()} até {ultimoDiaMes.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users size={24} />} 
          label="Lojas Cadastradas" 
          value={totalLojas} 
          subtext="Total de lojas na plataforma"
          color="blue"
        />
        <StatCard 
          icon={<Target size={24} />} 
          label="Lojas que atingiram a meta" 
          value={lojasAtingiramMeta} 
          subtext="Já podem ser cobradas"
          color="emerald"
        />
        <StatCard 
          icon={<TrendingDown size={24} />} 
          label="Lojas que não atingiram" 
          value={lojasNaoAtingiramMeta} 
          subtext="Não haverá cobrança"
          color="orange"
        />
        <StatCard 
          icon={<Wallet size={24} />} 
          label="Taxa Única Vitalícia" 
          value="R$ 20,00" 
          subtext="Cobrança única após atingir a meta"
          color="violet"
        />
      </div>

      {/* Instruction Box */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-[32px] p-8 flex gap-6">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <Info size={24} />
        </div>
        <div className="space-y-4">
          <h3 className="font-black text-blue-900 uppercase tracking-widest text-sm">Como funciona</h3>
          <ul className="space-y-2 text-blue-800/80 text-sm font-medium list-disc ml-4">
            <li>A cada mês (01 até o último dia), acompanhamos o total de vendas da loja.</li>
            <li>Se a loja atingir a meta de R$ 250,00 ou mais em vendas dentro do mês, será gerada uma taxa única de R$ 20,00.</li>
            <li>Se não atingir a meta até o fim do mês, não haverá cobrança e a contagem será reiniciada no próximo mês.</li>
            <li>Após o pagamento da taxa, a loja fica ativada vitaliciamente, sem novas cobranças ou comissões.</li>
          </ul>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Período (Mês/Ano)</label>
            <div className="relative">
              <select className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold appearance-none">
                <option>{dataReferencia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Categoria</label>
            <div className="relative">
              <select 
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold appearance-none"
              >
                <option value="Todas">Todas</option>
                <option value="Feira livre">Feira livre</option>
                <option value="Atacado Livre">Atacado Livre</option>
                <option value="Mercado Livre">Mercado Livre</option>
                <option value="Barraca Livre">Barraca Livre</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Situação da Meta</label>
            <div className="relative">
              <select 
                value={filterMeta}
                onChange={(e) => setFilterMeta(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold appearance-none"
              >
                <option value="Todos">Todos</option>
                <option value="Atingida">Meta atingida</option>
                <option value="Pendente">Meta pendente</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">&nbsp;</label>
            <div className="relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar loja..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Export button removed as requested */}
          </div>
        </div>

        {/* Category Icons Pills */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
          <CategoryPill active={filterCategoria === "Feira livre"} onClick={() => setFilterCategoria("Feira livre")} icon={<Tent size={18} />} label="Feira livre" description="Lojas que atuam em feiras livres." color="emerald" />
          <CategoryPill active={filterCategoria === "Atacado Livre"} onClick={() => setFilterCategoria("Atacado Livre")} icon={<Truck size={18} />} label="Atacado Livre" description="Lojas que vendem no atacado." color="blue" />
          <CategoryPill active={filterCategoria === "Mercado Livre"} onClick={() => setFilterCategoria("Mercado Livre")} icon={<ShoppingBag size={18} />} label="Mercado Livre" description="Mercados e mercearias." color="violet" />
          <CategoryPill active={filterCategoria === "Barraca Livre"} onClick={() => setFilterCategoria("Barraca Livre")} icon={<Store size={18} />} label="Barraca Livre" description="Lojas e barracas diversas." color="orange" />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Loja</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Categoria</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Produtos Vendidos</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Vendas do Mês</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap font-bold text-brand-600">Vendas Totais</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Meta Mensal</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-green-600">Total Acumulado</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Progresso</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Conta</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Taxa</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredLojas.map((loja) => (
                  <motion.tr 
                    layout
                    key={loja.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                          {/* Photo Placeholder */}
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                             <Store size={20} />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors uppercase">{loja.nome}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{loja.categoria}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                        loja.categoria === "Feira livre" ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" :
                        loja.categoria === "Atacado Livre" ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100" :
                        loja.categoria === "Barraca Livre" ? "bg-orange-50 text-orange-600 ring-1 ring-orange-100" :
                        "bg-slate-50 text-slate-600 ring-1 ring-slate-100"
                      )}>
                        {loja.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-bold text-slate-600">{loja.produtosVendidos} produtos</span>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-slate-900">
                      R$ {loja.vendasMes.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-center font-black text-brand-600">
                      R$ {loja.vendasTotais.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">R$ 250,00</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase">Meta: R$ 250</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className={cn("text-sm font-black", loja.atingiuMeta ? "text-emerald-600" : "text-orange-500")}>
                          R$ {loja.vendasMes.toFixed(2)}
                        </span>
                        <span className="text-[9px] font-black uppercase text-slate-400">
                          {loja.atingiuMeta ? "Acima da meta" : `Faltam R$ ${(250 - loja.vendasMes).toFixed(2)}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                        <div className="flex justify-between w-full text-[9px] font-black text-slate-400 uppercase">
                          <span>{Math.min(100, Math.floor((loja.vendasMes / 250) * 100))}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (loja.vendasMes / 250) * 100)}%` }}
                            className={cn(
                              "h-full rounded-full shadow-sm",
                              loja.atingiuMeta ? "bg-emerald-500" : "bg-orange-500"
                            )}
                          />
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-400 italic">
                          {loja.atingiuMeta ? "Meta atingida!" : `Faltam R$ ${(250 - loja.vendasMes).toFixed(2)}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-1",
                          loja.taxaVitaliciaPaga ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                        )}>
                          {loja.conta}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase">Conta vitalícia</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-slate-900">
                      {loja.atingiuMeta || loja.taxaVitaliciaPaga ? "R$ 20,00" : "—"}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {loja.taxaVitaliciaPaga ? (
                        <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20">
                          <CheckCircle2 size={16} />
                          <span>Pago</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (loja.atingiuMeta) {
                              marcarComoPago(loja.id);
                            }
                          }}
                          disabled={!loja.atingiuMeta}
                          className={cn(
                            "px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all",
                            loja.atingiuMeta 
                              ? "bg-brand-600 text-white shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95" 
                              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          )}
                        >
                          Gerar cobrança
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase italic tracking-widest bg-slate-50 p-4 rounded-xl border border-slate-100 w-fit">
        <Clock size={12} />
        Período atual: {primeiroDiaMes.toLocaleDateString()} até {ultimoDiaMes.toLocaleDateString()}. No próximo mês, as vendas mensais serão zeradas e uma nova meta será iniciada.
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext, color }: { icon: React.ReactNode, label: string, value: string | number, subtext: string, color: 'blue' | 'emerald' | 'orange' | 'violet' }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100"
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-md transition-all">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-3xl font-black text-slate-900 font-display">{value}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 italic">{subtext}</p>
      </div>
    </div>
  );
}

function CategoryPill({ icon, label, description, active, color, onClick }: { icon: React.ReactNode, label: string, description: string, active: boolean, color: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group min-w-[240px]",
        active 
          ? "bg-white border-brand-200 shadow-xl shadow-brand-500/5 ring-1 ring-brand-100" 
          : "bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm",
        active ? "bg-brand-50 text-brand-600" : "bg-white text-slate-400"
      )}>
        {icon}
      </div>
      <div>
        <h5 className={cn("text-xs font-black uppercase tracking-widest", active ? "text-brand-600" : "text-slate-600")}>{label}</h5>
        <p className="text-[9px] font-bold text-slate-400 leading-tight mt-0.5">{description}</p>
      </div>
    </button>
  );
}
