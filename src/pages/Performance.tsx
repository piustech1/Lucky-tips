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
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Trophy, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { rtdb } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Prediction } from '../types';
import { cn } from '../lib/utils';

type PerformanceStatus = 'won' | 'lost' | 'fair' | 'today';

export default function Performance() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const predictionsRef = ref(rtdb, 'predictions');
    const unsubscribe = onValue(predictionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        } as Prediction));
        setPredictions(list);
      } else {
        setPredictions([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getDayPerformance = (date: Date): PerformanceStatus | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayPredictions = predictions.filter(p => p.date === dateStr);

    if (dayPredictions.length === 0) {
      return isToday(date) ? 'today' : null;
    }

    const won = dayPredictions.filter(p => p.status === 'won').length;
    const lost = dayPredictions.filter(p => p.status === 'lost').length;
    
    if (won === 0 && lost === 0) return isToday(date) ? 'today' : 'fair';

    if (won > lost) return 'won';
    if (lost > won) return 'lost';
    return 'fair';
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
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
                !isCurrentMonth && "opacity-20 pointer-events-none"
              )}
            >
                <div 
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-black transition-all cursor-pointer",
                    isSelected ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "text-zinc-900 dark:text-white",
                    perf === 'won' && !isSelected && "bg-green-500/10 text-green-600 border border-green-500/20",
                    perf === 'lost' && !isSelected && "bg-red-500/10 text-red-600 border border-red-500/20",
                    perf === 'fair' && !isSelected && "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700",
                    perf === 'today' && !isSelected && "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                  )}
                  onClick={() => isCurrentMonth && setCurrentMonth(date)}
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
  const efficiency = Math.round((stats.w / (stats.w + stats.l || 1)) * 100);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">calculating performance...</p>
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-6">
      {/* Calendar Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--card)] rounded-[40px] p-6 shadow-2xl shadow-zinc-100 border border-[var(--border)]"
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-[var(--foreground)] leading-none lowercase tracking-tight">{format(currentMonth, 'MMMM')}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] lowercase">{format(currentMonth, 'yyyy')}</p>
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2.5 rounded-xl bg-[var(--muted)]/50 hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={nextMonth} className="p-2.5 rounded-xl bg-[var(--muted)]/50 hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        {renderDays()}
        <div className="min-h-[280px]">
          {renderCells()}
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-between items-center px-2">
           {[
             { color: 'bg-green-500', label: 'Won', val: stats.w },
             { color: 'bg-red-500', label: 'Lost', val: stats.l },
             { color: 'bg-zinc-300', label: 'Others', val: stats.f }
           ].map((s, i) => (
             <div key={i} className="flex flex-col items-center gap-1">
               <div className={cn("w-2 h-2 rounded-full", s.color)} />
               <span className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-tighter lowercase">{s.val} {s.label}</span>
             </div>
           ))}
        </div>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Trophy, val: `${efficiency}%`, label: 'Accuracy', bg: 'bg-zinc-900', text: 'text-white' },
          { icon: TrendingUp, val: `+${stats.w}`, label: 'Wins Recorded', bg: 'bg-primary/10', text: 'text-primary' },
        ].map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className={cn("p-6 rounded-[32px] space-y-2 border border-[var(--border)]", s.bg)}
          >
            <s.icon className={cn("w-6 h-6 opacity-50", s.text)} />
            <div>
              <h3 className={cn("text-2xl font-black tabular-nums tracking-tighter", s.text)}>{s.val}</h3>
              <p className={cn("text-[8px] font-black uppercase tracking-widest lowercase", i === 0 ? 'text-white/50' : 'text-primary/60')}>{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

