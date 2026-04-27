import React, { useState } from 'react';
import { 
  History, Calendar, Search, 
  CheckCircle2, XCircle, Clock, 
  Filter, TrendingUp, BarChart, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { format, subDays } from 'date-fns';

const MOCK_HISTORY = [
  { id: '1', date: '2024-04-27', home: 'Man Utd', away: 'Liverpool', tip: 'BTTS Yes', odds: '1.75', status: 'won', category: 'football' },
  { id: '2', date: '2024-04-27', home: 'Barca', away: 'PSG', tip: 'Home Win', odds: '2.10', status: 'lost', category: 'football' },
  { id: '3', date: '2024-04-27', home: 'Celtics', away: 'Heat', tip: 'Over 210.5', odds: '1.90', status: 'won', category: 'basketball' },
  { id: '4', date: '2024-04-26', home: 'Real Madrid', away: 'Bayern', tip: 'Home Win', odds: '1.85', status: 'won', category: 'football' },
];

export default function AdminHistory() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filter, setFilter] = useState('all');

  const filteredTips = MOCK_HISTORY.filter(t => t.date === selectedDate);
  const stats = {
    total: filteredTips.length,
    wins: filteredTips.filter(t => t.status === 'won').length,
    losses: filteredTips.filter(t => t.status === 'lost').length,
    rate: filteredTips.length > 0 ? Math.round((filteredTips.filter(t => t.status === 'won').length / filteredTips.length) * 100) : 0
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search & Filter Bar */}
      <div className="bg-white p-8 rounded-[40px] border border-[#E9ECEF] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
           <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-12 w-48 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl pl-12 pr-4 text-xs font-black outline-none focus:ring-2 focus:ring-primary/20 hover:border-zinc-300 transition-all"
              />
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                className={cn(
                  "h-12 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all lowercase",
                  selectedDate === format(new Date(), 'yyyy-MM-dd') ? "bg-primary text-white" : "bg-[#F8F9FA] text-zinc-400"
                )}
              >
                Today
              </button>
              <button 
                onClick={() => setSelectedDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'))}
                className={cn(
                  "h-12 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all lowercase",
                  selectedDate === format(subDays(new Date(), 1), 'yyyy-MM-dd') ? "bg-primary text-white" : "bg-[#F8F9FA] text-zinc-400"
                )}
              >
                Yesterday
              </button>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <h3 className="text-xl font-black lowercase tracking-tight italic">Performance History</h3>
           <History className="w-6 h-6 text-zinc-200" />
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         <StatsCard label="Total Tips" value={stats.total} icon={BarChart} color="bg-zinc-900" />
         <StatsCard label="Wins" value={stats.wins} icon={CheckCircle2} color="bg-win" />
         <StatsCard label="Losses" value={stats.losses} icon={XCircle} color="bg-red-500" />
         <StatsCard label="Win Rate" value={`${stats.rate}%`} icon={TrendingUp} color="bg-primary" />
      </div>

      {/* History List */}
      <div className="space-y-4">
        <h4 className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 lowercase">
           Record for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
           <div className="h-[1px] flex-1 bg-zinc-100" />
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {filteredTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 rounded-[32px] border border-[#E9ECEF] flex items-center justify-between group hover:shadow-xl hover:shadow-black/5 transition-all"
              >
                <div className="flex items-center gap-5">
                   <div className={cn(
                     "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
                     tip.status === 'won' ? "bg-win/10" : "bg-red-50"
                   )}>
                      {tip.status === 'won' ? (
                        <CheckCircle2 className="w-7 h-7 text-win" />
                      ) : (
                        <XCircle className="w-7 h-7 text-red-500" />
                      )}
                   </div>
                   <div>
                      <h5 className="font-black text-sm lowercase tracking-tight leading-none mb-1">
                        {tip.home} <span className="text-zinc-300 font-medium">vs</span> {tip.away}
                      </h5>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">
                        {tip.tip} • {tip.odds} odds
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[11px] font-black text-primary lowercase tracking-tight">{tip.category}</p>
                   <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest lowercase">verified result</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTips.length === 0 && (
            <div className="col-span-full py-24 text-center space-y-4">
              <div className="w-20 h-20 bg-zinc-50 border border-zinc-100 rounded-[32px] flex items-center justify-center mx-auto">
                 <History className="w-8 h-8 text-zinc-200" />
              </div>
              <div>
                 <p className="font-black text-zinc-900 lowercase">no tips found for this date.</p>
                 <p className="text-zinc-400 text-xs lowercase">historic data might not be available or no tips were posted.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="p-6 bg-white border border-[#E9ECEF] rounded-3xl group hover:shadow-xl transition-all">
       <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-opacity-30", color)}>
             <Icon className="w-5 h-5" />
          </div>
          <div>
             <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1 lowercase">{label}</p>
             <p className="text-xl font-black text-[#1A1A1A] tracking-tighter">{value}</p>
          </div>
       </div>
    </div>
  );
}
