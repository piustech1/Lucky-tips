import React, { useState, useEffect } from 'react';
import { 
  Trophy, Plus, Search, Filter, 
  Trash2, Edit2, Clock, Globe, 
  TrendingUp, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, LayoutGrid, Image as ImageIcon,
  DollarSign, Hash, Loader2, Sparkles, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { 
  ref, 
  onValue, 
  push, 
  remove, 
  update, 
  query, 
  orderByChild,
  serverTimestamp,
  get 
} from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firebaseUtils';
import { normalizeKey, ensureLogosStructure } from '../../services/dbService';
import { recordLog } from '../../lib/adminUtils';

const CATEGORIES = [
  { id: 'free', label: 'Free Tips', icon: Sparkles },
  { id: 'vip', label: 'VIP Tips', icon: Zap },
  { id: '1x', label: '1X Market', icon: TargetIcon },
  { id: 'x2', label: 'X2 Market', icon: TargetIcon },
  { id: 'bts', label: 'Both Score', icon: TargetIcon },
  { id: 'over25', label: 'Over 2.5', icon: TargetIcon },
  { id: 'under25', label: 'Under 2.5', icon: TargetIcon }
];

function TargetIcon(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function AdminTips() {
  console.log('[AdminTips] Rendering component...');
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    homeLogo: '',
    awayLogo: '',
    league: '',
    leagueLogo: '',
    category: 'free',
    odds: '',
    tip: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '18:00',
    isVip: false,
    status: 'pending'
  });

  const [isSubmittingResult, setIsSubmittingResult] = useState<{ id: string, status: string } | null>(null);
  const [finalScore, setFinalScore] = useState('');
  const [cachedTeams, setCachedTeams] = useState<any[]>([]);
  const [cachedLeagues, setCachedLeagues] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        console.log('[AdminTips] Starting system boot...');
        // We don't block the UI with isInitializing anymore if we have previous data
        // but we'll keep it for the first load to ensure structure
        setError(null);

        // Auto-recovery: Recreate logos if missing
        await ensureLogosStructure();

        const logosRef = ref(rtdb, 'logos');
        const snapshot = await get(logosRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('[AdminTips] Matrix data received:', data);
          
          const teams = data.teams ? Object.values(data.teams) : [];
          const leagues = data.leagues ? Object.values(data.leagues) : [];
          
          setCachedTeams(teams);
          setCachedLeagues(leagues);
        }
      } catch (err: any) {
        console.error('[AdminTips] Boot sequence failed:', err);
        // We set a non-blocking error message
        setError(`Database Warning: ${err.message || 'Partial connection'}. You can still add tips manually.`);
      } finally {
        setIsInitializing(false);
        setLoading(false);
      }
    };

    initializeAdmin();

    const predictionsRef = ref(rtdb, 'predictions');
    const q = query(predictionsRef, orderByChild('createdAt'));
    
    const unsubscribe = onValue(q, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const tipsList = Object.entries(data).map(([id, val]: [string, any]) => ({
            id,
            ...val
          })).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
          setTips(tipsList);
        } else {
          setTips([]);
        }
      } catch (err) {
        console.error('[AdminTips] Prediction sync error:', err);
      }
    }, (err) => {
      console.error('[AdminTips] Subscription error:', err);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.homeTeam || !formData.awayTeam || !formData.league) return;
    
    setIsSubmitting(true);
    try {
      console.log('[AdminTips] Submitting new tip frequency...');
      const dataToSave = {
        ...formData,
        homeLogo: formData.homeLogo || 'https://via.placeholder.com/150?text=Home',
        awayLogo: formData.awayLogo || 'https://via.placeholder.com/150?text=Away',
        leagueLogo: formData.leagueLogo || 'https://via.placeholder.com/50?text=League',
        createdAt: serverTimestamp(),
        isVip: formData.category === 'vip' || formData.isVip
      };

      const predictionsRef = ref(rtdb, 'predictions');
      await push(predictionsRef, dataToSave);
      
      await recordLog('Pius Tech', 'system', 'added_tip', `${formData.homeTeam} vs ${formData.awayTeam}`);

      // Automatic global alert
      const now = format(new Date(), 'dd/MM/yyyy');
      const alertsRef = ref(rtdb, 'notifications');
      await push(alertsRef, {
        title: 'New Tips Live!',
        message: `Expert predictions for ${now} have been uploaded. Check them out!`,
        type: 'alert',
        isRead: false,
        createdAt: serverTimestamp()
      });

      // Increment badge counter
      const badgeRef = ref(rtdb, 'notifications_badge');
      const currentBadge = (await get(badgeRef)).val() || 0;
      await update(ref(rtdb), { notifications_badge: currentBadge + 1 });
      
      console.log('[AdminTips] Save successful');
      setIsAdding(false);
      setFormData({
        homeTeam: '',
        awayTeam: '',
        homeLogo: '',
        awayLogo: '',
        league: '',
        leagueLogo: '',
        category: 'free',
        odds: '',
        tip: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '18:00',
        isVip: false,
        status: 'pending'
      });
    } catch (err: any) {
       console.error('[AdminTips] Submission failed:', err);
       setError(`Failed to add tip: ${err.message}`);
       handleFirestoreError(err, OperationType.WRITE, 'predictions');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="text-center">
          <p className="text-sm font-black lowercase tracking-tight">Accessing terminal matrix...</p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Fetching stored logo data</p>
        </div>
      </div>
    );
  }

  const updateStatus = async (id: string, status: string, scoreText?: string) => {
    try {
      const tipRef = ref(rtdb, `predictions/${id}`);
      const snapshot = await get(tipRef);
      const tipData = snapshot.val();
      
      await update(tipRef, { 
        status,
        score: scoreText || '' 
      });

      await recordLog('Pius Tech', status === 'won' ? 'win' : 'edit', `updated_result`, `${tipData?.homeTeam} vs ${tipData?.awayTeam} (${status})`);
      setIsSubmittingResult(null);
      setFinalScore('');
    } catch (error) {
      console.error('RTDB Update Error:', error);
    }
  };

  const deleteTip = async (id: string) => {
    if (!window.confirm('Erase this prediction from history?')) return;
    try {
      const tipRef = ref(rtdb, `predictions/${id}`);
      const snapshot = await get(tipRef);
      const tipData = snapshot.val();
      
      await remove(tipRef);
      await recordLog('Pius Tech', 'delete', 'deleted_tip', `${tipData?.homeTeam} vs ${tipData?.awayTeam}`);
    } catch (error) {
      console.error('RTDB Delete Error:', error);
    }
  };

  const filteredTips = filter === 'all' ? tips : tips.filter(t => t.category === filter);

  return (
    <div className="space-y-10 pb-20">
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 bg-red-50 border border-red-100 rounded-[32px] flex items-center gap-4 text-red-600 italic"
          >
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-black lowercase tracking-tight">System Alert: {error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Dynamic Header */}
      <div className="relative p-10 bg-zinc-900 rounded-[56px] overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full animate-pulse" />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                     <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Production Hub</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter lowercase leading-none">Prediction Forge</h1>
               <p className="text-zinc-500 text-xs font-medium max-w-md lowercase leading-relaxed">
                  Generate high-probability outcomes for the global market. Your insights drive the collective victory.
               </p>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log('[AdminTips] Opening Craft Match Tip modal...');
                setIsAdding(true);
              }}
              className="h-16 px-10 bg-primary text-[#103D39] rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 flex items-center gap-3 group/btn"
            >
              <Plus className="w-5 h-5 transition-transform group-hover/btn:rotate-90" />
              Craft Match Tip
            </motion.button>
         </div>
      </div>

      {/* Modern Filter Rail */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
         <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All Markets</FilterButton>
         {CATEGORIES.map(cat => (
           <FilterButton key={cat.id} active={filter === cat.id} onClick={() => setFilter(cat.id)}>
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
           </FilterButton>
         ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
         {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-zinc-100 rounded-[48px] animate-pulse" />
            ))
         ) : filteredTips.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-zinc-300 gap-6">
               <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
                  <LayoutGrid className="w-10 h-10 opacity-20" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] lowercase">The forge is currently empty</p>
            </div>
         ) : filteredTips.map((tip, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={tip.id}
              className="p-8 bg-white border border-[#E9ECEF] rounded-[48px] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center p-1 border border-zinc-100">
                        <img src={tip.leagueLogo || 'https://via.placeholder.com/50'} className="w-full h-full object-contain" />
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 lowercase">{tip.league}</span>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest lowercase",
                    tip.status === 'won' ? "bg-win/10 text-win" : tip.status === 'lost' ? "bg-red-50 text-red-500" : "bg-zinc-50 text-zinc-400"
                  )}>
                    {tip.status}
                  </div>
               </div>

               <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="flex-1 space-y-3 text-center">
                     <div className="w-14 h-14 bg-zinc-50 rounded-2xl mx-auto flex items-center justify-center p-2 border border-zinc-100 shadow-sm transition-transform group-hover:scale-110">
                        <img src={tip.homeLogo || 'https://via.placeholder.com/150'} className="w-full h-full object-contain" />
                     </div>
                     <p className="text-[10px] font-black text-zinc-900 leading-tight lowercase truncate">{tip.homeTeam}</p>
                  </div>
                  <div className="px-3 py-1 bg-zinc-100 rounded-full">
                     <span className="text-[9px] font-black text-zinc-400 uppercase">VS</span>
                  </div>
                  <div className="flex-1 space-y-3 text-center">
                     <div className="w-14 h-14 bg-zinc-50 rounded-2xl mx-auto flex items-center justify-center p-2 border border-zinc-100 shadow-sm transition-transform group-hover:scale-110">
                        <img src={tip.awayLogo || 'https://via.placeholder.com/150'} className="w-full h-full object-contain" />
                     </div>
                     <p className="text-[10px] font-black text-zinc-900 leading-tight lowercase truncate">{tip.awayTeam}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="p-4 bg-zinc-50 rounded-[24px] border border-zinc-100/50">
                     <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1 lowercase">Selection</p>
                     <p className="text-xs font-black text-zinc-900 lowercase truncate leading-tight">{tip.tip}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-[24px] border border-zinc-100/50">
                     <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1 lowercase">Market Probability</p>
                     <p className="text-xs font-black text-primary leading-tight">{tip.odds}</p>
                  </div>
               </div>

               <div className="flex items-center gap-3 pt-4 border-t border-zinc-100/50">
                  <div className="flex-1 flex gap-2">
                     <StatusIcon active={tip.status === 'won'} color="win" icon={CheckCircle2} onClick={() => setIsSubmittingResult({ id: tip.id, status: 'won' })} />
                     <StatusIcon active={tip.status === 'lost'} color="lost" icon={XCircle} onClick={() => setIsSubmittingResult({ id: tip.id, status: 'lost' })} />
                     <StatusIcon active={tip.status === 'pending'} color="zinc" icon={Clock} onClick={() => updateStatus(tip.id, 'pending')} />
                  </div>
                  <button 
                    onClick={() => deleteTip(tip.id)}
                    className="w-11 h-11 bg-red-50 text-red-300 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </motion.div>
         ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#F0F9F8]/90 backdrop-blur-md"
              onClick={() => setIsAdding(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-zinc-100 rounded-xl shadow-2xl border border-zinc-200 flex flex-col max-h-[85vh] overflow-hidden text-zinc-900"
            >
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center shadow-lg">
                       <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                       <h4 className="text-base font-black italic lowercase tracking-tight">Forge Tip Matrix</h4>
                       <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest lowercase leading-none">Inject parameters into live production</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAdding(false)} className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all active:scale-90">
                    <XCircle className="w-4 h-4" />
                 </button>
              </div>

              <form className="p-4 overflow-y-auto space-y-4 custom-scrollbar" onSubmit={(e) => { e.preventDefault(); handleAddTip(e); }}>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                                <SearchableDropdown 
                                  label="Home Team" 
                                  items={cachedTeams} 
                                  value={formData.homeTeam} 
                                  logo={formData.homeLogo}
                                  onSelect={(item) => setFormData({...formData, homeTeam: item.name, homeLogo: item.logo})} 
                                />
                                <SearchableDropdown 
                                  label="Away Team" 
                                  items={cachedTeams} 
                                  value={formData.awayTeam} 
                                  logo={formData.awayLogo}
                                  onSelect={(item) => setFormData({...formData, awayTeam: item.name, awayLogo: item.logo})} 
                                />
                             </div>
      
                             <SearchableDropdown 
                               label="Competition" 
                               items={cachedLeagues} 
                               value={formData.league} 
                               logo={formData.leagueLogo}
                               onSelect={(item) => setFormData({...formData, league: item.name, leagueLogo: item.logo})} 
                             />
                    </div>

                    <div className="space-y-3">
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Market Segment</label>
                             <select 
                               value={formData.category}
                               onChange={(e) => setFormData({...formData, category: e.target.value})}
                               className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg px-2 text-[10px] font-black lowercase outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                             >
                               {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                             </select>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Market Odds</label>
                             <div className="relative">
                               <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                               <input 
                                 placeholder="1.95"
                                 value={formData.odds}
                                 onChange={(e) => setFormData({...formData, odds: e.target.value})}
                                 className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg px-8 text-xs font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-300"
                               />
                             </div>
                          </div>
                       </div>

                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Selected Outcome</label>
                          <div className="relative">
                             <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                             <input 
                               placeholder="e.g. Both Teams To Score"
                               value={formData.tip}
                               onChange={(e) => setFormData({...formData, tip: e.target.value})}
                               className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg px-8 text-xs font-black lowercase outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-300"
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Kick-off Date</label>
                             <input 
                               type="date"
                               value={formData.date}
                               onChange={(e) => setFormData({...formData, date: e.target.value})}
                               className="w-full h-9 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 text-[10px] font-black text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans"
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Match Time</label>
                             <input 
                               type="time"
                               value={formData.time}
                               onChange={(e) => setFormData({...formData, time: e.target.value})}
                               className="w-full h-9 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 text-[10px] font-black text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans"
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-4">
                       <label className="flex items-center gap-2 cursor-pointer group">
                          <div className={cn(
                             "w-8 h-4 rounded-full relative transition-all duration-300",
                             formData.isVip ? "bg-primary" : "bg-zinc-200"
                          )}>
                             <input 
                               type="checkbox" 
                               className="hidden" 
                               checked={formData.isVip} 
                               onChange={(e) => setFormData({...formData, isVip: e.target.checked})} 
                             />
                             <div className={cn(
                               "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                               formData.isVip ? "left-4.5" : "left-0.5"
                             )} />
                          </div>
                          <span className="text-[10px] font-black lowercase tracking-tight text-zinc-500">VIP Access Priority</span>
                       </label>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto h-11 px-8 bg-zinc-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-97 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                       Finalize Injection
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}

        {isSubmittingResult && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-primary/20 backdrop-blur-md"
               onClick={() => setIsSubmittingResult(null)}
             />
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative w-full max-w-md bg-white rounded-[48px] shadow-2xl p-10 space-y-8 text-zinc-900"
             >
                <div className="text-center space-y-2">
                   <div className="w-20 h-20 bg-primary/10 rounded-[32px] mx-auto flex items-center justify-center border border-primary/20">
                      <Trophy className="w-10 h-10 text-primary" />
                   </div>
                   <h4 className="text-3xl font-black italic lowercase tracking-tight">Sync Result</h4>
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">record the final full-time score</p>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">Score Pattern (FT)</label>
                      <input 
                        placeholder="e.g. 2 - 1"
                        value={finalScore}
                        onChange={(e) => setFinalScore(e.target.value)}
                        className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[28px] px-8 text-lg font-black text-center outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-200"
                        autoFocus
                      />
                   </div>
                   
                   <button 
                     onClick={() => updateStatus(isSubmittingResult.id, isSubmittingResult.status, finalScore)}
                     className="w-full h-16 bg-[#103D39] text-primary rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                   >
                      Confirm Injection
                   </button>
                   <button 
                     onClick={() => setIsSubmittingResult(null)}
                     className="w-full text-center text-[10px] font-black text-zinc-300 uppercase tracking-widest hover:text-zinc-500 transition-colors"
                   >
                      Abort Sync
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchableDropdown({ label, items, value, logo, onSelect }: { label: string, items: any[], value: string, logo: string, onSelect: (item: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredItems = (items || []).filter(i => 
    i && i.name && i.name.toLowerCase().includes((search || '').toLowerCase())
  ).slice(0, 50);

  return (
    <div className="space-y-2 group flex-1 relative">
      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-lg pl-12 pr-4 cursor-pointer flex items-center shadow-none hover:border-primary/40 transition-all"
      >
        <div className="absolute left-2 w-8 h-8 bg-white rounded-md flex items-center justify-center p-1 border border-zinc-100">
          <img src={logo || 'https://via.placeholder.com/150'} className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150'} />
        </div>
        <span className={cn("text-xs font-black lowercase", !value && "text-zinc-300")}>{value || `Select ${label}...`}</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-zinc-100 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[300px] text-zinc-900"
            >
              <div className="p-4 border-b border-zinc-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                  <input 
                    autoFocus
                    placeholder="Search matrix..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-10 bg-zinc-50 rounded-xl pl-10 pr-4 text-xs font-bold outline-none border border-zinc-100"
                  />
                </div>
              </div>
              <div className="overflow-y-auto custom-scrollbar">
                {filteredItems.length === 0 ? (
                  <div className="p-10 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest">No matching frequency</div>
                ) : (
                  filteredItems.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => { onSelect(item); setIsOpen(false); setSearch(''); }}
                      className="p-4 hover:bg-zinc-50 flex items-center gap-4 cursor-pointer border-b border-zinc-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-100 p-1 flex items-center justify-center">
                        <img src={item.logo} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-xs font-black italic lowercase">{item.name}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ children, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2.5 outline-none whitespace-nowrap lowercase",
        active 
          ? "bg-[#103D39] text-primary shadow-xl shadow-primary/10 border-b-2 border-primary" 
          : "bg-white border border-[#E9ECEF] text-zinc-400 hover:bg-zinc-50"
      )}
    >
      {children}
    </button>
  );
}

function StatusIcon({ active, color, icon: Icon, onClick }: any) {
  const colors: any = {
    win: active ? "bg-win text-white" : "bg-win/10 text-win",
    lost: active ? "bg-red-500 text-white" : "bg-red-50 text-red-500",
    zinc: active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
  };
  
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90",
        colors[color]
      )}
    >
       <Icon className="w-4 h-4" />
    </button>
  );
}
