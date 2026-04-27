import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, X, Clock, Lock, ShieldCheck } from 'lucide-react';
import { Prediction } from '../types';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { getTeamLogo } from '../services/logoService';

interface PredictionCardProps {
  prediction: Prediction;
  index?: number;
  key?: React.Key;
}

const DEFAULT_LOGO = 'https://www.pngrepo.com/png/343015/512/football.png';

export default function PredictionCard({ prediction, index = 0 }: PredictionCardProps) {
  const { isVip } = useUser();
  const navigate = useNavigate();
  const [homeLogo, setHomeLogo] = useState<string | null>(null);
  const [awayLogo, setAwayLogo] = useState<string | null>(null);
  
  const isLocked = !isVip && (prediction.isVip || (prediction.category && prediction.category !== 'free'));

  useEffect(() => {
    async function loadLogos() {
      const [hLogo, aLogo] = await Promise.all([
        getTeamLogo(prediction.homeTeam),
        getTeamLogo(prediction.awayTeam)
      ]);
      if (hLogo) setHomeLogo(hLogo);
      if (aLogo) setAwayLogo(aLogo);
    }
    loadLogos();
  }, [prediction.homeTeam, prediction.awayTeam]);

  const getStatusIcon = () => {
    switch(prediction.status) {
      case 'won': 
        return <Check className="w-5 h-5 text-win stroke-[4]" />;
      case 'lost': 
        return <X className="w-5 h-5 text-lose stroke-[4]" />;
      default: 
        return (
          <div className="relative">
            <Clock className="w-4 h-4 text-pending animate-pulse" />
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-primary/20 group/card"
    >
      {/* Brand Header */}
      <div className="bg-primary-dark px-4 py-2.5 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black lowercase tracking-widest opacity-90">{prediction.league}</span>
          {prediction.isVip ? (
            <span className="bg-yellow-400 text-black text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">vip</span>
          ) : (
            <span className="bg-white/20 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter backdrop-blur-sm">free</span>
          )}
        </div>
        <span className="text-[10px] font-bold tabular-nums text-white/60 lowercase">{prediction.date}</span>
      </div>

      <div className="flex items-stretch">
        <div className="flex-1 p-5 space-y-4">
          {/* Teams Line */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative">
                <img 
                  src={homeLogo || DEFAULT_LOGO} 
                  alt={prediction.homeTeam} 
                  className="w-9 h-9 object-contain shrink-0 drop-shadow-sm transition-transform group-hover/card:scale-110" 
                  onError={(e) => (e.currentTarget.src = DEFAULT_LOGO)}
                />
              </div>
              <span className="font-black text-[15px] text-[var(--foreground)] leading-none truncate lowercase tracking-tight">{prediction.homeTeam}</span>
            </div>
            
            <div className="flex flex-col items-center px-1">
              <span className="text-[10px] font-black text-primary/40 uppercase tracking-tighter italic">vs</span>
            </div>
            
            <div className="flex items-center gap-3 min-w-0 flex-1 flex-row-reverse">
              <div className="relative">
                <img 
                  src={awayLogo || DEFAULT_LOGO} 
                  alt={prediction.awayTeam} 
                  className="w-9 h-9 object-contain shrink-0 drop-shadow-sm transition-transform group-hover/card:scale-110" 
                  onError={(e) => (e.currentTarget.src = DEFAULT_LOGO)}
                />
              </div>
              <span className="font-black text-[15px] text-[var(--foreground)] leading-none truncate lowercase tracking-tight text-right">{prediction.awayTeam}</span>
            </div>
          </div>

          {/* Tip & Odds Line */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 px-2 rounded-lg bg-[var(--muted)] text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider lowercase">
                tip
              </div>
              {isLocked ? (
                <button 
                  onClick={() => navigate('/subscription')}
                  className="flex items-center gap-1 text-[12px] font-black text-amber-500 hover:text-amber-600 transition-colors lowercase group"
                >
                  <Lock className="w-3 h-3" />
                  <span>unlock matches</span>
                </button>
              ) : (
                <span className="text-[14px] font-black text-[var(--foreground)] lowercase truncate">{prediction.tip}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider lowercase">
                odds
              </div>
              {isLocked ? (
                <span className="text-[12px] font-black text-[var(--muted-foreground)] opacity-30 tracking-widest">---</span>
              ) : (
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[14px] font-black tabular-nums">
                  {prediction.odds}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Status Column */}
        <div className="w-[85px] bg-[var(--muted)]/30 border-l border-[var(--border)] flex flex-col items-center justify-center gap-1.5 py-4 shrink-0 transition-colors group-hover/card:bg-[var(--muted)]/50">
          <div className="p-2 rounded-full bg-[var(--background)] shadow-inner">
            {getStatusIcon()}
          </div>
          <span className={cn(
            "text-[14px] font-black tabular-nums lowercase tracking-tighter",
            prediction.status === 'won' ? "text-win" : 
            prediction.status === 'lost' ? "text-lose" : "text-pending"
          )}>
            {prediction.score?.replace('-', ':') || '---'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
