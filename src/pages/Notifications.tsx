import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, AlertCircle, Info, Clock, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ref, onValue, query, orderByChild, limitToLast, update } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear badge count
    const badgeRef = ref(rtdb, 'notifications_badge');
    update(ref(rtdb), { notifications_badge: 0 });

    const notificationsRef = ref(rtdb, 'notifications');
    const q = query(notificationsRef, orderByChild('createdAt'), limitToLast(30));
    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        })).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        setNotifications(list);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('RTDB Notification Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string, currentRead: boolean) => {
    if (currentRead) return;
    try {
      const notifRef = ref(rtdb, `notifications/${id}`);
      await update(notifRef, { isRead: true });
    } catch (error) {
      console.error(error);
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Victory' };
      case 'alert': return { icon: AlertCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Alert' };
      case 'broadcast': return { icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'News' };
      default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Info' };
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between px-4">
        <div className="space-y-0.5">
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 leading-none lowercase">Alerts Center</h2>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] lowercase">Stay ahead of the game</p>
        </div>
        <div className="p-3 bg-zinc-100 rounded-2xl">
          <Bell className="w-5 h-5 text-zinc-400" />
        </div>
      </div>

      <div className="space-y-3 px-4">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">syncing alerts...</p>
           </div>
        ) : (
          notifications.map((item, index) => {
            const { icon: Icon, color, bg } = getTypeStyles(item.type || 'alert');
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => markAsRead(item.id, item.isRead)}
                className={cn(
                  "group relative p-3 rounded-2xl border transition-all duration-300",
                  !item.isRead 
                    ? "bg-white border-zinc-200 shadow-sm hover:shadow-md cursor-pointer" 
                    : "bg-zinc-50/50 border-zinc-100 opacity-60"
                )}
              >
                <div className="flex gap-4 items-center">
                  <div className={cn("shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
                    <Icon className={cn("w-5 h-5", color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={cn("font-black text-[13px] leading-tight lowercase truncate", !item.isRead ? "text-zinc-900" : "text-zinc-500")}>
                        {item.title}
                      </h3>
                      <span className="text-[8px] font-bold text-zinc-400 tabular-nums lowercase shrink-0">
                        {item.createdAt ? formatDistanceToNow(item.createdAt, { addSuffix: true }) : 'just now'}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-[11px] leading-tight lowercase tracking-tight line-clamp-1 mt-0.5 opacity-80">
                      {item.message}
                    </p>
                  </div>

                  {!item.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-24 px-6 space-y-6">
            <div className="w-24 h-24 bg-zinc-50 border border-zinc-100 rounded-[40px] flex items-center justify-center mx-auto shadow-inner">
              <Bell className="w-10 h-10 text-zinc-200" />
            </div>
            <div className="space-y-1">
               <h4 className="font-black text-zinc-900 lowercase">no alerts yet</h4>
               <p className="text-zinc-400 text-xs lowercase">we'll notify you when expert tips are live!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
