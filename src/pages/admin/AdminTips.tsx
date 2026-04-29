import React, { useState, useEffect } from 'react';
import { 
  Trophy, Plus, Search, Filter, 
  Trash2, Edit2, Clock, Globe, 
  TrendingUp, CheckCircle2, XCircle, 
  ChevronRight, LayoutGrid, Image as ImageIcon,
  DollarSign, Hash, Loader2
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
  serverTimestamp 
} from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firebaseUtils';
import { findTeamLogo } from '../../services/logoService';

const CATEGORIES = [
  { id: 'free', label: 'Free Tips' },
  { id: 'vip', label: 'VIP Tips' },
  { id: '1x', label: 'Home Advantage' },
  { id: 'x2', label: 'Away Force' },
  { id: 'bts', label: 'Both Teams Score' },
  { id: 'over25', label: 'Over 2.5 Market' },
  { id: 'under25', label: 'Under 2.5 Market' }
];

export default function AdminTips() {
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    time: '20:00',
    isVip: false,
    status: 'pending'
  });

  const [logoLoading, setLogoLoading] = useState({ home: false, away: false });

  useEffect(() => {
    const predictionsRef = ref(rtdb, 'predictions');
    const q = query(predictionsRef, orderByChild('createdAt'));
    
    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // RTDB returns an object, so we convert it to an array and sort manually because RTDB sorting is limited
        const tipsList = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        })).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        
        setTips(tipsList);
      } else {
        setTips([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('RTDB List Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogoFetch = async (type: 'home' | 'away', name: string) => {
    if (!name) return;
    setLogoLoading(prev => ({ ...prev, [type]: true }));
    const logo = await findTeamLogo(name);
    setFormData(prev => ({ ...prev, [`${type}Logo`]: logo }));
    setLogoLoading(prev => ({ ...prev, [type]: false }));
  };

  const handleAddTip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const predictionsRef = ref(rtdb, 'predictions');
      await push(predictionsRef, {
        ...formData,
        createdAt: serverTimestamp(),
        isVip: formData.category === 'vip' || formData.isVip
      });
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
        time: '20:00',
        isVip: false,
        status: 'pending'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'predictions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const tipRef = ref(rtdb, `predictions/${id}`);
      await update(tipRef, { status });
    } catch (error) {
      console.error('RTDB Update Error:', error);
    }
  };

  const deleteTip = async (id: string) => {
    if (!window.confirm('Delete this tip permanently?')) return;
    try {
      const tipRef = ref(rtdb, `predictions/${id}`);
      await remove(tipRef);
    } catch (error) {
      console.error('RTDB Delete Error:', error);
    }
  };

  const filteredTips = filter === 'all' ? tips : tips.filter(t => t.category === filter);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-[#E9ECEF]">
        <div className="space-y-1">
           <h3 className="text-2xl font-black lowercase tracking-tight italic">Tips Engine</h3>
           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">the main factory of accurate predictions</p>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={() => setIsAdding(true)}
             className="h-14 px-8 bg-premium-gradient text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
           >
             <Plus className="w-5 h-5" />
             Forge New Tip
           </button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
         <button
           onClick={() => setFilter('all')}
           className={cn(
             "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap lowercase",
             filter === 'all' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white border border-[#E9ECEF] text-zinc-400 hover:bg-zinc-50"
           )}
         >
           all logs
         </button>
         {CATEGORIES.map(cat => (
           <button
             key={cat.id}
             onClick={() => setFilter(cat.id)}
             className={cn(
               "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap lowercase",
               filter === cat.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white border border-[#E9ECEF] text-zinc-400 hover:bg-zinc-50"
             )}
           >
             {cat.label}
           </button>
         ))}
      </div>

      {/* Add Tip Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                       <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black italic lowercase tracking-tight">craft new prediction</h4>
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">enter data for global distribution</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAdding(false)} className="p-3 bg-[#F8F9FA] rounded-[18px] hover:bg-[#E9ECEF] transition-all">
                    <XCircle className="w-5 h-5 text-zinc-400" />
                 </button>
              </div>

              <form className="space-y-8" onSubmit={handleAddTip}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <AdminInput 
                       label="Home Team" 
                       placeholder="Arsenal" 
                       value={formData.homeTeam} 
                       onChange={(e: any) => setFormData({...formData, homeTeam: e.target.value})}
                       onBlur={() => handleLogoFetch('home', formData.homeTeam)}
                     />
                     {logoLoading.home && <p className="text-[8px] font-bold text-primary animate-pulse ml-2">searching logo...</p>}
                   </div>
                   <div className="space-y-2">
                     <AdminInput 
                       label="Away Team" 
                       placeholder="Man City" 
                       value={formData.awayTeam}
                       onChange={(e: any) => setFormData({...formData, awayTeam: e.target.value})}
                       onBlur={() => handleLogoFetch('away', formData.awayTeam)}
                     />
                     {logoLoading.away && <p className="text-[8px] font-bold text-primary animate-pulse ml-2">searching logo...</p>}
                   </div>
                   
                   <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm">
                            {formData.homeLogo ? <img src={formData.homeLogo} className="w-full h-full object-contain" /> : <ImageIcon className="w-4 h-4 text-zinc-300" />}
                         </div>
                         <p className="text-[10px] font-black text-zinc-400 uppercase">Home Logo Extracted</p>
                      </div>
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm">
                            {formData.awayLogo ? <img src={formData.awayLogo} className="w-full h-full object-contain" /> : <ImageIcon className="w-4 h-4 text-zinc-300" />}
                         </div>
                         <p className="text-[10px] font-black text-zinc-400 uppercase">Away Logo Extracted</p>
                      </div>
                   </div>

                   <AdminInput 
                     label="League" 
                     placeholder="Premier League" 
                     value={formData.league}
                     onChange={(e: any) => setFormData({...formData, league: e.target.value})}
                   />
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Market Category</label>
                     <select 
                       value={formData.category}
                       onChange={(e) => setFormData({...formData, category: e.target.value})}
                       className="w-full h-14 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl px-4 text-sm font-black lowercase tracking-tight outline-none focus:ring-2 focus:ring-primary/20"
                     >
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                     </select>
                   </div>
                   <AdminInput 
                     label="Odds" 
                     placeholder="1.95" 
                     icon={TrendingUp} 
                     value={formData.odds}
                     onChange={(e: any) => setFormData({...formData, odds: e.target.value})}
                   />
                   <AdminInput 
                     label="Tip / Selection" 
                     placeholder="Over 2.5 Goals" 
                     icon={CheckCircle2} 
                     value={formData.tip}
                     onChange={(e: any) => setFormData({...formData, tip: e.target.value})}
                   />
                   <AdminInput 
                     label="Match Date" 
                     type="date" 
                     icon={Clock} 
                     value={formData.date}
                     onChange={(e: any) => setFormData({...formData, date: e.target.value})}
                   />
                   <AdminInput 
                     label="Match Time" 
                     type="time" 
                     icon={Clock} 
                     value={formData.time}
                     onChange={(e: any) => setFormData({...formData, time: e.target.value})}
                   />
                </div>

                <div className="flex items-center gap-6 p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg accent-primary" 
                        checked={formData.isVip}
                        onChange={(e) => setFormData({...formData, isVip: e.target.checked})}
                      />
                      <span className="text-xs font-black lowercase tracking-tight">Highlight as VIP Tip</span>
                   </label>
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full h-16 bg-premium-gradient text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3 mt-6 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  finalize and distribute
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tips List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
         {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-300 gap-4">
               <Loader2 className="w-10 h-10 animate-spin" />
               <p className="text-xs font-black uppercase tracking-widest">syncing with matrix...</p>
            </div>
         ) : filteredTips.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-300 gap-4">
               <Trophy className="w-12 h-12 opacity-20" />
               <p className="text-xs font-black uppercase tracking-widest">no tips found in this sector</p>
            </div>
         ) : filteredTips.map((tip) => (
           <motion.div 
             key={tip.id}
             layout
             className="p-8 bg-white border border-[#E9ECEF] rounded-[40px] hover:shadow-2xl transition-all group"
           >
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                       <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl border-4 border-white flex items-center justify-center p-2">
                          <img src={tip.homeLogo || 'https://via.placeholder.com/150'} alt={tip.homeTeam} className="w-full h-full object-contain" />
                       </div>
                       <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl border-4 border-white flex items-center justify-center p-2">
                          <img src={tip.awayLogo || 'https://via.placeholder.com/150'} alt={tip.awayTeam} className="w-full h-full object-contain" />
                       </div>
                    </div>
                    <div>
                       <h4 className="text-lg font-black lowercase tracking-tighter leading-none italic">{tip.homeTeam} vs {tip.awayTeam}</h4>
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">{tip.league}</p>
                    </div>
                 </div>
                 <div className={cn(
                   "px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest lowercase flex items-center gap-2",
                   tip.status === 'won' ? "bg-win/10 text-win" : tip.status === 'lost' ? "bg-red-100 text-red-500" : "bg-zinc-100 text-zinc-400"
                 )}>
                    {tip.status === 'won' ? <CheckCircle2 className="w-3 h-3" /> : tip.status === 'lost' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {tip.status}
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-6 bg-[#F8F9FA] p-6 rounded-[24px] mb-8">
                 <div className="space-y-1 text-center">
                    <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest lowercase">Selection</p>
                    <p className="text-sm font-black text-zinc-900 lowercase tracking-tight">{tip.tip}</p>
                 </div>
                 <div className="space-y-1 text-center border-x border-zinc-200">
                    <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest lowercase">Odds</p>
                    <p className="text-sm font-black text-primary tracking-tight">{tip.odds}</p>
                 </div>
                 <div className="space-y-1 text-center">
                    <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest lowercase">Market</p>
                    <p className="text-sm font-black text-zinc-900 lowercase tracking-tight">
                      {CATEGORIES.find(c => c.id === tip.category)?.label || tip.category}
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="flex-1 flex items-center gap-2">
                    <button 
                      onClick={() => updateStatus(tip.id, 'won')}
                      className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                        tip.status === 'won' ? "bg-win text-white shadow-lg shadow-win/20" : "bg-win/10 text-win hover:bg-win hover:text-white"
                      )}
                    >
                       <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => updateStatus(tip.id, 'lost')}
                      className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                        tip.status === 'lost' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-red-100 text-red-500 hover:bg-red-500 hover:text-white"
                      )}
                    >
                       <XCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => updateStatus(tip.id, 'pending')}
                      className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                        tip.status === 'pending' ? "bg-zinc-900 text-white shadow-lg shadow-black/20" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                      )}
                    >
                       <Clock className="w-5 h-5" />
                    </button>
                 </div>
                 <button 
                   onClick={() => deleteTip(tip.id)}
                   className="h-12 w-12 bg-red-50 text-red-300 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                 >
                    <Trash2 className="w-5 h-5" />
                 </button>
              </div>
           </motion.div>
         ))}
      </div>
    </div>
  );
}

function AdminInput({ label, icon: Icon, onBlur, ...props }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />}
        <input 
          {...props}
          onBlur={onBlur}
          className={cn(
            "w-full h-14 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl px-6 text-sm font-black placeholder:text-zinc-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all",
            Icon && "pl-12"
          )}
        />
      </div>
    </div>
  );
}
