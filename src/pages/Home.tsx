import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Prediction } from '../types';
import { useNavigate } from 'react-router-dom';
import { rtdb } from '../lib/firebase';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import PredictionCard from '../components/PredictionCard';
import { CATEGORIES } from '../constants';
import { AlertTriangle, MessageSquare, Loader2, Trophy, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'previous'>('today');

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
    const predictionsRef = ref(rtdb, 'predictions');
    const q = query(predictionsRef, orderByChild('createdAt'), limitToLast(50));
    
    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tipsData = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        } as Prediction)).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        
        setPredictions(tipsData);
        
        // Auto-switch to previous if no today's tips
        const todayCount = tipsData.filter(p => p.status === 'pending').length;
        if (todayCount === 0) {
          setActiveTab('previous');
        }
      } else {
        setPredictions([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("RTDB error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const todayTips = predictions.filter(p => p.status === 'pending');
  const previousTips = predictions.filter(p => p.status !== 'pending');
  const currentTips = activeTab === 'today' ? todayTips : previousTips;

  return (
    <div className="space-y-8 pb-10">
      {/* Hot Categories Horizontal Scroll */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-[12px] text-zinc-400 uppercase tracking-[0.2em] lowercase">Hot markets</h3>
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
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('today')}
              className={cn(
                "group relative transition-all",
                activeTab === 'today' ? "opacity-100" : "opacity-40"
              )}
            >
              <div className="space-y-0.5 text-left">
                <h3 className="text-lg font-black text-[var(--foreground)] leading-none lowercase tracking-tight">today's picks</h3>
                <p className="text-[var(--muted-foreground)] text-[9px] font-black uppercase tracking-[0.2em] lowercase">live & upcoming</p>
              </div>
              {activeTab === 'today' && (
                <motion.div layoutId="tab-underline" className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full" />
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab('previous')}
              className={cn(
                "group relative transition-all",
                activeTab === 'previous' ? "opacity-100" : "opacity-40"
              )}
            >
              <div className="space-y-0.5 text-left">
                <h3 className="text-lg font-black text-[var(--foreground)] leading-none lowercase tracking-tight">previous tips</h3>
                <p className="text-[var(--muted-foreground)] text-[9px] font-black uppercase tracking-[0.2em] lowercase">historical logs</p>
              </div>
              {activeTab === 'previous' && (
                <motion.div layoutId="tab-underline" className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full" />
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {activeTab === 'today' && (
              <div className="p-2 bg-[var(--muted)]/50 rounded-xl">
                 <div className="w-2 h-2 bg-win rounded-full animate-pulse shadow-[0_0_8px_rgba(0,200,83,0.5)]" />
              </div>
            )}
            {activeTab === 'previous' && (
              <div className="p-2 bg-[var(--muted)]/50 rounded-xl">
                 <Trophy className="w-3 h-3 text-secondary" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-3">
               <Loader2 className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
               <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] lowercase">fetching latest tips...</p>
             </div>
          ) : currentTips.length > 0 ? (
            currentTips.map((prediction: Prediction, index: number) => (
              <PredictionCard key={prediction.id} prediction={prediction} index={index} />
            ))
          ) : activeTab === 'today' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center space-y-4 px-8 border-2 border-dashed border-[var(--border)] rounded-[32px]"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black lowercase tracking-tight">Analysing Markets...</h4>
                <p className="text-[10px] text-[var(--muted-foreground)] font-medium leading-relaxed">
                  Our professional analysts are still scanning global markets for high-probability signals. Please check back shortly for today's elite picks.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <Trophy className="w-12 h-12 text-zinc-200 mx-auto" />
              <p className="text-zinc-400 font-black text-[10px] uppercase tracking-widest lowercase">no historical logs available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Responsible Gambling Modal - Redesigned */}
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-24">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={closeWarning}
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-2xl flex items-center gap-4"
            >
              <div className="shrink-0 w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-[var(--foreground)] leading-tight">Notice: Game Responsibly</h3>
                <p className="text-[10px] text-[var(--muted-foreground)] leading-tight truncate">
                  Betting involves risk. Join our community for expert guidance and safe analysis.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.open('https://chat.whatsapp.com/GgS9vG7y9W53L6I0V5nO5L', '_blank')}
                  className="px-3 h-8 rounded-lg bg-[#25D366] text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all"
                >
                  <MessageSquare className="w-3 h-3" />
                  Join
                </button>
                <button 
                  onClick={closeWarning}
                  className="h-8 w-8 rounded-lg bg-[var(--muted)]/50 text-[var(--muted-foreground)] flex items-center justify-center hover:bg-[var(--muted)] transition-all"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
