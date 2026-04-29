import React, { useState, useEffect } from 'react';
import { 
  Trophy, Plus, Search, Filter, 
  Trash2, Edit2, Clock, Globe, 
  TrendingUp, CheckCircle2, XCircle, 
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
  serverTimestamp 
} from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firebaseUtils';
import { findTeamLogo, findLeagueLogo } from '../../services/logoService';

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
    time: '18:00',
    isVip: false,
    status: 'pending'
  });

  const [logoSearch, setLogoSearch] = useState<{ type: 'home' | 'away' | 'league', query: string, results: any[] }>({ type: 'home', query: '', results: [] });
  const [logoLoading, setLogoLoading] = useState({ home: false, away: false, league: false });
  const [isSearchingLogo, setIsSearchingLogo] = useState(false);
  const [isSubmittingResult, setIsSubmittingResult] = useState<{ id: string, status: string } | null>(null);
  const [finalScore, setFinalScore] = useState('');

  useEffect(() => {
    const predictionsRef = ref(rtdb, 'predictions');
    const q = query(predictionsRef, orderByChild('createdAt'));
    
    const unsubscribe = onValue(q, (snapshot) => {
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
      setLoading(false);
    }, (error) => {
      console.error('RTDB List Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleManualLogoSearch = async (type: 'home' | 'away' | 'league', searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) return;
    setLogoLoading(prev => ({ ...prev, [type]: true }));
    try {
      const API_KEY = '7f1e72e61225defa847ad7d9dbc1d5a9';
      const BASE_URL = 'https://v3.football.api-sports.io';
      const endpoint = type === 'league' ? 'leagues' : 'teams';
      const response = await fetch(`${BASE_URL}/${endpoint}?search=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
        }
      });
      const data = await response.json();
      if (data.response) {
        setLogoSearch({ type, query: searchQuery, results: data.response });
        setIsSearchingLogo(true);
      }
    } catch (error) {
      console.error('Logo Search Error:', error);
    } finally {
      setLogoLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const selectLogo = (item: any) => {
    const logo = logoSearch.type === 'league' ? item.league.logo : item.team.logo;
    const name = logoSearch.type === 'league' ? item.league.name : item.team.name;
    
    setFormData(prev => ({ 
      ...prev, 
      [`${logoSearch.type}${logoSearch.type === 'league' ? '' : 'Team'}`]: name,
      [`${logoSearch.type}Logo`]: logo 
    }));
    setIsSearchingLogo(false);
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
        time: '18:00',
        isVip: false,
        status: 'pending'
      });
    } catch (error) {
       console.error('Add Tip Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string, scoreText?: string) => {
    try {
      const tipRef = ref(rtdb, `predictions/${id}`);
      await update(tipRef, { 
        status,
        score: scoreText || '' 
      });
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
      await remove(tipRef);
    } catch (error) {
      console.error('RTDB Delete Error:', error);
    }
  };

  const filteredTips = filter === 'all' ? tips : tips.filter(t => t.category === filter);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
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
              onClick={() => setIsAdding(true)}
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
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-4xl bg-white rounded-[56px] shadow-2xl border border-[#E9ECEF] flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-10 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-primary/10 rounded-[28px] flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                       <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                       <h4 className="text-3xl font-black italic lowercase tracking-tight">Forge Tip</h4>
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] lowercase">Input matrix parameters</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAdding(false)} className="w-12 h-12 bg-white border border-zinc-200 rounded-[20px] flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all active:scale-90 shadow-sm">
                    <XCircle className="w-6 h-6" />
                 </button>
              </div>

              <form className="p-10 overflow-y-auto space-y-10 custom-scrollbar" onSubmit={(e) => { e.preventDefault(); handleAddTip(e); }}>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                          <TeamInput 
                            label="Home Faction" 
                            value={formData.homeTeam} 
                            placeholder="Home Team"
                            logo={formData.homeLogo}
                            loading={logoLoading.home}
                            onChange={(e: any) => setFormData({...formData, homeTeam: e.target.value})}
                            onSearch={() => handleManualLogoSearch('home', formData.homeTeam)}
                          />
                          <TeamInput 
                            label="Away Faction" 
                            value={formData.awayTeam} 
                            placeholder="Away Team"
                            logo={formData.awayLogo}
                            loading={logoLoading.away}
                            onChange={(e: any) => setFormData({...formData, awayTeam: e.target.value})}
                            onSearch={() => handleManualLogoSearch('away', formData.awayTeam)}
                          />
                       </div>

                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">Competition Area</label>
                         <div className="relative group">
                            <input 
                              placeholder="Premier League"
                              value={formData.league}
                              onChange={(e) => setFormData({...formData, league: e.target.value})}
                              className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[28px] px-14 text-sm font-black lowercase outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-300"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1.5 border border-zinc-100 shadow-sm">
                               {logoLoading.league ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : (
                                 <img src={formData.leagueLogo || 'https://via.placeholder.com/50'} className="w-full h-full object-contain" />
                               )}
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleManualLogoSearch('league', formData.league)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-primary/10 rounded-xl transition-colors"
                            >
                               <Search className="w-4 h-4 text-primary" />
                            </button>
                         </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">Market Vector</label>
                             <select 
                               value={formData.category}
                               onChange={(e) => setFormData({...formData, category: e.target.value})}
                               className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[28px] px-6 text-sm font-black lowercase outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                             >
                               {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">Probability (Odds)</label>
                             <div className="relative">
                               <TrendingUp className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                               <input 
                                 placeholder="1.95"
                                 value={formData.odds}
                                 onChange={(e) => setFormData({...formData, odds: e.target.value})}
                                 className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[28px] px-12 text-sm font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-300"
                               />
                             </div>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">Selected Outcome</label>
                          <div className="relative">
                             <CheckCircle2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                             <input 
                               placeholder="Both Teams To Score"
                               value={formData.tip}
                               onChange={(e) => setFormData({...formData, tip: e.target.value})}
                               className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[28px] px-12 text-sm font-black lowercase outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-300"
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">Temporal Date</label>
                             <input 
                               type="date"
                               value={formData.date}
                               onChange={(e) => setFormData({...formData, date: e.target.value})}
                               className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[28px] px-6 text-sm font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">Temporal Time</label>
                             <input 
                               type="time"
                               value={formData.time}
                               onChange={(e) => setFormData({...formData, time: e.target.value})}
                               className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[28px] px-6 text-sm font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-10 border-t border-zinc-100">
                    <div className="flex items-center gap-6">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={cn(
                            "w-12 h-6 rounded-full relative transition-all duration-300",
                            formData.isVip ? "bg-primary" : "bg-zinc-200"
                          )}>
                             <input 
                               type="checkbox" 
                               className="hidden" 
                               checked={formData.isVip} 
                               onChange={(e) => setFormData({...formData, isVip: e.target.checked})} 
                             />
                             <div className={cn(
                               "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                               formData.isVip ? "left-7" : "left-1"
                             )} />
                          </div>
                          <span className="text-xs font-black lowercase tracking-tight text-zinc-600">VIP Access Priority</span>
                       </label>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto h-20 px-16 bg-premium-gradient text-white rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-[1.03] active:scale-97 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                       {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                       Finalize Injection
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}

        {isSearchingLogo && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm"
               onClick={() => setIsSearchingLogo(false)}
             />
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
             >
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                   <div>
                      <h4 className="text-xl font-black italic lowercase tracking-tight">Select Identity</h4>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">pick the correct logo from matrix</p>
                   </div>
                   <XCircle className="w-6 h-6 text-zinc-300 cursor-pointer hover:text-zinc-900 transition-colors" onClick={() => setIsSearchingLogo(false)} />
                </div>
                <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
                   {logoSearch.results.length === 0 ? (
                      <p className="text-center py-10 text-zinc-400 text-[10px] font-black uppercase tracking-widest">No matching frequencies found</p>
                   ) : (
                      logoSearch.results.map((item, i) => (
                         <div 
                           key={i} 
                           onClick={() => selectLogo(item)}
                           className="p-4 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 cursor-pointer flex items-center gap-4 transition-all"
                         >
                            <div className="w-12 h-12 bg-white rounded-xl border border-zinc-100 p-2 flex items-center justify-center">
                               <img src={logoSearch.type === 'league' ? item.league.logo : item.team.logo} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1">
                               <p className="text-sm font-black italic lowercase">{logoSearch.type === 'league' ? item.league.name : item.team.name}</p>
                               <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{logoSearch.type === 'league' ? 'Market League' : item.team.country || 'Global Club'}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-300" />
                         </div>
                      ))
                   )}
                </div>
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
               className="relative w-full max-w-md bg-white rounded-[48px] shadow-2xl p-10 space-y-8"
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

function TeamInput({ label, value, onChange, placeholder, logo, loading, onSearch }: any) {
  return (
    <div className="space-y-2 group flex-1">
      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-2">{label}</label>
      <div className="relative">
         <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 border border-zinc-100">
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : (
              logo ? <img src={logo} className="w-full h-full object-contain" /> : <ImageIcon className="w-4 h-4 text-zinc-200" />
            )}
         </div>
         <input 
           value={value}
           onChange={onChange}
           placeholder={placeholder}
           className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[28px] pl-16 pr-12 text-sm font-black lowercase outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-300"
         />
         <button 
           type="button"
           onClick={onSearch}
           className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-primary/10 rounded-xl transition-colors"
         >
            <Search className="w-4 h-4 text-primary" />
         </button>
      </div>
    </div>
  );
}
