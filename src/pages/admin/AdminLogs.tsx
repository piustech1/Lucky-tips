import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Trash2, Edit2, LogIn, Key, Search, Clock, Loader2, User, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ref, onValue, limitToLast, query } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

const ICON_MAP: any = {
  edit: Edit2,
  delete: Trash2,
  system: Shield,
  login: Key,
  user: User,
  alert: Bell
};

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const logsRef = query(ref(rtdb, 'logs'), limitToLast(50));
    const unsubscribe = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        })).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
        setLogs(list);
      } else {
        setLogs([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by user or action..."
                className="w-full h-12 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl pl-12 pr-4 text-xs font-black placeholder:text-zinc-300 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-zinc-600"
              />
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-zinc-200" /></div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-[32px] text-zinc-300 text-xs font-black uppercase tracking-widest">No entries found</div>
        ) : (
          filteredLogs.map((log, index) => {
            const Icon = ICON_MAP[log.type] || Activity;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white p-6 rounded-[32px] border border-[#E9ECEF] hover:shadow-xl hover:shadow-black/5 transition-all flex items-center justify-between"
              >
                 <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      log.type === 'delete' ? 'bg-red-500/10 text-red-500' : 
                      log.type === 'edit' ? 'bg-blue-500/10 text-blue-500' :
                      log.type === 'win' ? 'bg-win/10 text-win' : 'bg-primary/10 text-primary'
                    )}>
                       <Icon className="w-6 h-6" />
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 lowercase">{log.user || 'system'}</span>
                          <span className="text-[10px] font-medium text-zinc-200">/</span>
                          <span className="text-[10px] font-black uppercase tracking-widest lowercase text-primary">{log.action}</span>
                       </div>
                       <h5 className="font-black text-lg lowercase tracking-tighter text-[#1A1A1A] leading-none mb-1">{log.target}</h5>
                       <p className="text-[10px] font-black text-zinc-300 lowercase italic">
                          {log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                       </p>
                    </div>
                 </div>
                 
                 <div className="text-right">
                    <div className="px-4 py-2 bg-zinc-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-300">
                       SECURE ENTRY
                    </div>
                 </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
