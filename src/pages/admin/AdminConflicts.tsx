import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Clock, User, Mail, 
  Trash2, Ban, Search, RefreshCw,
  AlertTriangle, Filter
} from 'lucide-react';
import { ref, onValue, remove, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface DeviceConflict {
  userId: string;
  email: string;
  displayName: string;
  timestamp: number;
  attemptedSessionId: string;
  currentSessionId: string;
  status: string;
}

const AdminConflicts = () => {
  const [conflicts, setConflicts] = useState<DeviceConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const conflictsRef = ref(rtdb, 'device_conflicts');
    const unsubscribe = onValue(conflictsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]) => ({
          ...(val as any),
          id: key
        })).sort((a, b) => b.timestamp - a.timestamp);
        setConflicts(list);
      } else {
        setConflicts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to dismiss this conflict log?')) {
      await remove(ref(rtdb, `device_conflicts/${userId}`));
    }
  };

  const handleBanUser = async (userId: string) => {
    if (confirm('Are you sure you want to BAN this user? This will restrict their access.')) {
      await update(ref(rtdb, `users/${userId}`), { isBanned: true });
      alert('User has been flagged and banned from the system protocol.');
    }
  };

  const filteredConflicts = conflicts.filter(c => 
    c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black lowercase tracking-tight italic flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            Device Conflicts
          </h2>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest lowercase">monitor multi-device login violations</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-64 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl pl-12 pr-4 text-xs font-black lowercase outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 transition-colors">
            <Filter className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </section>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl rounded-full" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Conflicts</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-black text-zinc-900 dark:text-white leading-none">{conflicts.length}</h4>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">violations recorded</span>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="w-10 h-10 text-primary animate-spin" />
            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">scaning for breaches...</p>
          </div>
        ) : filteredConflicts.length > 0 ? (
          filteredConflicts.map((conflict, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={conflict.userId}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] overflow-hidden group hover:shadow-xl hover:shadow-black/5 transition-all"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                {/* User avatar/ident */}
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                    <User className="w-8 h-8 text-zinc-400" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white lowercase tracking-tight leading-none truncate">
                      {conflict.displayName}
                    </h3>
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold lowercase">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{conflict.email}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-zinc-400 tracking-tighter">
                        <Clock className="w-3 h-3" />
                        {format(conflict.timestamp, 'MMM dd, HH:mm:ss')}
                      </div>
                      <div className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-tighter rounded-md">
                        Conflict Detected
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session details */}
                <div className="flex-1 space-y-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Active session id</p>
                    <code className="text-[10px] font-mono text-primary font-bold break-all opacity-60 italic">{conflict.currentSessionId}</code>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Conflict trigger (new device)</p>
                    <code className="text-[10px] font-mono text-zinc-900 dark:text-white font-black break-all">{conflict.attemptedSessionId}</code>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-3">
                  <button 
                    onClick={() => handleBanUser(conflict.userId)}
                    className="flex-1 md:w-32 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 group/btn overflow-hidden"
                  >
                    <Ban className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ban account</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(conflict.userId)}
                    className="w-12 h-12 md:w-32 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Dismiss</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-32 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[48px] space-y-4">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
              <ShieldAlert className="w-10 h-10 text-green-500 opacity-50" />
            </div>
            <div className="space-y-1">
               <h4 className="text-lg font-black text-zinc-900 dark:text-white lowercase">no active threats</h4>
               <p className="text-zinc-400 text-xs font-medium lowercase">all users are operating within single-device protocols.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConflicts;
