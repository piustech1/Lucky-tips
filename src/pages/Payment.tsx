import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowLeft, Phone, CreditCard, ChevronRight, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { ref, push, serverTimestamp, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const pkgName = searchParams.get('name') || 'Weekly Pack';
  const pkgId = searchParams.get('package') || 'weekly';
  const amount = searchParams.get('amount') || '20000';
  const { setPhoneNumber, setIsVip, phoneNumber, profile } = useUser();
  const [localPhone, setLocalPhone] = useState(phoneNumber);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPhone) return;

    setLoading(true);
    
    try {
      // Record payment in RTDB
      const paymentRef = push(ref(rtdb, 'payments'));
      await set(paymentRef, {
        userId: profile?.uid || 'anonymous',
        userName: profile?.displayName || 'Anonymous User',
        userEmail: profile?.email || 'N/A',
        amount: parseInt(amount),
        packageId: pkgId,
        phoneNumber: localPhone,
        timestamp: serverTimestamp(),
        status: 'completed',
        currency: 'UGX'
      });

      setPhoneNumber(localPhone);
      setSuccess(true);
      setLoading(false);
      
      // Activation sequence
      setTimeout(() => {
        setIsVip(true);
        navigate('/vip');
      }, 2000);
    } catch (error) {
      console.error('Payment Record Error:', error);
      alert('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <button 
        onClick={() => navigate(-1)}
        className="p-3 rounded-2xl bg-[var(--muted)] hover:bg-[var(--border)] transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
      </button>

      <section className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight text-[var(--foreground)] leading-none lowercase italic">CHECKOUT</h2>
        <p className="text-[var(--muted-foreground)] font-bold text-xs uppercase tracking-widest lowercase">Complete your subscription</p>
      </section>

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-win rounded-[40px] p-10 text-center text-white space-y-6 shadow-2xl shadow-win/30"
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black lowercase tracking-tight">payment successful</h3>
            <p className="text-white/80 font-bold text-xs uppercase tracking-widest leading-relaxed lowercase">
              Your VIP access is being activated. Please wait while we redirect you.
            </p>
          </div>
          <div className="flex justify-center">
             <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="bg-primary-dark rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-primary/10">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <CreditCard className="w-24 h-24 rotate-12" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest lowercase">Plan Selected</span>
                <h4 className="text-2xl font-black capitalize lowercase italic tracking-tight">{pkgName}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                <span className="font-black text-2xl tracking-tighter">{parseInt(amount).toLocaleString()} UGX</span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ONE-TIME</span>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            <div className="space-y-4 pt-4">
              <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest ml-2 lowercase">
                Phone for Mobile Money
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-primary transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  placeholder="256 700 000 000"
                  value={localPhone}
                  onChange={(e) => setLocalPhone(e.target.value)}
                  className="w-full bg-[var(--card)] border-2 border-[var(--border)] rounded-[32px] py-5 pl-16 pr-6 font-black text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/30 focus:outline-none focus:border-primary transition-all text-lg shadow-sm"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading || !localPhone}
              className="w-full py-5 bg-premium-gradient text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="lowercase">Processing...</span>
                </>
              ) : (
                <>
                  <span className="lowercase">Confirm Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-10 leading-relaxed lowercase opacity-70">
            By clicking confirm, you authorize a prompt to be sent to your phone for payment confirmation via MTN or Airtel Mobile Money.
          </p>
        </div>
      )}
    </div>
  );
}
