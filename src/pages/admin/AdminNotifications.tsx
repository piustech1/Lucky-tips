import React, { useState, useEffect } from 'react';
import { 
  Bell, Send, Users, History, 
  MessageSquare, Smartphone, Zap,
  Search, Filter, Clock, Loader2, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { 
  ref, 
  onValue, 
  push, 
  query, 
  orderByChild, 
  limitToLast,
  serverTimestamp 
} from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firebaseUtils';
import { formatDistanceToNow } from 'date-fns';

export default function AdminNotifications() {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [target, setTarget] = useState<'all' | 'vip'>('all');
  const [formData, setFormData] = useState({
    title: '',
    message: ''
  });

  useEffect(() => {
    const notificationsRef = ref(rtdb, 'notifications');
    const q = query(notificationsRef, orderByChild('createdAt'), limitToLast(20));
    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        })).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setBroadcasts(list);
      } else {
        setBroadcasts([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('RTDB Notification Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;
    
    setIsSubmitting(true);
    try {
      const notificationsRef = ref(rtdb, 'notifications');
      await push(notificationsRef, {
        ...formData,
        target,
        type: 'broadcast',
        isRead: false,
        createdAt: serverTimestamp()
      });
      setFormData({ title: '', message: '' });
    } catch (error) {
      console.error('RTDB Send Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

           <form className="space-y-6" onSubmit={handleSend}>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Notification Title</label>
                 <input 
                   placeholder="🔥 New VIP Tips Available!"
                   value={formData.title}
                   onChange={(e) => setFormData({...formData, title: e.target.value})}
                   required
                   className="w-full h-14 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl px-6 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Body Message</label>
                 <textarea 
                   rows={4}
                   placeholder="Check out our expert analysis for today's big games. Stay winning with Lucky Tips!"
                   value={formData.message}
                   onChange={(e) => setFormData({...formData, message: e.target.value})}
                   required
                   className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-6 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase ml-1">Target Audience</label>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button" 
                      onClick={() => setTarget('all')}
                      className={cn(
                        "p-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95",
                        target === 'all' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white border border-[#E9ECEF] text-zinc-400 hover:bg-[#F8F9FA]"
                      )}
                    >
                       <Users className="w-5 h-5" />
                       <span className="text-[9px] font-black uppercase tracking-widest">All Users</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setTarget('vip')}
                      className={cn(
                        "p-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95",
                        target === 'vip' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white border border-[#E9ECEF] text-zinc-400 hover:bg-[#F8F9FA]"
                      )}
                    >
                       <Zap className="w-5 h-5" />
                       <span className="text-[9px] font-black uppercase tracking-widest">VIP Only</span>
                    </button>
                 </div>
              </div>

              <div className="pt-4">
                 <button 
                   disabled={isSubmitting}
                   className="w-full h-16 bg-premium-gradient text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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
           
           {loading ? (
             <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-200" />
             </div>
           ) : broadcasts.length === 0 ? (
             <div className="text-center py-20 text-zinc-300 font-black text-[10px] uppercase tracking-widest lowercase">no history yet</div>
           ) : broadcasts.map(broadcast => (
              <motion.div 
                key={broadcast.id}
                layout
                className="bg-white p-6 rounded-[32px] border border-[#E9ECEF] flex items-center gap-4 group hover:shadow-xl transition-all"
              >
                 <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-zinc-300" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h5 className="font-black text-sm lowercase tracking-tight leading-none mb-1 truncate">{broadcast.title}</h5>
                    <p className="text-[10px] text-zinc-400 font-bold lowercase truncate tracking-tight">
                       Sent to {broadcast.target === 'all' ? 'All Units' : 'VIP Sector'} • {broadcast.createdAt ? formatDistanceToNow(broadcast.createdAt) + ' ago' : 'just now'}
                    </p>
                 </div>
                 <div className="text-right shrink-0">
                    <div className="flex items-center gap-2 text-win">
                       <CheckCircle2 className="w-3 h-3" />
                       <p className="text-[9px] font-black uppercase tracking-widest">transmitted</p>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
