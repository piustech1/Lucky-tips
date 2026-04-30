import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Filter, ArrowLeft, Trophy, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Prediction } from '../types';
import { cn } from '../lib/utils';
import { rtdb } from '../lib/firebase';
import { ref, onValue, query, orderByChild } from 'firebase/database';

export default function PreviousPredictions() {
  const [filterDate, setFilterDate] = useState<string>(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const predictionsRef = ref(rtdb, 'predictions');
    const q = query(predictionsRef, orderByChild('createdAt'));
    
    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        } as Prediction));
        
        // Filter by date on client side
        const filtered = list.filter(p => {
          if (!p.createdAt) return false;
          return format(p.createdAt, 'yyyy-MM-dd') === filterDate;
        }).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        
        setPredictions(filtered);
      } else {
        setPredictions([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('RTDB History Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filterDate]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between px-4">
        <Link to="/" className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-600" />
        </Link>
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)] leading-none lowercase">History</h2>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] lowercase">Previous days performance</p>
        </div>
        <div className="w-11" />
      </div>

      {/* Date Filter */}
      <section className="flex gap-4 overflow-x-auto pb-6 no-scrollbar px-4 snap-x">
        {Array.from({ length: 14 }).map((_, i) => {
          const date = subDays(new Date(), i + 1);
          const dateStr = format(date, 'yyyy-MM-dd');
          const isSelected = dateStr === filterDate;
          return (
            <button
              key={dateStr}
              onClick={() => setFilterDate(dateStr)}
              className={cn(
                "shrink-0 w-16 h-20 rounded-[28px] border-2 flex flex-col items-center justify-center gap-1 transition-all snap-start",
                isSelected 
                  ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105" 
                  : "bg-white border-zinc-50 text-zinc-400 hover:border-zinc-200"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-widest lowercase">{format(date, 'EEE')}</span>
              <span className="text-lg font-black tabular-nums">{format(date, 'd')}</span>
            </button>
          );
        })}
      </section>

      {/* History List */}
      <div className="space-y-4 px-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">accessing archives...</p>
          </div>
        ) : predictions.length > 0 ? (
          predictions.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-center mb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <Trophy className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500 lowercase">{match.league}</span>
                </div>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest lowercase",
                  match.status === 'won' ? "bg-green-500/10 text-green-500" : (match.status === 'lost' ? "bg-red-500/10 text-red-500" : "bg-zinc-100 text-zinc-400")
                )}>
                  {match.status === 'won' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {match.status === 'lost' && <XCircle className="w-3.5 h-3.5" />}
                  {match.status || 'pending'}
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex-1 text-center">
                  <span className="font-black text-[15px] text-[var(--foreground)] leading-tight lowercase block">{match.homeTeam}</span>
                </div>
                <div className="px-6 text-zinc-200 font-bold text-[10px] uppercase tracking-widest">VS</div>
                <div className="flex-1 text-center">
                  <span className="font-black text-[15px] text-[var(--foreground)] leading-tight lowercase block">{match.awayTeam}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-5 border-t border-zinc-50">
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase font-black text-zinc-400 tracking-[0.2em] lowercase">prediction</p>
                  <div className="font-black text-[var(--foreground)] lowercase text-sm">{match.tip}</div>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-[9px] uppercase font-black text-zinc-400 tracking-[0.2em] lowercase">odds</p>
                  <div className="font-black text-primary tabular-nums text-sm">{match.odds}</div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-24 px-6 space-y-6">
            <div className="w-24 h-24 bg-zinc-50 border border-zinc-100 rounded-[44px] flex items-center justify-center mx-auto shadow-inner">
              <Calendar className="w-10 h-10 text-zinc-200" />
            </div>
            <div className="space-y-1">
               <h4 className="font-black text-zinc-900 lowercase">no data found</h4>
               <p className="text-zinc-400 text-xs lowercase">we don't have records for this specific date yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
