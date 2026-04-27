import React from 'react';
import { 
  Wallet, DollarSign, ArrowUpRight, 
  Search, Filter, CheckCircle2, 
  XCircle, Clock, MoreVertical,
  Target, Zap, Shield
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const MOCK_SUBS = [
  { id: '1', user: 'Pius Tech', plan: 'VIP Lifetime', amount: '$499.00', status: 'active', date: '2024-04-20', expires: '2099-12-31' },
  { id: '2', user: 'Mark Zulu', plan: 'VIP Monthly', amount: '$29.00', status: 'pending', date: '2024-04-27', expires: '2024-05-27' },
  { id: '3', user: 'Sarah Doe', plan: 'VIP Weekly', amount: '$9.00', status: 'expired', date: '2024-03-15', expires: '2024-03-22' }
];

export default function AdminSubscriptions() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-[#E9ECEF]">
        <div className="space-y-1">
           <h3 className="text-2xl font-black lowercase tracking-tight italic">Financial Engine</h3>
           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">manage transactions and active tiers</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group flex-1 min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="Search by transaction ID or user..."
                className="w-full h-12 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl pl-12 pr-4 text-xs font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
           </div>
        </div>
      </div>

      {/* Subscription Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SUBS.map((sub) => (
          <motion.div 
            key={sub.id}
            className="bg-white p-8 rounded-[40px] border border-[#E9ECEF] flex flex-col justify-between group hover:shadow-2xl transition-all"
          >
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
                      <Shield className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                      <h4 className="font-black text-lg lowercase tracking-tighter leading-none mb-1">{sub.user}</h4>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">{sub.plan}</p>
                   </div>
                </div>
                <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                  <MoreVertical className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <div className="p-6 bg-[#F8F9FA] rounded-[24px] space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase">Revenue</span>
                    <span className="text-sm font-black text-zinc-900 tracking-tight">{sub.amount}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase">Status</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest lowercase px-2.5 py-0.5 rounded-full",
                      sub.status === 'active' ? "bg-win/10 text-win" : sub.status === 'pending' ? "bg-amber-100 text-amber-500" : "bg-red-50 text-red-500"
                    )}>{sub.status}</span>
                 </div>
                 <div className="flex justify-between items-center pt-2 border-t border-zinc-200/50">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase">Expires</span>
                    <span className="text-[11px] font-black text-zinc-600 tracking-tight">{sub.expires}</span>
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
               <button className="flex-1 h-12 bg-zinc-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2">
                  Edit Plan
               </button>
               {sub.status === 'pending' && (
                 <button className="h-12 px-5 bg-win text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-win/20 hover:scale-105 transition-all">
                    Approve
                 </button>
               )}
               <button className="h-12 w-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                  <XCircle className="w-5 h-5" />
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
