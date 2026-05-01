import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Crown, Zap, Shield, Diamond, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const PACKAGES = [
  {
    id: 'daily',
    name: 'daily pack',
    price: '500',
    currency: 'UGX',
    duration: '24 hours',
    tier: 'silver',
    icon: Zap,
    color: 'bg-zinc-100',
    borderColor: 'border-zinc-300', // Bold Silver
    accentColor: 'text-zinc-600',
    features: ['high accuracy tips', '1 day access', 'instant notification']
  },
  {
    id: 'weekly',
    name: 'weekly pack',
    price: '20,000',
    currency: 'UGX',
    duration: '7 days',
    tier: 'gold',
    icon: Crown,
    color: 'bg-yellow-500/5',
    borderColor: 'border-yellow-500', // Bold Gold
    accentColor: 'text-yellow-600',
    features: ['daily premium tips', '7 days access', '24/7 support', 'high odds selections']
  },
  {
    id: 'monthly',
    name: 'monthly pack',
    price: '50,000',
    currency: 'UGX',
    duration: '30 days',
    tier: 'diamond',
    icon: Diamond,
    color: 'bg-blue-500/5',
    borderColor: 'border-blue-500', // Bold Diamond
    accentColor: 'text-blue-600',
    features: ['unlimited vip access', '30 days access', 'priority support', 'banker tips included']
  },
  {
    id: 'yearly',
    name: 'platinum plan',
    price: '300,000',
    currency: 'UGX',
    duration: '1 year',
    tier: 'platinum',
    icon: Shield,
    color: 'bg-indigo-500/5',
    borderColor: 'border-indigo-500', // Bold Platinum
    accentColor: 'text-indigo-600',
    features: ['all-time vip access', '1 year access', 'exclusive direct contact', 'fixed matches archive access']
  }
];

export default function Subscription() {
  const [activeIndex, setActiveIndex] = useState(1);
  const navigate = useNavigate();

  const handleSelect = (pkgId: string, amount: string, name: string) => {
    const rawAmount = amount.replace(/,/g, '');
    navigate(`/payment?package=${pkgId}&amount=${rawAmount}&name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <section className="text-center space-y-2 px-6">
        <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)] leading-none lowercase">become a vip</h2>
        <p className="text-[var(--muted-foreground)] text-[10px] font-bold lowercase tracking-tight max-w-[240px] mx-auto leading-tight">
          unlock the most accurate daily sports predictions from our global analysts.
        </p>
      </section>

      {/* Scroll Hint */}
      <div className="flex flex-col items-center gap-1.5 opacity-60">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] animate-pulse lowercase">swipe to explore packages</span>
        <motion.div 
          animate={{ x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,191,166,0.4)]"
        />
      </div>

      {/* Packages Carousel - Mobile Scroll based */}
      <div className="relative overflow-x-auto no-scrollbar snap-x snap-mandatory px-8 flex gap-5 pb-10">
        {PACKAGES.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            className={cn(
              "flex-none w-[280px] snap-center bg-[var(--card)] border-[3px] rounded-[40px] p-8 shadow-xl shadow-primary/5 relative overflow-hidden group",
              pkg.borderColor
            )}
          >
            {/* Background Accent */}
            <div className={cn("absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-10", pkg.id === 'weekly' ? 'bg-yellow-500' : pkg.id === 'monthly' ? 'bg-blue-500' : 'bg-primary')} />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-3 rounded-2xl",
                  pkg.id === 'weekly' ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                )}>
                  <pkg.icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                  pkg.id === 'weekly' ? "bg-yellow-500/10 text-yellow-600" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                )}>
                  {pkg.tier}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight lowercase">{pkg.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[var(--foreground)] tabular-nums">{pkg.price}</span>
                  <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">{pkg.currency}</span>
                </div>
              </div>

              <div className="space-y-3 py-2">
                {pkg.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-win/10 rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5 text-win" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--muted-foreground)] lowercase tracking-tight">{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelect(pkg.id, pkg.price, pkg.name)}
                className={cn(
                  "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95",
                  pkg.id === 'weekly' 
                    ? "bg-yellow-500 text-black shadow-yellow-500/20" 
                    : "bg-premium-gradient text-white shadow-primary/20 hover:scale-[1.02]"
                )}
              >
                select plan
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Section */}
      <section className="bg-[var(--muted)]/50 border border-[var(--border)] rounded-[32px] p-6 mx-6 space-y-3">
        <div className="flex items-center gap-2">
           <Shield className="w-4 h-4 text-primary" />
           <h4 className="font-black text-[11px] text-[var(--foreground)] uppercase tracking-[0.1em] lowercase">why choose lucky tips?</h4>
        </div>
        <p className="text-[10px] font-bold text-[var(--muted-foreground)] leading-relaxed lowercase tracking-tight">
          our vip plans offer refined analytics from professional punters. we filter for value to ensure you only get the highest quality entry points in the market.
        </p>
      </section>
    </div>
  );
}
