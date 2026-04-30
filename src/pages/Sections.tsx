import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { rtdb } from '../lib/firebase';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { Prediction } from '../types';
import { cn } from '../lib/utils';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PredictionCard from '../components/PredictionCard';
import { CATEGORIES } from '../constants';
import { ArrowLeft, Target, Lock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function Sections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isVip } = useUser();
  const activeCategory = searchParams.get('type');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'previous'>('new');

  useEffect(() => {
    if (!activeCategory) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const predictionsRef = ref(rtdb, 'predictions');
    const q = query(predictionsRef, orderByChild('createdAt'), limitToLast(200));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      let tips: Prediction[] = [];
      
      if (data) {
        tips = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        } as Prediction)).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

        // Filter by category
        if (activeCategory === 'vip') {
          tips = tips.filter(p => p.isVip);
        } else if (activeCategory === 'free') {
          tips = tips.filter(p => p.category === 'free');
        } else if (activeCategory !== 'all') {
          tips = tips.filter(p => p.category === activeCategory);
        }
      }

      setPredictions(tips);
      setLoading(false);
    }, (error) => {
      console.error("RTDB error:", error);
      setPredictions([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCategory]);

  const newTips = predictions.filter(p => {
    const isNew = p.status === 'pending';
    const isWithin24h = p.createdAt ? (Date.now() - p.createdAt) < (24 * 60 * 60 * 1000) : true;
    return isNew && isWithin24h;
  });

  const previousTips = predictions.filter(p => {
    const isNotPending = p.status !== 'pending';
    const isOlderThan24h = p.createdAt ? (Date.now() - p.createdAt) >= (24 * 60 * 60 * 1000) : false;
    return isNotPending || isOlderThan24h;
  });

  const currentTips = activeTab === 'new' ? newTips : previousTips;

  const handleBack = () => {
    setSearchParams({});
  };

  const handleCategoryClick = (catId: string) => {
    const isPremium = catId !== 'all' && catId !== 'free';
    if (isPremium && !isVip) {
      navigate('/subscription');
      return;
    }
    setSearchParams({ type: catId });
    setActiveTab('new');
  };

  const selectedCategoryData = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen pb-20">
      <AnimatePresence mode="wait">
        {!activeCategory ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <section className="space-y-1 text-center px-4">
              <h2 className="text-xl font-black tracking-tight text-primary italic uppercase tracking-widest leading-none lowercase">tip categories</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] lowercase">select market to view tips</p>
            </section>

            <div className="grid grid-cols-1 gap-3 px-2">
              {CATEGORIES.map((cat, index) => {
                const isPremium = cat.id !== 'all' && cat.id !== 'free';
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-primary/40 transition-all group overflow-hidden h-20"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <cat.icon className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="text-left space-y-0.5">
                        <h3 className="text-zinc-900 dark:text-white font-black text-sm tracking-tight lowercase">{cat.label}</h3>
                        <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest lowercase">
                          {isPremium ? 'premium analytics' : 'open to all'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                       {isPremium && !isVip && <Lock className="w-4 h-4 text-yellow-500" />}
                       <div className="w-8 h-8 rounded-full border border-zinc-100 dark:border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                          <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white rotate-180" />
                       </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Mini Hero Part */}
            <div className="relative h-[200px] w-full rounded-[28px] overflow-hidden group shadow-lg">
              <img 
                src={selectedCategoryData?.heroImage || 'https://picsum.photos/seed/sports/800/200'} 
                alt={selectedCategoryData?.label}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col justify-end pb-8 px-8 border border-white/10 rounded-[28px]">
                <h2 className="text-3xl font-black text-white italic tracking-tighter lowercase leading-none">
                  {selectedCategoryData?.label}
                </h2>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.1em] lowercase max-w-[220px] mt-2">
                  {selectedCategoryData?.description}
                </p>
              </div>
              <button 
                onClick={handleBack}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-colors border border-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-4 px-2">
              <button 
                onClick={() => setActiveTab('new')}
                className={cn(
                  "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === 'new' 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800"
                )}
              >
                new tips
              </button>
              <button 
                onClick={() => setActiveTab('previous')}
                className={cn(
                  "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === 'previous' 
                    ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
                    : "bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800"
                )}
              >
                previous
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-white dark:bg-zinc-900 rounded-2xl animate-pulse" />
                ))
              ) : currentTips.length > 0 ? (
                currentTips.map((prediction, index) => (
                  <PredictionCard key={prediction.id} prediction={prediction} index={index} />
                ))
              ) : (
                <div className="text-center py-20 px-10 space-y-4 bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Target className="w-10 h-10 text-primary opacity-50" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight uppercase text-zinc-900 dark:text-white lowercase">no tips available</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium max-w-[200px] mx-auto leading-relaxed lowercase">
                      {activeTab === 'new' 
                        ? `our experts are currently analyzing more matches for the ${selectedCategoryData?.label} market.` 
                        : "no historic data found for this category yet."}
                    </p>
                  </div>
                  <button 
                    onClick={handleBack}
                    className="mt-4 px-8 py-3 bg-primary/10 text-primary rounded-full font-bold text-xs uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all lowercase"
                  >
                    browse other markets
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
