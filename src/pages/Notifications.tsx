import { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, AlertCircle, Info, Clock } from 'lucide-react';
import { Notification } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Prediction Available',
    message: 'Expert tips for Arsenal vs Man City are now live! Check them out.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    isRead: false,
    type: 'alert'
  },
  {
    id: '2',
    title: 'Ticket Won! 🏆',
    message: 'Your recent prediction for Real Madrid vs Barcelona was successful.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: true,
    type: 'success'
  },
  {
    id: '3',
    title: 'Premium Update',
    message: 'Check out our new performance metrics in the Analytics dashboard.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    type: 'info'
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success': return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Victory' };
      case 'alert': return { icon: AlertCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Alert' };
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

      <div className="space-y-4 px-4">
        {notifications.map((item, index) => {
          const { icon: Icon, color, bg, label } = getTypeStyles(item.type);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group relative p-4 rounded-3xl border transition-all duration-300",
                !item.isRead 
                  ? "bg-[var(--card)] border-[var(--border)] shadow-lg shadow-black/5" 
                  : "bg-[var(--muted)]/50 border-transparent opacity-60"
              )}
            >
              {!item.isRead && (
                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,191,166,0.5)]" />
              )}
              
              <div className="flex gap-4 items-center">
                <div className={cn("shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", bg)}>
                  <Icon className={cn("w-6 h-6", color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={cn("text-[8px] font-black uppercase tracking-widest lowercase", color)}>{label}</span>
                    <span className="text-[9px] font-medium text-[var(--muted-foreground)] tabular-nums lowercase">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </span>
                  </div>

                  <h3 className={cn("font-black text-sm leading-tight lowercase truncate", !item.isRead ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>
                    {item.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)] text-[10px] leading-tight lowercase tracking-tight line-clamp-1">
                    {item.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {notifications.length === 0 && (
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

      <button 
        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
        className="mx-auto block text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity lowercase"
      >
        mark all as read
      </button>
    </div>
  );
}
