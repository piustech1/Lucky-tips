import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Prediction } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import PredictionCard from '../components/PredictionCard';
import { CATEGORIES } from '../constants';
import { MOCK_PREDICTIONS } from '../lib/mockData';
import { AlertTriangle, MessageSquare, X } from 'lucide-react';

import { format } from 'date-fns';

export default function Home() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    // Check if user has seen the warning in this session
    const hasSeenWarning = sessionStorage.getItem('lucky_tips_warning_seen');
    if (!hasSeenWarning) {
      const timer = setTimeout(() => {
        setShowWarning(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeWarning = () => {
    setShowWarning(false);
    sessionStorage.setItem('lucky_tips_warning_seen', 'true');
  };

  useEffect(() => {
    const q = query(collection(db, 'predictions'), orderBy('date', 'desc'), limit(15));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prediction));
      if (data.length > 0) {
        setPredictions(data);
      } else {
        // Fallback: show mock data but try to find those matching today or just the latest
        const todayTips = MOCK_PREDICTIONS.filter(p => p.date === todayStr);
        setPredictions(todayTips.length > 0 ? todayTips : MOCK_PREDICTIONS.slice(0, 5));
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setPredictions(MOCK_PREDICTIONS.slice(0, 5));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [todayStr]);

  return (
    <div className="space-y-8 pb-10">
      {/* Hot Categories Horizontal Scroll */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-[12px] text-zinc-400 uppercase tracking-[0.2em] lowercase">Hot categories</h3>
          <button 
            onClick={() => navigate('/sections')}
            className="text-[10px] font-black text-primary uppercase tracking-widest lowercase"
          >
            view all
          </button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x px-1">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/sections?type=${cat.id}`)}
              className="flex-none w-48 h-12 snap-start flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] px-4 rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="shrink-0 p-1.5 rounded-lg bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-white">
                <cat.icon className="w-4 h-4 text-primary group-hover:text-white" />
              </div>
              <span className="text-[11px] font-black text-[var(--foreground)] leading-tight lowercase truncate">
                {cat.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Promo Card - Simple & Compact */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative h-40 rounded-[32px] overflow-hidden group border border-[var(--border)] shadow-sm"
      >
        <img 
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800" 
          alt="Stadium" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col justify-center p-8 space-y-2">
          <h4 className="text-2xl font-black text-white italic leading-none lowercase tracking-tight">unlock global vip</h4>
          <p className="text-white/80 text-[10px] font-bold max-w-[200px] leading-tight lowercase tracking-tight">
            get access to 99% accuracy predictions from expert analysts.
          </p>
          <button 
            onClick={() => navigate('/subscription')}
            className="mt-2 bg-premium-gradient text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all w-fit shadow-lg shadow-primary/25"
          >
            Upgrade now
          </button>
        </div>
      </motion.div>

      {/* Predictions Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-[var(--foreground)] leading-none lowercase tracking-tight">today's picks</h3>
            <p className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-[0.2em] lowercase">expert analysis</p>
          </div>
          <div className="p-2 bg-[var(--muted)]/50 rounded-xl">
             <div className="w-2 h-2 bg-win rounded-full animate-pulse shadow-[0_0_8px_rgba(0,200,83,0.5)]" />
          </div>
        </div>

        <div className="space-y-3">
          {predictions.map((prediction: Prediction, index: number) => (
            <PredictionCard key={prediction.id} prediction={prediction} index={index} />
          ))}
        </div>
      </section>

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] lowercase">fetching latest tips...</p>
        </div>
      )}

      {/* Responsible Gambling Modal */}
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeWarning}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-[320px] bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-8 shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-[24px] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>

              <div className="space-y-2 text-center">
                <h3 className="text-xl font-black italic lowercase tracking-tight">Play Responsibly</h3>
                <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest lowercase leading-relaxed">
                  Betting might be harmful to your financial health and mental well-being. Always gamble with money you can afford to lose.
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => window.open('https://chat.whatsapp.com/GgS9vG7y9W53L6I0V5nO5L', '_blank')}
                  className="w-full py-4 rounded-2xl bg-[#25D366] text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Join community
                </button>
                <button 
                  onClick={closeWarning}
                  className="w-full py-4 rounded-2xl bg-[var(--muted)]/50 text-[var(--muted-foreground)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--muted)] transition-all"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
