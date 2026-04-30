import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowLeft, Phone, CreditCard, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { ref, serverTimestamp, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const pkgName = searchParams.get('name') || 'Weekly Pack';
  const pkgId = searchParams.get('package') || 'weekly';
  const amount = searchParams.get('amount') || '20000';
  const { setPhoneNumber, setIsVip, phoneNumber, profile } = useUser();
  const [localPhone, setLocalPhone] = useState(phoneNumber || '');
  const [provider, setProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPhone) return;

    setLoading(true);
    
    try {
      // 1. Call Backend to initiate MarzPay collection
      const response = await fetch('/api/collect-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          phoneNumber: localPhone,
          packageName: pkgName,
          userId: profile?.uid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      setTransactionRef(data.reference);

      // 2. Record pending payment in RTDB
      const paymentRef = ref(rtdb, `payments/${data.reference}`);
      await set(paymentRef, {
        userId: profile?.uid || 'anonymous',
        userName: profile?.displayName || 'Anonymous User',
        userEmail: profile?.email || 'N/A',
        amount: parseInt(amount),
        packageId: pkgId,
        packageName: pkgName,
        phoneNumber: localPhone,
        reference: data.reference,
        timestamp: serverTimestamp(),
        status: 'pending',
        currency: 'UGX'
      });

      setPhoneNumber(localPhone);
      setLoading(false);
      
      // Tell user to check phone for PIN prompt
      alert('Request success! please check your phone now. a mobile money prompt will appear shortly. enter your secret pin to confirm payment.');
      
    } catch (error) {
      console.error('Payment Error:', error);
      alert(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!transactionRef) return;
    setCheckingStatus(true);

    try {
      const response = await fetch(`/api/check-status/${transactionRef}`);
      const data = await response.json();
      
      console.log('Status check result:', data);

      // Depending on MarzPay response format (usually has status in transaction or top level)
      const status = data.transaction?.status || data.status;

      if (status === 'completed' || status === 'successful') {
        // Update Firebase status to completed
        const { update } = await import('firebase/database');
        await update(ref(rtdb, `payments/${transactionRef}`), {
          status: 'completed',
          updatedAt: serverTimestamp()
        });

        setSuccess(true);
        // Activation sequence
        setTimeout(() => {
          setIsVip(true);
          navigate('/vip');
        }, 2000);
      } else if (status === 'failed') {
        alert('Payment failed or was cancelled.');
      } else {
        alert('Payment is still pending. Please complete the prompt on your phone.');
      }
    } catch (error) {
      console.error('Status Check Error:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <button 
        onClick={() => navigate(-1)}
        className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-zinc-900 dark:text-white" />
      </button>

      <section className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-none lowercase italic">CHECKOUT</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest lowercase">Complete your subscription</p>
      </section>

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-600 rounded-[40px] p-10 text-center text-white space-y-6 shadow-2xl shadow-green-600/30"
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
          <div className="bg-zinc-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-black/10">
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

          {!transactionRef ? (
            <form onSubmit={handlePayment} className="space-y-6">
              <div className="space-y-4 pt-4">
                <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-2 lowercase">
                  Select Your Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProvider('mtn')}
                    className={cn(
                      "h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2",
                      provider === 'mtn' 
                        ? "bg-yellow-400 text-black border-yellow-500 shadow-lg shadow-yellow-400/20" 
                        : "bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800"
                    )}
                  >
                    MTN UGANDA
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('airtel')}
                    className={cn(
                      "h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2",
                      provider === 'airtel' 
                        ? "bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20" 
                        : "bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-100 dark:border-zinc-800"
                    )}
                  >
                    AIRTEL UGANDA
                  </button>
                </div>

                <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-2 block pt-2 lowercase">
                  Phone for Mobile Money
                </label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    placeholder="07xx xxx xxx"
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[32px] py-5 pl-16 pr-6 font-black text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-700 focus:outline-none focus:border-primary transition-all text-lg shadow-sm"
                    required
                  />
                </div>
              </div>

              <button
                disabled={loading || !localPhone}
                className="w-full py-5 bg-primary text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-3xl space-y-3">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 lowercase italic">
                  Payment request initiated. check your phone and enter your mobile money pin to complete transaction.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ref:</span>
                  <code className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-black">{transactionRef}</code>
                </div>
              </div>

              <button
                onClick={checkStatus}
                disabled={checkingStatus}
                className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[32px] font-black uppercase tracking-[0.2em] text-sm shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {checkingStatus ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="lowercase">Verifying...</span>
                  </>
                ) : (
                  <>
                    <span className="lowercase">Check Payment Status</span>
                    <RefreshCw className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => setTransactionRef(null)}
                className="w-full text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors lowercase"
              >
                try different number
              </button>
            </div>
          )}

          <p className="text-center text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-10 leading-relaxed lowercase opacity-70">
            By clicking confirm, you authorize a prompt to be sent to your phone for payment confirmation via MTN or Airtel Mobile Money.
          </p>
        </div>
      )}
    </div>
  );
}
