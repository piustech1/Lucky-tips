import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Trophy, TrendingUp, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Prediction } from '../types';
import { cn } from '../lib/utils';

type PerformanceStatus = 'won' | 'lost' | 'fair' | 'today';

export default function Performance() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'predictions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prediction));
      setPredictions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getDayPerformance = (date: Date): PerformanceStatus | null => {
    if (isToday(date)) return 'today';

    const dateStr = format(date, 'yyyy-MM-dd');
    const dayPredictions = predictions.filter(p => p.date === dateStr);

    if (dayPredictions.length === 0) return null;

    const won = dayPredictions.filter(p => p.status === 'won').length;
    const lost = dayPredictions.filter(p => p.status === 'lost').length;
    const pending = dayPredictions.filter(p => p.status === 'pending').length;

    if (pending > 0 && won === 0 && lost === 0) return null;

    if (won > lost) return 'won';
    if (lost > won) return 'lost';
    return 'fair';
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-zinc-900 tracking-tighter leading-none">
            {format(currentMonth, 'dd')}
          </h2>
          <p className="text-zinc-500 font-bold text-lg">
            {format(currentMonth, 'MMMM, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-zinc-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-y-4">
        {allDays.map((date, i) => {
          const perf = getDayPerformance(date);
          const isCurrentMonth = isSameMonth(date, monthStart);
          const isSelected = isSameDay(date, currentMonth);

          return (
            <div 
              key={i}
              className={cn(
                "flex flex-col items-center justify-center py-2 relative",
                !isCurrentMonth && "opacity-20"
              )}
            >
              <div 
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-black transition-all",
                  isSelected ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "text-zinc-900",
                  perf === 'won' && !isSelected && "bg-green-500/10 text-green-600 border border-green-500/20",
                  perf === 'lost' && !isSelected && "bg-red-500/10 text-red-600 border border-red-500/20",
                  perf === 'fair' && !isSelected && "bg-zinc-100 text-zinc-500 border border-zinc-200",
                  perf === 'today' && !isSelected && "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                )}
                onClick={() => setCurrentMonth(date)}
              >
                {format(date, 'd').padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getStats = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    let w = 0, l = 0, f = 0;
    monthDays.forEach(d => {
      const p = getDayPerformance(d);
      if (p === 'won') w++;
      else if (p === 'lost') l++;
      else if (p === 'fair') f++;
    });

    return { w, l, f };
  };

  const stats = getStats();

  return (
    <div className="pb-10 space-y-6">
      {/* Calendar Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] p-6 shadow-2xl shadow-zinc-100 border border-zinc-100"
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-zinc-900 leading-none lowercase">{format(currentMonth, 'MMMM')}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 lowercase">{format(currentMonth, 'yyyy')}</p>
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors text-zinc-400"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={nextMonth} className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors text-zinc-400"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        {renderDays()}
        <div className="min-h-[280px]">
          {renderCells()}
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-50 flex justify-between items-center px-2">
           {[
             { color: 'bg-green-500', label: 'Won', val: stats.w },
             { color: 'bg-red-500', label: 'Lost', val: stats.l },
             { color: 'bg-zinc-300', label: 'Not Set', val: stats.f }
           ].map((s, i) => (
             <div key={i} className="flex flex-col items-center gap-0.5">
               <div className={cn("w-1.5 h-1.5 rounded-full", s.color)} />
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter lowercase">{s.val} {s.label}</span>
             </div>
           ))}
        </div>
      </motion.div>

      {/* Stats Summary - More compact */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Trophy, val: `${Math.round((stats.w / (stats.w + stats.l + stats.f || 1)) * 100)}%`, label: 'Efficiency', bg: 'bg-zinc-900', text: 'text-white' },
          { icon: TrendingUp, val: `+${stats.w}`, label: 'Wins', bg: 'bg-primary/10', text: 'text-primary' },
        ].map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className={cn("p-6 rounded-[32px] space-y-2", s.bg)}
          >
            <s.icon className={cn("w-6 h-6 opacity-50", s.text)} />
            <div>
              <h3 className={cn("text-2xl font-black tabular-nums", s.text)}>{s.val}</h3>
              <p className={cn("text-[8px] font-black uppercase tracking-widest lowercase", i === 0 ? 'text-white/50' : 'text-primary/60')}>{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
