import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, User, Clock, ChevronRight, 
  CheckCircle2, AlertCircle, Search, Filter, 
  Loader2, Trash2, Reply, Send, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { ref, onValue, update, remove, push, serverTimestamp } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { format } from 'date-fns';
import { recordLog } from '../../lib/adminUtils';

export default function AdminFeedback() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const feedbackRef = ref(rtdb, 'feedback');
    const unsubscribe = onValue(feedbackRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        })).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
        setTickets(list);
      } else {
        setTickets([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleResolve = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
      await update(ref(rtdb, `feedback/${id}`), {
        status: newStatus
      });
      await recordLog('Pius Tech', 'feedback', 'update_ticket_status', `Ticket ${id} marked as ${newStatus}`);
    } catch (error) {
      console.error('Resolve Error:', error);
    }
  };

  const deleteTicket = async (id: string) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await remove(ref(rtdb, `feedback/${id}`));
      await recordLog('Pius Tech', 'feedback', 'delete_ticket', `Ticket ${id} permanently deleted`);
      if (selectedTicket?.id === id) setSelectedTicket(null);
    } catch (error) {
      console.error('Delete Error:', error);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setIsSending(true);
    try {
      const replyRef = push(ref(rtdb, `feedback/${selectedTicket.id}/replies`));
      await update(replyRef, {
        sender: 'Admin',
        message: replyText,
        timestamp: serverTimestamp()
      });
      await recordLog('Pius Tech', 'feedback', 'reply_ticket', `Replied to ${selectedTicket.userName}`);
      setReplyText('');
    } catch (error) {
      console.error('Reply Error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-[#E9ECEF]">
        <div className="space-y-1">
           <h3 className="text-2xl font-black lowercase tracking-tight italic">Feedback Hub</h3>
           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest lowercase">intercept messages from the field</p>
        </div>
        <div className="relative group flex-1 max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
           <input 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             placeholder="Search reports..."
             className="w-full h-12 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl pl-12 pr-4 text-xs font-black placeholder:text-zinc-300 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
           {loading ? (
             <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-zinc-200" /></div>
           ) : filteredTickets.length === 0 ? (
             <div className="text-center p-10 border-2 border-dashed border-zinc-100 rounded-[32px] text-zinc-300 text-xs font-black uppercase tracking-widest">No reports found</div>
           ) : (
             filteredTickets.map((t) => (
               <motion.div
                 layout
                 key={t.id}
                 onClick={() => setSelectedTicket(t)}
                 className={cn(
                   "p-5 rounded-[32px] border cursor-pointer transition-all hover:scale-[1.02] active:scale-98 group relative",
                   selectedTicket?.id === t.id 
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-2xl shadow-zinc-900/20" 
                    : "bg-white border-[#E9ECEF] text-zinc-900 hover:border-zinc-300",
                   t.status === 'resolved' && "opacity-60"
                 )}
               >
                  <div className="flex items-center gap-3 mb-3">
                     <div className={cn(
                       "w-10 h-10 rounded-xl flex items-center justify-center",
                       selectedTicket?.id === t.id ? "bg-white/10" : "bg-zinc-50"
                     )}>
                        <User className="w-4 h-4" />
                     </div>
                     <div>
                        <h5 className="text-[11px] font-black tracking-tight truncate lowercase">{t.userName || 'Anonymous'}</h5>
                        <p className={cn(
                          "text-[9px] font-black uppercase tracking-widest opacity-40 lowercase",
                          selectedTicket?.id === t.id ? "text-white" : "text-zinc-500"
                        )}>{format(new Date(t.timestamp), 'HH:mm • dd MMM')}</p>
                     </div>
                     {t.status === 'resolved' && <CheckCircle2 className="w-4 h-4 text-win ml-auto" />}
                  </div>
                  <p className="text-[10px] font-bold line-clamp-2 leading-relaxed opacity-80">{t.message}</p>
                  
                  {selectedTicket?.id === t.id && (
                     <motion.div layoutId="active-indicator" className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-full" />
                  )}
               </motion.div>
             ))
           )}
        </div>

        {/* Selected Ticket Detail */}
        <div className="lg:col-span-2">
           <AnimatePresence mode="wait">
              {selectedTicket ? (
                <motion.div
                  key={selectedTicket.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-[#E9ECEF] rounded-[48px] overflow-hidden flex flex-col h-[70vh]"
                >
                   {/* Ticket Header */}
                   <div className="p-8 border-b border-[#F1F3F5] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-zinc-900 text-white rounded-[24px]">
                            <MessageSquare className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="text-xl font-black italic lowercase tracking-tight">{selectedTicket.userName}</h4>
                            <p className="text-[10px] font-black text-zinc-400 lowercase tracking-widest">{selectedTicket.email}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                           onClick={() => handleResolve(selectedTicket.id, selectedTicket.status)}
                           className={cn(
                             "h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                             selectedTicket.status === 'resolved' ? "bg-win text-white" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                           )}
                         >
                            {selectedTicket.status === 'resolved' ? 'RESOLVED' : 'MARK RESOLVED'}
                         </button>
                         <button 
                           onClick={() => deleteTicket(selectedTicket.id)}
                           className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>

                   {/* Message Thread */}
                   <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-zinc-50/50">
                      <div className="flex gap-4">
                         <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                            <User className="w-4 h-4" />
                         </div>
                         <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-zinc-200 shadow-sm max-w-[80%]">
                            <p className="text-xs font-bold text-zinc-600 leading-relaxed">{selectedTicket.message}</p>
                            <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest mt-3 lowercase">{format(new Date(selectedTicket.timestamp), 'HH:mm:ss • dd/MM/yyyy')}</p>
                         </div>
                      </div>

                      {selectedTicket.replies && Object.entries(selectedTicket.replies).map(([rid, r]: [string, any]) => (
                        <div key={rid} className={cn("flex gap-4", r.sender === 'Admin' ? "flex-row-reverse" : "")}>
                           <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", r.sender === 'Admin' ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400")}>
                              {r.sender === 'Admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                           </div>
                           <div className={cn(
                             "p-5 rounded-2xl border shadow-sm max-w-[80%]",
                             r.sender === 'Admin' ? "bg-zinc-900 text-white border-zinc-800 rounded-tr-none" : "bg-white text-zinc-600 border-zinc-200 rounded-tl-none"
                           )}>
                              <p className="text-xs font-bold leading-relaxed">{r.message}</p>
                              <p className={cn("text-[8px] font-black uppercase tracking-widest mt-3 lowercase", r.sender === 'Admin' ? "text-white/30" : "text-zinc-300")}>
                                 {r.timestamp ? format(new Date(r.timestamp), 'HH:mm:ss • dd/MM/yyyy') : 'Pending...'}
                              </p>
                           </div>
                        </div>
                      ))}
                   </div>

                   {/* Reply Input */}
                   <div className="p-8 bg-white border-t border-[#F1F3F5]">
                      <div className="relative">
                         <input 
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                           placeholder="Draft transmission reply..."
                           className="w-full h-14 bg-zinc-50 border border-zinc-200 rounded-2xl pl-6 pr-16 text-xs font-black placeholder:text-zinc-300 outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                         />
                         <button 
                           onClick={sendReply}
                           disabled={isSending || !replyText.trim()}
                           className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                         >
                            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                         </button>
                      </div>
                   </div>
                </motion.div>
              ) : (
                <div className="h-[70vh] border-2 border-dashed border-zinc-100 rounded-[48px] flex flex-col items-center justify-center text-zinc-200 space-y-4">
                   <div className="w-20 h-20 rounded-[32px] border-4 border-zinc-50 flex items-center justify-center">
                      <MessageSquare className="w-10 h-10" />
                   </div>
                   <p className="text-xs font-black uppercase tracking-widest">Select a report to initiate interception</p>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Shield(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
