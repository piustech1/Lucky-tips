import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { Prediction } from '../types';
import { cn } from '../lib/utils';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PredictionCard from '../components/PredictionCard';
import { CATEGORIES } from '../constants';
import { ArrowLeft, Target, Lock } from 'lucide-react';
import { MOCK_PREDICTIONS } from '../lib/mockData';
import { useUser } from '../contexts/UserContext';

export default function Sections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isVip } = useUser();
  const activeCategory = searchParams.get('type');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeCategory) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let q;
    if (activeCategory === 'all') {
      q = query(collection(db, 'predictions'), orderBy('date', 'desc'), limit(100));
    } else if (activeCategory === 'vip') {
      q = query(collection(db, 'predictions'), where('isVip', '==', true), orderBy('date', 'desc'), limit(100));
    } else if (activeCategory === 'free') {
      q = query(collection(db, 'predictions'), where('category', '==', 'free'), orderBy('date', 'desc'), limit(100));
    } else {
      q = query(collection(db, 'predictions'), where('category', '==', activeCategory), orderBy('date', 'desc'), limit(100));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prediction));
      
      if (data.length === 0) {
        if (activeCategory === 'all') {
          data = MOCK_PREDICTIONS;
        } else if (activeCategory === 'vip') {
          data = MOCK_PREDICTIONS.filter(p => p.isVip);
        } else if (activeCategory === 'free') {
          data = MOCK_PREDICTIONS.filter(p => p.category === 'free');
        } else {
          data = MOCK_PREDICTIONS.filter(p => p.category === activeCategory);
        }
      }

      setPredictions(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      let data: Prediction[] = [];
      if (activeCategory === 'all') {
        data = MOCK_PREDICTIONS;
      } else if (activeCategory === 'vip') {
        data = MOCK_PREDICTIONS.filter(p => p.isVip);
      } else if (activeCategory === 'free') {
        data = MOCK_PREDICTIONS.filter(p => p.category === 'free');
      } else {
        data = MOCK_PREDICTIONS.filter(p => p.category === activeCategory);
      }
      setPredictions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCategory]);

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
              <p className="text-[var(--muted-foreground)] text-[10px] font-bold uppercase tracking-[0.2em] lowercase">select market to view tips</p>
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
                    className="relative bg-white dark:bg-[#121212] border border-zinc-100 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-primary/40 transition-all group overflow-hidden h-20"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <cat.icon className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="text-left space-y-0.5">
                        <h3 className="text-zinc-900 dark:text-white font-black text-sm tracking-tight lowercase">{cat.label}</h3>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest lowercase">
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

            <div className="space-y-3 mt-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-[var(--card)] rounded-2xl animate-pulse" />
                ))
              ) : predictions.length > 0 ? (
                predictions.map((prediction, index) => (
                  <PredictionCard key={prediction.id} prediction={prediction} index={index} />
                ))
              ) : (
                <div className="text-center py-20 px-10 space-y-4 bg-[var(--card)] rounded-[40px] border border-[var(--border)]">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Target className="w-10 h-10 text-primary opacity-50" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight uppercase text-white lowercase">no tips available</h3>
                    <p className="text-[var(--muted-foreground)] text-xs font-medium max-w-[200px] mx-auto leading-relaxed lowercase">
                      our experts are currently analyzing more matches for the <b>{selectedCategoryData?.label}</b> market.
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
