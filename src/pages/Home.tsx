import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Prediction } from '../types';
import { useNavigate } from 'react-router-dom';
import { rtdb } from '../lib/firebase';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import PredictionCard from '../components/PredictionCard';
import { CATEGORIES } from '../constants';
import { AlertTriangle, MessageSquare, Loader2, Trophy, XCircle, Clock, Star, Send } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';

const HERO_IMAGES = [
  "https://contentful-asset-proxy.sd.indazn.com/vhp9jnid12wf/77Jm8rRKCQwO3zTjgC7Vs9/b17dcf7af9cbd834fee6c6c12fc0a281/1440_x_509___Web-2.jpg", // La Liga
  "https://e0.365dm.com/25/11/1600x900/skysports-premier-league-premier-league-fixtures_7086811.jpg?20251120150259", // Premier League
  "https://assets.calciomercato.com/images/v3/blta84f8cfacf3a7bbc/seriea.jpg", // Serie A
  "https://www.edcom.fr/upload/media/ligue-1-plus.webp", // Ligue 1
  "https://image.discovery.indazn.com/ca/v2/ca/image?id=dd7e2d16-3c0d-4692-ad93-b19bece046f1&quality=70", // Bundesliga
  "https://assets.goal.com/images/v3/blt9d7ef2ac7142bd5e/SPL_Winners_Losers.jpg", // Saudi Pro League
  "https://assets.goal.com/images/v3/blt84cf5a40786d6483/MLS%20Salary%20Cap.jpg?auto=webp&format=pjpg&width=3840&quality=60", // MLS
];

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'previous'>('today');
  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3000); // 3 seconds per slide
    return () => clearInterval(timer);
  }, []);

  const getExpiryReminder = () => {
    if (profile?.subscriptionTier === 'vip' && profile?.subscriptionExpiry) {
      const daysLeft = differenceInDays(parseISO(profile.subscriptionExpiry), new Date());
      if (daysLeft >= 0 && daysLeft <= 2) {
        return daysLeft === 0 ? "Expires today!" : `${daysLeft} days remaining`;
      }
    }
    return null;
  };

  const expiryMessage = getExpiryReminder();

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

  const todayTips = predictions.filter(p => {
    const isNew = p.status === 'pending';
    const isWithin24h = p.createdAt ? (Date.now() - p.createdAt) < (24 * 60 * 60 * 1000) : true;
    return isNew && isWithin24h;
  });

  const previousTips = predictions.filter(p => {
    const isNotPending = p.status !== 'pending';
    const isOlderThan24h = p.createdAt ? (Date.now() - p.createdAt) >= (24 * 60 * 60 * 1000) : false;
    return isNotPending || isOlderThan24h;
  });
  const currentTips = activeTab === 'today' ? todayTips : previousTips;

  if (loading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="space-y-2">
            <div className="h-8 w-48 skeleton" />
            <div className="h-3 w-32 skeleton" />
          </div>
          <div className="w-12 h-12 skeleton rounded-2xl" />
        </div>
        
        <div className="h-48 mx-1 skeleton rounded-2xl" />
        
        <div className="flex gap-4 px-1 overflow-hidden">
          {[1,2,3,4].map(i => <div key={i} className="h-10 w-24 skeleton shrink-0" />)}
        </div>

        <div className="space-y-4">
           {[1,2,3].map(i => <div key={i} className="h-40 skeleton mx-2 rounded-[40px]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Hot Categories Horizontal Scroll */}
      <section className="space-y-4 px-1">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[12px] text-zinc-400 uppercase tracking-[0.2em] lowercase italic">Hot markets</h3>
          <button 
            onClick={() => navigate('/sections')}
            className="text-[10px] font-black text-primary uppercase tracking-widest lowercase underline underline-offset-4"
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
              className="flex-none w-48 h-12 snap-start flex items-center gap-3 bg-black dark:bg-white border border-zinc-800 dark:border-zinc-200 px-4 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="shrink-0 p-1.5 rounded-lg bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-white">
                <cat.icon className="w-4 h-4 text-primary group-hover:text-white" />
              </div>
              <span className="text-[11px] font-black text-white dark:text-zinc-900 leading-tight lowercase truncate">
                {cat.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Dynamic Hero Carousel */}
      <motion.div 
        layout
        className="relative h-48 rounded-xl overflow-hidden group border border-[#E9ECEF] shadow-2xl shadow-black/5 mx-1"
      >
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentHero}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1 }}
            src={HERO_IMAGES[currentHero]} 
            alt="Football League" 
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 pb-6 space-y-3">
          <div className="space-y-1">
            <h4 className="text-3xl font-black text-white italic leading-none lowercase tracking-tighter">
              {profile?.subscriptionTier === 'vip' ? 'Elite Terminal' : 'unlock global vip'}
            </h4>
            <p className="text-white/70 text-[11px] font-bold max-w-[240px] leading-relaxed lowercase tracking-tight">
              {profile?.subscriptionTier === 'vip' 
                ? 'you are now accessing high-probability algorithmic signals.' 
                : 'get absolute access to 99% accuracy predictions from top analysts.'}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            {profile?.subscriptionTier === 'vip' ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-xl backdrop-blur-md">
                   <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                   <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest lowercase">VIP ACTIVE</span>
                </div>
                {expiryMessage && (
                  <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-xl backdrop-blur-md animate-pulse">
                     <Clock className="w-3 h-3 text-red-500" />
                     <span className="text-[10px] font-black text-red-500 uppercase tracking-widest lowercase">{expiryMessage}</span>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/subscription')}
                className="bg-yellow-500 text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:scale-105 transition-all shadow-xl shadow-yellow-500/20 active:scale-95 lowercase"
              >
                Upgrade now
              </button>
            )}

            <div className="flex gap-1.5">
              {HERO_IMAGES.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                    currentHero === i ? "w-6 bg-white" : "bg-white/30"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Predictions Section */}
      <section className="space-y-6 px-1">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('today')}
              className={cn(
                "group relative transition-all",
                activeTab === 'today' ? "opacity-100" : "opacity-30 hover:opacity-50"
              )}
            >
              <div className="space-y-0.5 text-left">
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-none lowercase italic tracking-tight">today's picks</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-[0.2em] lowercase">live signals</p>
              </div>
              {activeTab === 'today' && (
                <motion.div layoutId="tab-underline" className="absolute -bottom-3 left-0 right-0 h-1.5 bg-primary rounded-full" />
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab('previous')}
              className={cn(
                "group relative transition-all",
                activeTab === 'previous' ? "opacity-100" : "opacity-30 hover:opacity-50"
              )}
            >
              <div className="space-y-0.5 text-left">
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-none lowercase italic tracking-tight">previous tips</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-[0.2em] lowercase">historic archive</p>
              </div>
              {activeTab === 'previous' && (
                <motion.div layoutId="tab-underline" className="absolute -bottom-3 left-0 right-0 h-1.5 bg-secondary rounded-full" />
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {activeTab === 'today' && (
              <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl">
                 <div className="w-2.5 h-2.5 bg-win rounded-full animate-pulse shadow-[0_0_12px_rgba(0,200,83,0.6)]" />
              </div>
            )}
            {activeTab === 'previous' && (
              <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl">
                 <Trophy className="w-4 h-4 text-zinc-400" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 px-1">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-24 gap-4">
               <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
               <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] lowercase">syncing with terminal...</p>
             </div>
          ) : currentTips.length > 0 ? (
            currentTips.map((prediction: Prediction, index: number) => (
              <PredictionCard key={prediction.id} prediction={prediction} index={index} />
            ))
          ) : activeTab === 'today' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-24 text-center space-y-6 px-10 border-2 border-dashed border-zinc-100 rounded-[48px] bg-zinc-50/30"
            >
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-black/5 ring-1 ring-zinc-100">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black lowercase italic tracking-tight text-[var(--foreground)]">Analysing Markets...</h4>
                <p className="text-[11px] text-zinc-400 font-bold leading-relaxed lowercase tracking-tight max-w-[240px] mx-auto">
                  Our professional analysts are scanning global frequencies for high-probability signals. please bypass shortly for today's elite picks.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="py-24 text-center space-y-4">
              <div className="w-20 h-20 bg-zinc-50 border border-zinc-100 rounded-[32px] flex items-center justify-center mx-auto mb-2 opacity-50">
                <Trophy className="w-8 h-8 text-zinc-300" />
              </div>
              <p className="text-zinc-400 font-black text-[10px] uppercase tracking-widest lowercase">historic archive is currently clearing</p>
            </div>
          )}
        </div>
      </section>

      {/* Responsible Gaming Modal - Tooltip Style */}
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[24px] p-8 shadow-2xl relative border border-zinc-100 dark:border-zinc-800"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Responsible Gaming</h3>
                   <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                     Bet responsibly. Gambling can be addictive and may lead to financial loss. Only stake what you can afford to lose. 18+.
                   </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={closeWarning}
                    className="px-4 h-12 text-zinc-500 dark:text-zinc-400 font-bold text-sm hover:text-zinc-700 dark:hover:text-zinc-200 transition-all"
                  >
                    Later
                  </button>
                  <button 
                    onClick={() => {
                      window.open('https://wa.me/256709728322', '_blank');
                      closeWarning();
                    }}
                    className="px-6 h-12 bg-[#4F46E5] text-white rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Join WhatsApp Community
                  </button>
                </div>
              </div>
              
              {/* Tooltip triangle at the bottom center */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-zinc-900 rotate-45 border-r border-b border-zinc-100 dark:border-zinc-800" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
