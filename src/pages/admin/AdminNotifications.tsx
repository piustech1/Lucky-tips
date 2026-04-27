import React from 'react';
import { 
  Bell, Send, Users, History, 
  MessageSquare, Smartphone, Zap,
  Search, Filter, Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export default function AdminNotifications() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-[#E9ECEF]">
        <div className="space-y-1">
           <h3 className="text-2xl font-black lowercase tracking-tight italic">Push Intelligence</h3>
           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">keep your community engaged at scale</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Composer */}
        <div className="bg-white p-8 rounded-[40px] border border-[#E9ECEF] space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                 <Send className="w-5 h-5 text-primary" />
              </div>
              <h4 className="text-xl font-black italic lowercase tracking-tight">New Broadcast</h4>
           </div>

           <form className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Notification Title</label>
                 <input 
                   placeholder="🔥 New VIP Tips Available!"
                   className="w-full h-14 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl px-6 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Body Message</label>
                 <textarea 
                   rows={4}
                   placeholder="Check out our expert analysis for today's big games. Stay winning with Lucky Tips!"
                   className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-6 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Target Audience</label>
                 <div className="grid grid-cols-2 gap-4">
                    <button type="button" className="p-4 bg-primary text-white rounded-2xl flex flex-col items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                       <Users className="w-5 h-5" />
                       <span className="text-[9px] font-black uppercase tracking-widest">All Users</span>
                    </button>
                    <button type="button" className="p-4 bg-white border border-[#E9ECEF] text-zinc-400 rounded-2xl flex flex-col items-center gap-2 hover:bg-[#F8F9FA] transition-all">
                       <Zap className="w-5 h-5" />
                       <span className="text-[9px] font-black uppercase tracking-widest">VIP Only</span>
                    </button>
                 </div>
              </div>

              <div className="pt-4">
                 <button className="w-full h-16 bg-premium-gradient text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3">
                    <Send className="w-5 h-5" />
                    Transmit Broadcast
                 </button>
              </div>
           </form>
        </div>

        {/* Recent History */}
        <div className="space-y-6">
           <h4 className="text-xl font-black italic lowercase tracking-tight ml-4 flex items-center gap-2">
             Broadcast Logs
             <div className="h-[1px] flex-1 bg-zinc-200" />
           </h4>
           {[1, 2, 3].map(i => (
             <div key={i} className="bg-white p-6 rounded-[32px] border border-[#E9ECEF] flex items-center gap-4 group hover:shadow-xl transition-all">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center shrink-0">
                   <Bell className="w-5 h-5 text-zinc-300" />
                </div>
                <div className="flex-1 min-w-0">
                   <h5 className="font-black text-sm lowercase tracking-tight leading-none mb-1 truncate">VIP tips are live for today!</h5>
                   <p className="text-[10px] text-zinc-400 font-bold lowercase truncate tracking-tight">Sent to 8,421 recipients • 2 hours ago</p>
                </div>
                <div className="text-right shrink-0">
                   <p className="text-[9px] font-black text-win uppercase tracking-widest">delivered</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
