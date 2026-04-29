import React, { useState } from 'react';
import { 
  Trophy, Plus, Search, Filter, 
  Trash2, Edit2, Clock, Globe, 
  TrendingUp, CheckCircle2, XCircle, 
  ChevronRight, LayoutGrid, Image as ImageIcon,
  DollarSign, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

const CATEGORIES = [
  { id: 'free', label: 'Free Tips' },
  { id: 'vip', label: 'VIP Tips' },
  { id: '1x', label: 'Home Advantage' },
  { id: 'x2', label: 'Away Force' },
  { id: 'bts', label: 'Both Teams Score' },
  { id: 'over25', label: 'Over 2.5 Market' },
  { id: 'under25', label: 'Under 2.5 Market' }
];

const MOCK_TIPS = [
  {
    id: '1',
    homeTeam: 'Arsenal',
    awayTeam: 'Man City',
    homeLogo: 'https://media.api-sports.io/football/teams/42.png',
    awayLogo: 'https://media.api-sports.io/football/teams/50.png',
    league: 'Premier League',
    category: 'over25',
    odds: '1.95',
    tip: 'Over 2.5 Goals',
    time: '21:00',
    date: '2024-04-28',
    status: 'pending',
    isVip: true
  },
  {
    id: '2',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeLogo: 'https://media.api-sports.io/football/teams/541.png',
    awayLogo: 'https://media.api-sports.io/football/teams/529.png',
    league: 'La Liga',
    category: 'bts',
    odds: '1.80',
    tip: 'Both Teams Score',
    time: '22:00',
    date: '2024-04-28',
    status: 'won',
    isVip: false
  }
];

export default function AdminTips() {
  const [tips, setTips] = useState(MOCK_TIPS);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all');

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

              <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setIsAdding(false); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <AdminInput label="Home Team" placeholder="Arsenal" />
                   <AdminInput label="Away Team" placeholder="Man City" />
                   <AdminInput label="League" placeholder="Premier League" />
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Market Category</label>
                     <select className="w-full h-14 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl px-4 text-sm font-black lowercase tracking-tight outline-none focus:ring-2 focus:ring-primary/20">
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                     </select>
                   </div>
                   <AdminInput label="Odds" placeholder="1.95" icon={TrendingUp} />
                   <AdminInput label="Tip / Selection" placeholder="Over 2.5 Goals" icon={CheckCircle2} />
                   <AdminInput label="Match Date" type="date" icon={Clock} />
                   <AdminInput label="Match Time" type="time" icon={Clock} />
                </div>

                <div className="flex items-center gap-6 p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded-lg accent-primary" />
                      <span className="text-xs font-black lowercase tracking-tight">Highlight as VIP Tip</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded-lg accent-primary" />
                      <span className="text-xs font-black lowercase tracking-tight">Post to Public Channel</span>
                   </label>
                </div>

                <button 
                  className="w-full h-16 bg-premium-gradient text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3 mt-6"
                >
                  <Plus className="w-5 h-5" />
                  finalize and distribute
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tips List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
         {tips.map((tip) => (
           <motion.div 
             key={tip.id}
             className="p-8 bg-white border border-[#E9ECEF] rounded-[40px] hover:shadow-2xl transition-all group"
           >
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                       <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl border-4 border-white flex items-center justify-center p-2">
                          <img src={tip.homeLogo} alt={tip.homeTeam} className="w-full h-full object-contain" />
                       </div>
                       <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl border-4 border-white flex items-center justify-center p-2">
                          <img src={tip.awayLogo} alt={tip.awayTeam} className="w-full h-full object-contain" />
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
                 <button className="flex-1 h-12 bg-[#F1F3F5] rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-[#E9ECEF] transition-all flex items-center justify-center gap-2 text-zinc-600">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Tip
                 </button>
                 <div className="flex items-center gap-2">
                    <button className="h-12 w-12 bg-win/10 text-win rounded-2xl flex items-center justify-center hover:bg-win hover:text-white transition-all">
                       <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button className="h-12 w-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                       <XCircle className="w-5 h-5" />
                    </button>
                    <button className="h-12 w-12 bg-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-all">
                       <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </motion.div>
         ))}
      </div>
    </div>
  );
}

function AdminInput({ label, icon: Icon, ...props }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />}
        <input 
          {...props}
          className={cn(
            "w-full h-14 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl px-6 text-sm font-black placeholder:text-zinc-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all",
            Icon && "pl-12"
          )}
        />
      </div>
    </div>
  );
}
