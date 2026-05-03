import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Crown, Lock, ArrowRight, Zap, Target, Star, ChevronRight, LayoutGrid, Flame, TrendingUp, Home as HomeIcon, FastForward, TrendingDown, Award } from 'lucide-react';
import { rtdb } from '../lib/firebase';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { Prediction } from '../types';
import { cn } from '../lib/utils';
import PredictionCard from '../components/PredictionCard';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const THEMED_CATEGORIES = [
  { id: 'vip', label: 'elite analytics', icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: '1x', label: 'hot picks', icon: HomeIcon, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'x2', label: 'trending pulse', icon: FastForward, color: 'text-secondary', bg: 'bg-secondary/10' },
  { id: 'bts', label: 'pro insights', icon: Flame, color: 'text-pending', bg: 'bg-pending/10' },
  { id: 'over25', label: 'global forecast', icon: Award, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'under25', label: 'secure analytics', icon: Shield, color: 'text-primary-dark', bg: 'bg-primary-dark/10' },
];

export default function VIP() {
  const [catData, setCatData] = useState<{ [key: string]: Prediction[] }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isVip, freeMode } = useUser();

  useEffect(() => {
    const fetchCategorizedData = () => {
      setLoading(true);
      const predictionsRef = ref(rtdb, 'predictions');
      const q = query(predictionsRef, orderByChild('createdAt'), limitToLast(100));

      const unsubscribe = onValue(q, (snapshot) => {
        const rawData = snapshot.val();
        let tips: Prediction[] = [];
        if (rawData) {
          const now = Date.now();
          const oneDayMs = 24 * 60 * 60 * 1000;
          
          tips = Object.entries(rawData).map(([id, val]: [string, any]) => ({
            id,
            ...val
          } as Prediction))
          .filter(t => (now - (t.createdAt || 0)) < oneDayMs)
          .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        }

        const categorized: { [key: string]: Prediction[] } = {};
        
        for (const cat of THEMED_CATEGORIES) {
          let docs = tips.filter(p => {
            if (cat.id === 'vip') return p.isVip;
            return p.category === cat.id;
          }).slice(0, 3);
          
          categorized[cat.id] = docs;
        }
        setCatData(categorized);
        setLoading(false);
      }, (error) => {
        console.error("RTDB error in VIP:", error);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchCategorizedData();
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Premium Banner */}
      <section className="relative overflow-hidden rounded-[40px] bg-primary-dark h-[180px] flex flex-col justify-center text-center border border-primary/20 shadow-2xl shadow-primary/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2 relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl font-black tracking-tight text-white italic lowercase">lucky tips analytics</h2>
          <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.1em] max-w-[280px] mx-auto leading-relaxed lowercase">
            {freeMode ? 'global free mode active - all analytics unlocked' : 'expert predictions powered by ai & human expertise.'}
          </p>
          <div className="flex justify-center gap-2 pt-4">
             {!isVip && !freeMode ? (
               <button 
                onClick={() => navigate('/subscription')}
                className="bg-yellow-500 text-black px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform lowercase"
               >
                 Go Premium
               </button>
             ) : (
               <div className="bg-win/20 border border-win/30 text-win px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm">
                  <Shield className="w-3 h-3" />
                  VIP Status Active
               </div>
             )}
             <button 
              onClick={() => navigate('/sections')}
              className="bg-white/10 border border-white/10 text-white px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-sm lowercase"
             >
               Free Area
             </button>
          </div>
        </div>
      </section>

      {/* Categorized Lists */}
      <div className="space-y-10">
        {THEMED_CATEGORIES.map((cat, catIdx) => (
          <motion.section 
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className={cn("p-2.5 rounded-2xl transition-transform hover:scale-110", cat.bg)}>
                  <cat.icon className={cn("w-5 h-5", cat.color)} />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight text-[var(--foreground)] lowercase">{cat.label}</h3>
                  <p className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest lowercase">available tips</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-40 bg-[var(--muted)]/20 rounded-[32px] animate-pulse border border-[var(--border)]" />
                ))
              ) : catData[cat.id]?.length > 0 ? (
                catData[cat.id].map((prediction, idx) => (
                  <PredictionCard key={prediction.id} prediction={prediction} index={idx} />
                ))
              ) : (
                <div className="bg-[var(--muted)]/10 border border-[var(--border)] rounded-[32px] p-8 text-center border-dashed">
                   <p className="text-[var(--muted-foreground)] font-bold text-[10px] uppercase tracking-widest">No tips active in this category</p>
                </div>
              )}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
