import React from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Trash2, Edit2, LogIn, Key, Search, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

const MOCK_LOGS = [
  { id: '1', user: 'Pius Tech', action: 'updated_prediction', target: 'Arsenal vs Man City', date: '2024-04-27 14:20:01', icon: Edit2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: '2', user: 'Pius Tech', action: 'deleted_prediction', target: 'Real vs Bayern', date: '2024-04-27 12:05:42', icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: '3', user: 'System', action: 'automated_broadcast', target: '8,421 recipients', date: '2024-04-27 10:00:00', icon: Shield, color: 'text-primary', bg: 'bg-primary/10' },
  { id: '4', user: 'Admin Zulu', action: 'login_success', target: 'Admin Panel', date: '2024-04-27 09:12:33', icon: Key, color: 'text-win', bg: 'bg-win/10' },
  { id: '5', user: 'Pius Tech', action: 'approved_payment', target: 'Transaction #48291', date: '2024-04-27 08:30:15', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

export default function AdminLogs() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-[#E9ECEF]">
        <div className="space-y-1">
           <h3 className="text-2xl font-black lowercase tracking-tight italic">Audit Tracking</h3>
           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">a full record of every action in the panel</p>
        </div>
        
        <div className="flex gap-4">
           <div className="relative group min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="Filter by user or action..."
                className="w-full h-12 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl pl-12 pr-4 text-xs font-black placeholder:text-zinc-300 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-600"
              />
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_LOGS.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white p-6 rounded-[32px] border border-[#E9ECEF] hover:shadow-xl hover:shadow-black/5 transition-all flex items-center justify-between"
          >
             <div className="flex items-center gap-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", log.bg)}>
                   <log.icon className={cn("w-6 h-6", log.color)} />
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 lowercase">{log.user}</span>
                      <span className="text-[10px] font-medium text-zinc-200">/</span>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest lowercase", log.color)}>{log.action}</span>
                   </div>
                   <h5 className="font-black text-lg lowercase tracking-tighter text-[#1A1A1A] leading-none mb-1">{log.target}</h5>
                   <p className="text-[10px] font-black text-zinc-300 lowercase italic">{log.date}</p>
                </div>
             </div>
             
             <div className="text-right">
                <button className="h-10 px-6 bg-zinc-50 border border-zinc-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-zinc-900 hover:text-white">
                   View Details
                </button>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-10">
         <button className="h-14 px-10 bg-white border border-[#E9ECEF] rounded-2xl font-black text-[10px] uppercase tracking-widest text-zinc-400 transition-all hover:bg-[#F8F9FA] hover:text-zinc-600">
            Load Older Entries
         </button>
      </div>
    </div>
  );
}
