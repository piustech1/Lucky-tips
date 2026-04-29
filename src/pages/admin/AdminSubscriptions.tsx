import React from 'react';
import { 
  Wallet, DollarSign, ArrowUpRight, 
  Search, Filter, CheckCircle2, 
  XCircle, Clock, MoreVertical,
  Target, Zap, Shield, Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { rtdb } from '../../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { format } from 'date-fns';

export default function AdminSubscriptions() {
  const [subs, setSubs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const usersRef = ref(rtdb, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const users = Object.values(data) as any[];
      // Filter for VIP users
      const vipUsers = users.filter((u: any) => u.subscriptionTier === 'vip' || u.isVip);
      setSubs(vipUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredSubs = subs.filter(s => 
    (s.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl pl-12 pr-4 text-xs font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
           </div>
        </div>
      </div>

      {/* Subscription Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 bg-zinc-100 rounded-[40px] animate-pulse" />
             ))
        ) : filteredSubs.length === 0 ? (
             <div className="col-span-full py-20 text-center text-zinc-300 gap-4 flex flex-col items-center">
                <Shield className="w-12 h-12 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] lowercase">No active VIP agents found</p>
             </div>
        ) : filteredSubs.map((sub: any) => (
          <motion.div 
            key={sub.uid || sub.email}
            layout
            className="bg-white p-8 rounded-[40px] border border-[#E9ECEF] flex flex-col justify-between group hover:shadow-2xl transition-all h-full"
          >
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100 overflow-hidden shadow-sm">
                      <img 
                        src={sub.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.email}`} 
                        alt={sub.displayName}
                        className="w-full h-full object-cover" 
                      />
                   </div>
                   <div className="min-w-0">
                      <h4 className="font-black text-lg lowercase tracking-tighter leading-none mb-1 truncate">{sub.displayName || 'VIP Pilot'}</h4>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase truncate">{sub.email}</p>
                   </div>
                </div>
                <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                  <MoreVertical className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <div className="p-6 bg-[#F8F9FA] rounded-[32px] space-y-4 border border-zinc-100/50">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase">Matrix Level</span>
                    <span className="text-xs font-black text-primary tracking-tight">VIP {sub.subscriptionTier || 'Tier'}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase">Status</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest lowercase px-3 py-1 rounded-full bg-win/10 text-win"
                    )}>Verified</span>
                 </div>
                 <div className="flex justify-between items-center pt-3 border-t border-zinc-200/50">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest lowercase">Since</span>
                    <span className="text-[10px] font-black text-zinc-600 tracking-tight">
                      {sub.createdAt ? format(new Date(sub.createdAt), 'MMM dd, yyyy') : 'Pre-Launch'}
                    </span>
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
               <button className="flex-1 h-14 bg-zinc-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2">
                  Override Profile
               </button>
               <button className="h-14 w-14 bg-red-50 text-red-300 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90">
                  <XCircle className="w-5 h-5" />
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
