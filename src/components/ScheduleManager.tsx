import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { DaySchedule, SpecialDate } from '../types';

export const DAYS_OF_WEEK = [
  { id: '1', label: 'Segunda-feira', short: 'Seg' },
  { id: '2', label: 'Terça-feira', short: 'Ter' },
  { id: '3', label: 'Quarta-feira', short: 'Qua' },
  { id: '4', label: 'Quinta-feira', short: 'Qui' },
  { id: '5', label: 'Sexta-feira', short: 'Sex' },
  { id: '6', label: 'Sábado', short: 'Sáb' },
  { id: '0', label: 'Domingo', short: 'Dom' }
];

interface ScheduleManagerProps {
  schedule?: { [key: string]: DaySchedule };
  onChange: (s: { [key: string]: DaySchedule }) => void;
  specialDates?: SpecialDate[];
  onSpecialDatesChange: (dates: SpecialDate[]) => void;
}

export const ScheduleManager = ({ 
  schedule = {}, 
  onChange,
  specialDates = [],
  onSpecialDatesChange
}: ScheduleManagerProps) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'special'>('weekly');

  const updateDay = (dayId: string, updates: Partial<DaySchedule>) => {
    const current = schedule[dayId] || { open: '08:00', close: '18:00', active: false };
    onChange({
      ...schedule,
      [dayId]: { ...current, ...updates }
    });
  };

  const addSpecialDate = () => {
    const today = new Date().toISOString().split('T')[0];
    onSpecialDatesChange([
      ...specialDates,
      { date: today, open: '08:00', close: '18:00', active: true, label: 'Evento Especial' }
    ]);
  };

  const removeSpecialDate = (index: number) => {
    onSpecialDatesChange(specialDates.filter((_, i) => i !== index));
  };

  const updateSpecialDate = (index: number, updates: Partial<SpecialDate>) => {
    const next = [...specialDates];
    next[index] = { ...next[index], ...updates };
    onSpecialDatesChange(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('weekly')}
          className={cn(
            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'weekly' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Semanal
        </button>
        <button 
          onClick={() => setActiveTab('special')}
          className={cn(
            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'special' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Datas Especiais
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'weekly' ? (
          <motion.div 
            key="weekly"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {DAYS_OF_WEEK.map(day => {
              const config = schedule[day.id] || { open: '08:00', close: '18:00', active: false };
              return (
                <div key={day.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-[28px] hover:border-brand-200 transition-all group gap-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updateDay(day.id, { active: !config.active })}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-all duration-300",
                        config.active ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                        config.active ? "left-7 shadow-sm" : "left-1"
                      )} />
                    </button>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{day.label}</p>
                      <p className={cn(
                        "text-[9px] font-bold uppercase tracking-tight",
                        config.active ? "text-emerald-500" : "text-slate-400"
                      )}>
                        {config.active ? 'Funcionando' : 'Fechado'}
                      </p>
                    </div>
                  </div>

                  {config.active && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-1 sm:flex-initial">
                        <Clock size={14} className="text-slate-400" />
                        <input 
                          type="time" 
                          value={config.open || ''} 
                          onChange={e => updateDay(day.id, { open: e.target.value })}
                          className="bg-transparent border-none outline-none text-[10px] font-black w-16"
                        />
                      </div>
                      <span className="text-slate-300 font-bold text-xs">às</span>
                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-1 sm:flex-initial">
                        <Clock size={14} className="text-slate-400" />
                        <input 
                          type="time" 
                          value={config.close || ''} 
                          onChange={e => updateDay(day.id, { close: e.target.value })}
                          className="bg-transparent border-none outline-none text-[10px] font-black w-16"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="special"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {specialDates.map((date, idx) => {
              const [sYear, sMonth, sDay] = (date.date || '2026-01-01').split('-');
              return (
                <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[32px] space-y-6 relative group hover:border-brand-100 transition-all shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                       <div className="flex flex-col items-center justify-center w-14 h-14 bg-brand-50 rounded-2xl border border-brand-100">
                         <span className="text-[10px] font-black text-brand-600 uppercase leading-none mb-1">{sMonth ? new Date(0, parseInt(sMonth)-1).toLocaleString('pt-BR', { month: 'short' }) : '---'}</span>
                         <span className="text-xl font-black text-brand-900 leading-none">{sDay || '--'}</span>
                       </div>
                       <div className="flex flex-col justify-center">
                         <h4 className="text-sm font-black text-slate-900">{date.label || 'Data Especial'}</h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sYear}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => removeSpecialDate(idx)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mês / Ano</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={sMonth}
                          onChange={e => {
                            const newMonth = e.target.value;
                            updateSpecialDate(idx, { date: `${sYear}-${newMonth}-${sDay}` });
                          }}
                          className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={String(m).padStart(2, '0')}>
                              {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
                            </option>
                          ))}
                        </select>
                        <select 
                          value={sYear}
                          onChange={e => {
                            const newYear = e.target.value;
                            updateSpecialDate(idx, { date: `${newYear}-${sMonth}-${sDay}` });
                          }}
                          className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={String(y)}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dia</label>
                      <select 
                        value={sDay}
                        onChange={e => {
                          const newDay = e.target.value;
                          updateSpecialDate(idx, { date: `${sYear}-${sMonth}-${newDay}` });
                        }}
                        className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                          <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identificação</label>
                      <input 
                        type="text" 
                        value={date.label || ''}
                        onChange={e => updateSpecialDate(idx, { label: e.target.value })}
                        placeholder="Ex: Feriado municipal..."
                        className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateSpecialDate(idx, { active: !date.active })}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all duration-300",
                          date.active ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                          date.active ? "left-7 shadow-sm" : "left-1"
                        )} />
                      </button>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {date.active ? 'Loja Funcionando' : 'Loja Fechada (Feriado/Folga)'}
                      </span>
                    </div>

                    {date.active && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <Clock size={12} className="text-slate-400" />
                          <input 
                            type="time" 
                            value={date.open || ''} 
                            onChange={e => updateSpecialDate(idx, { open: e.target.value })}
                            className="bg-transparent border-none outline-none text-[10px] font-black w-16"
                          />
                        </div>
                        <span className="text-slate-300 font-bold text-xs">às</span>
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <Clock size={12} className="text-slate-400" />
                          <input 
                            type="time" 
                            value={date.close || ''} 
                            onChange={e => updateSpecialDate(idx, { close: e.target.value })}
                            className="bg-transparent border-none outline-none text-[10px] font-black w-16"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={addSpecialDate}
              className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 hover:border-brand-200 hover:text-brand-500 hover:bg-brand-50/50 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest group"
            >
              <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-brand-100 group-hover:text-brand-500 transition-colors">
                <Plus size={18} />
              </div>
              Adicionar Nova Data Específica
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
