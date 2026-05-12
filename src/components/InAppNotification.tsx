import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Zap, Trophy, TrendingUp } from 'lucide-react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { format } from 'date-fns';

export default function InAppNotification() {
  const [notification, setNotification] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'tips' | 'live' | 'odds';
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for new predictions to trigger notifications
    const predictionsRef = ref(rtdb, 'predictions');
    const q = query(predictionsRef, orderByChild('createdAt'), limitToLast(5));
    
    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const tips = Object.values(data) as any[];
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const todayTips = tips.filter(t => t.date === today);
      const liveTips = tips.filter(t => t.isLive);
      
      // logic to decide which notification to show
      if (liveTips.length > 0) {
        showNotification({
          id: 'live-alert',
          title: 'Live Action!',
          message: `${liveTips.length} matches are currently live with pulse updates!`,
          type: 'live'
        });
      } else if (todayTips.length > 0) {
        const totalOdds = todayTips.reduce((acc, t) => acc * parseFloat(t.odds || '1'), 1).toFixed(2);
        showNotification({
          id: 'tips-alert',
          title: 'Daily Odds Updated',
          message: `Total odds for today: ${totalOdds}. Check the new tips!`,
          type: 'odds'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const showNotification = (notif: any) => {
    // Don't show if already showing same type
    if (notification?.id === notif.id) return;
    
    setNotification(notif);
    setIsVisible(true);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  const icons = {
    tips: Bell,
    live: Zap,
    odds: TrendingUp
  };

  const Icon = notification ? icons[notification.type] : Bell;

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-zinc-200 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
               notification.type === 'live' ? 'bg-red-50 text-red-500' : 
               notification.type === 'odds' ? 'bg-primary/10 text-primary' : 'bg-zinc-50 text-zinc-400'
             }`}>
                <Icon className="w-6 h-6" />
             </div>
             
             <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5 leading-none">
                  {notification.title}
                </h4>
                <p className="text-xs font-black text-zinc-900 leading-tight lowercase">
                  {notification.message}
                </p>
             </div>

             <button 
               onClick={() => setIsVisible(false)}
               className="w-8 h-8 rounded-full hover:bg-zinc-50 flex items-center justify-center transition-colors text-zinc-300"
             >
                <X className="w-4 h-4" />
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
