import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowLeft, Phone, CreditCard, ChevronRight, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { ref, serverTimestamp, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { cn } from '../lib/utils';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbw5sB1eQX8JSYC4pJJ5Voyn1RAtj4jDVyd8_Y13YSsnmn3v_zwCai3p-8Vqd3-cjxwh/exec';

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
  const [failed, setFailed] = useState(false);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastConfig, setToastConfig] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    if (toastConfig) {
      const timer = setTimeout(() => setToastConfig(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toastConfig]);

  const showStatusToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastConfig({ message, type });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPhone) return;

    setLoading(true);
    setFailed(false);
    setErrorMessage(null);
    
    try {
      // 1. Call Google Apps Script to initiate MarzPay collection
      console.log("=== INITIATING PAYMENT via GAS POST ===");
      
      const payload = {
        path: 'collect',
        amount: amount,
        phone: localPhone,
        packageName: pkgName,
        userId: profile?.uid || 'anonymous'
      };

      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error('[Frontend] Invalid JSON response from GAS:', rawText);
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      console.log("GAS response:", data);

      if (!data.success) {
        throw new Error(data.message || data.error || 'Failed to initiate payment');
      }

      const reference = data.reference;
      setTransactionRef(reference);

      // 2. Record pending payment in RTDB
      const paymentRef = ref(rtdb, `payments/${reference}`);
      await set(paymentRef, {
        userId: profile?.uid || 'anonymous',
        userName: profile?.displayName || 'Anonymous User',
        userEmail: profile?.email || 'N/A',
        amount: parseInt(amount),
        packageId: pkgId,
        packageName: pkgName,
        phoneNumber: localPhone,
        provider: provider,
        reference: reference,
        timestamp: serverTimestamp(),
        status: 'pending',
        currency: 'UGX'
      });

      setPhoneNumber(localPhone);
      setLoading(false);
      
      showStatusToast('Payment Initiated! Please check your phone for the PIN prompt.', 'success');
      
    } catch (error) {
      console.error('Payment Error:', error);
      showStatusToast(error instanceof Error ? error.message : 'Payment failed. Please try again.', 'error');
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!transactionRef) return;
    setCheckingStatus(true);
    setErrorMessage(null);

    try {
      const payload = {
        path: 'status',
        reference: transactionRef
      };

      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      
      // SAFE JSON PARSING
      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error('[Frontend] Invalid JSON from GAS status check:', rawText);
        throw new Error('Could not verify status. Please try again.');
      }
      
      console.log('Status check result from GAS:', data);

      const statusResult = data.status || (data.data?.transaction?.status);

      if (statusResult === 'completed' || statusResult === 'successful') {
        const { update } = await import('firebase/database');
        await update(ref(rtdb, `payments/${transactionRef}`), {
          status: 'completed',
          updatedAt: serverTimestamp()
        });

        setSuccess(true);
        showStatusToast('Payment Successful! Welcome to VIP.', 'success');
        
        setTimeout(() => {
          setIsVip(true);
          navigate('/vip');
        }, 4000);
      } else if (statusResult === 'failed' || statusResult === 'cancelled') {
        setFailed(true);
        setErrorMessage('The protocol was interrupted by user or network. Please try again.');
        showStatusToast('Payment failed or was cancelled.', 'error');
      } else {
        showStatusToast('Verification pending. Please ensure you have entered your PIN on your phone.', 'info');
      }
    } catch (error) {
      console.error('Status Check Error:', error);
      showStatusToast(error instanceof Error ? error.message : 'Error checking status.', 'error');
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 relative min-h-screen">
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

      {/* Custom Designed Toast */}
      <AnimatePresence>
        {toastConfig && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "fixed bottom-10 left-6 right-6 z-[100] p-5 rounded-[32px] shadow-2xl border flex items-center gap-4",
              toastConfig.type === 'success' ? "bg-zinc-900 text-white border-primary/20" : 
              toastConfig.type === 'error' ? "bg-red-950 text-red-200 border-red-500/20" :
              "bg-zinc-900 text-white border-white/10"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
              toastConfig.type === 'success' ? "bg-primary/20" :
              toastConfig.type === 'error' ? "bg-red-500/20" :
              "bg-blue-500/20"
            )}>
               <CheckCircle2 className={cn(
                 "w-6 h-6",
                 toastConfig.type === 'success' ? "text-primary" :
                 toastConfig.type === 'error' ? "text-red-500" :
                 "text-blue-500"
               )} />
            </div>
            <div className="flex-1 space-y-0.5">
              <h4 className="text-sm font-black lowercase tracking-tight">
                {toastConfig.type === 'success' ? 'Protocol Success' : 
                 toastConfig.type === 'error' ? 'Protocol Error' : 
                 'Protocol Alert'}
              </h4>
              <p className="text-[10px] font-bold opacity-70 leading-tight lowercase">
                {toastConfig.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-[48px] p-10 text-center shadow-2xl border border-zinc-100 dark:border-zinc-800 space-y-8"
        >
          <div className="w-24 h-24 bg-green-500 rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-green-500/20 rotate-3 animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic tracking-tighter lowercase dark:text-white text-zinc-900">Transaction Complete</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest lowercase px-4">
              your matrix level has been upgraded to VIP. enjoy access to all premium signals.
            </p>
          </div>
          <div className="pt-4">
            <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800">
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Receipt reference</p>
               <code className="text-xs font-black text-primary">{transactionRef}</code>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
             <p className="text-[10px] font-black text-zinc-400 lowercase tracking-widest">Redirecting to Vault...</p>
          </div>
        </motion.div>
      ) : failed ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-[48px] p-10 text-center shadow-2xl border border-zinc-100 dark:border-zinc-800 space-y-8"
        >
          <div className="w-24 h-24 bg-red-500 rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-red-500/20 -rotate-3">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic tracking-tighter lowercase dark:text-white text-zinc-900">Access Denied</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest lowercase px-4">
              {errorMessage || 'the protocol was interrupted. please check your balance or pin and try again.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={() => { setFailed(false); setTransactionRef(null); }}
              className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[32px] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl"
            >
              Retry Protocol
            </button>
            <button 
              onClick={() => navigate('/subscription')}
              className="w-full py-5 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-400 rounded-[32px] font-black uppercase tracking-[0.2em] text-[10px]"
            >
              Back to plans
            </button>
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
