import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowLeft, Phone, CreditCard, ChevronRight, Zap, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { ref, serverTimestamp, set, onValue, update } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { cn } from '../lib/utils';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbw5sB1eQX8JSYC4pJJ5Voyn1RAtj4jDVyd8_Y13YSsnmn3v_zwCai3p-8Vqd3-cjxwh/exec';

type PaymentStep = 'idle' | 'processing' | 'success' | 'failed';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const pkgName = searchParams.get('name') || 'Weekly Pack';
  const pkgId = searchParams.get('package') || 'weekly';
  const amount = searchParams.get('amount') || '20000';
  const { setPhoneNumber, setIsVip, phoneNumber, profile } = useUser();
  
  const [step, setStep] = useState<PaymentStep>('idle');
  const [localPhone, setLocalPhone] = useState(phoneNumber || '');
  const [provider, setProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [loading, setLoading] = useState(false);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastConfig, setToastConfig] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();
  
  const [processingMessageIdx, setProcessingMessageIdx] = useState(0);
  const processingMessages = [
    'Waiting for your PIN authorization...',
    'Synchronizing with Mobile Money network...',
    'Securely verifying transaction via MarzPay...',
    'Establishing encrypted handshake...',
    'Awaiting final network clearance...'
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'processing') {
      timer = setInterval(() => {
        setProcessingMessageIdx((prev) => (prev + 1) % processingMessages.length);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [step]);
 
  // Toast Auto-dismiss
  useEffect(() => {
    if (toastConfig) {
      const timer = setTimeout(() => setToastConfig(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastConfig]);

  // Failsafe Polling
  useEffect(() => {
    let pollingTimer: NodeJS.Timeout;
    
    if (step === 'processing' && transactionRef) {
      pollingTimer = setInterval(() => {
        console.log(`[Failsafe] Triggering status sync for ${transactionRef}`);
        checkStatusManual();
      }, 8000); // Poll every 8 seconds for faster UX
    }
    
    return () => {
      if (pollingTimer) clearInterval(pollingTimer);
    };
  }, [step, transactionRef]);

  // Real-time Firebase Listener for Payment Status
  useEffect(() => {
    if (!transactionRef || step === 'success' || step === 'failed') return;

    const statusRef = ref(rtdb, `payments/${transactionRef}`);
    
    console.log(`[Lifecycle] Monitoring status for: ${transactionRef}`);
    
    const unsubscribe = onValue(statusRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const currentStatus = (data.status || '').toLowerCase();
      console.log(`[Realtime] Current Status: "${currentStatus}" (Transaction: ${transactionRef})`);

      const isSuccess = ['completed', 'successful', 'success', 'approved'].includes(currentStatus);
      const isFailed = ['failed', 'cancelled', 'declined', 'error', 'rejected'].includes(currentStatus);

      if (isSuccess) {
        if (step === 'success') return;
        console.log('[Realtime] Success detected! Transitioning...');
        
        // GRANT VIP STATUS
        if (profile?.uid) {
           const durationMs = pkgId === 'daily' ? 24 * 60 * 60 * 1000 : 
                            pkgId === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 
                            30 * 24 * 60 * 60 * 1000;
           
           const expiryDate = new Date(Date.now() + durationMs);
           
           const updates: any = {
             subscriptionTier: 'vip',
             subscriptionExpiry: expiryDate.toISOString(),
             lastActivated: Date.now()
           };

           try {
             await update(ref(rtdb, `users/${profile.uid}`), updates);
             console.log(`[Realtime] VIP granted and expiry set for ${profile.uid}: ${expiryDate.toISOString()}`);
           } catch (err) {
             console.error('[Realtime] Failed to grant VIP in RTDB:', err);
           }
        }
        
        setIsVip(true);
        setStep('success');
        showStatusToast('Matrix access upgraded. Redirecting...', 'success');
        
        setTimeout(() => navigate('/profile'), 5000);
      } else if (isFailed) {
        if (step === 'failed') return;
        console.warn(`[Realtime] Failure detected! Remote status: ${currentStatus}`);
        setErrorMessage(`Transaction ${currentStatus}. If money was taken, visit profile in 5 mins.`);
        setStep('failed');
      }
    });

    return () => unsubscribe();
  }, [transactionRef, step, profile?.uid, pkgId, setIsVip, navigate]);

  const showStatusToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastConfig({ message, type });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; 
    
    // Snappy validation
    const cleanPhone = localPhone.replace(/\s/g, '');
    if (cleanPhone.length < 10) {
      showStatusToast('Please enter a valid phone number.', 'error');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    
    try {
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
      console.log("[Payment] GAS Raw Response:", rawText);
      
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        // Fallback: If we can see a reference in the text but JSON failed
        const refMatch = rawText.match(/"reference":"([^"]+)"/);
        if (refMatch) {
          data = { status: 'success', reference: refMatch[1] };
        } else {
          throw new Error('Server protocol error. Please check your phone for the PIN prompt.');
        }
      }

      // Extract reference from various possible locations in the response
      const reference = data.reference || 
                       data.data?.reference || 
                       data.data?.transaction?.reference;
      
      const isInitiated = data.status === 'success' || data.success || !!reference;

      if (isInitiated && reference) {
        // Record initiation in RTDB
        await set(ref(rtdb, `payments/${reference}`), {
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

        setTransactionRef(reference);
        setPhoneNumber(localPhone);
        setStep('processing');
        showStatusToast('Authorization request sent. Check your phone.', 'success');
      } else {
        throw new Error(data.message || 'Initiation failed. Check your balance or phone number.');
      }
      
    } catch (error) {
      console.error('Payment Initiation Error:', error);
      showStatusToast(error instanceof Error ? error.message : 'Processing failure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkStatusManual = async () => {
    if (!transactionRef) return;
    try {
      showStatusToast('Syncing with network...', 'info');
      const payload = { path: 'status', reference: transactionRef };
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      
      const raw = await response.text();
      console.log("[Status Check] Raw Response:", raw);
      
      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error("[Status Check] Parse Error");
        return;
      }

      const statusRes = (data.status || data.data?.transaction?.status || '').toLowerCase();
      console.log(`[Status Check] Normalized Status: ${statusRes}`);
      
      const isSuccess = ['completed', 'successful', 'success', 'approved'].includes(statusRes);
      const isFailed = ['failed', 'cancelled', 'declined', 'error', 'rejected'].includes(statusRes);

      if (isSuccess) {
        // Direct UI Transition to avoid waiting for listener
        if (step !== 'success') {
          console.log("[Status Check] Force transitioning to success state");
          
          // Sync Firebase for persistence
          await update(ref(rtdb, `payments/${transactionRef}`), {
            status: 'completed',
            updatedAt: serverTimestamp()
          });

          // Grant VIP locally and in DB
          if (profile?.uid) {
            const durationMs = pkgId === 'daily' ? 24 * 60 * 60 * 1000 : 
                             pkgId === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 
                             30 * 24 * 60 * 60 * 1000;
            const expiryDate = new Date(Date.now() + durationMs);
            
            await update(ref(rtdb, `users/${profile.uid}`), {
              subscriptionTier: 'vip',
              subscriptionExpiry: expiryDate.toISOString(),
              lastActivated: Date.now()
            });
          }
          
          setIsVip(true);
          setStep('success');
          showStatusToast('Payment Verified! Access Granted.', 'success');
          
          setTimeout(() => navigate('/profile'), 5000);
        }
      } else if (isFailed) {
        await update(ref(rtdb, `payments/${transactionRef}`), {
          status: 'failed',
          updatedAt: serverTimestamp()
        });
        setStep('failed');
      } else {
        showStatusToast('Authorization pending. Please check your phone.', 'info');
      }
    } catch (err) {
      console.error('Manual check failed:', err);
      showStatusToast('Network sync error. Retrying...', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12 relative min-h-screen">
      <button 
        onClick={() => step === 'idle' ? navigate(-1) : setStep('idle')}
        className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-zinc-900 dark:text-white" />
      </button>

      <section className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-none lowercase italic">CHECKOUT</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest lowercase">Complete your subscription</p>
      </section>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 w-[90%] max-w-sm",
              toastConfig.type === 'success' ? "bg-zinc-900 text-white border-zinc-800" : 
              toastConfig.type === 'error' ? "bg-red-950 text-red-50 border-red-900/50" :
              "bg-zinc-900 text-white border-zinc-800"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
              toastConfig.type === 'success' ? "bg-primary/20" :
              toastConfig.type === 'error' ? "bg-red-500/20" :
              "bg-zinc-500/10"
            )}>
               <CheckCircle2 className={cn(
                 "w-4 h-4",
                 toastConfig.type === 'success' ? "text-primary" :
                 toastConfig.type === 'error' ? "text-red-500" :
                 "text-zinc-400"
               )} />
            </div>
            <p className="text-xs font-medium leading-tight">{toastConfig.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'success' ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-zinc-900 rounded-[48px] p-10 text-center shadow-2xl border border-zinc-100 dark:border-zinc-800 space-y-8"
          >
            <div className="w-24 h-24 bg-green-500 rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-green-500/20 rotate-3 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter dark:text-white text-zinc-900 leading-none">Authentication Success</h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest lowercase px-4">
                your protocol has been elevated to VIP. full access granted to the matrix hub.
              </p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 space-y-4">
               <div className="flex justify-between items-center text-left">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Package</p>
                    <p className="text-sm font-black text-zinc-900 dark:text-white capitalize">{pkgName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Amount Paid</p>
                    <p className="text-sm font-black text-primary">{parseInt(amount).toLocaleString()} UGX</p>
                  </div>
               </div>
               <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 text-left">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Receipt ID</p>
                  <code className="text-xs font-black text-primary break-all">{transactionRef}</code>
               </div>
            </div>
            <div className="flex flex-col items-center gap-3">
               <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
               <p className="text-[10px] font-black text-zinc-400 lowercase tracking-widest">Entering VIP Vault...</p>
            </div>
          </motion.div>
        ) : step === 'failed' ? (
          <motion.div 
            key="failed"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-zinc-900 rounded-[48px] p-10 text-center shadow-2xl border border-zinc-100 dark:border-zinc-800 space-y-8"
          >
            <div className="w-24 h-24 bg-red-500 rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-red-500/20 -rotate-3">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter dark:text-white text-zinc-900 leading-none">Payment Aborted</h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest lowercase px-4">
                {errorMessage || 'The transaction could not be completed. Please verify your balance and retry the protocol.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={() => setStep('idle')}
                className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[32px] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl"
              >
                Retry Request
              </button>
              <button 
                onClick={() => navigate('/subscription')}
                className="w-full py-5 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-400 rounded-[32px] font-black uppercase tracking-[0.2em] text-[10px]"
              >
                Return to Plans
              </button>
            </div>
          </motion.div>
        ) : step === 'processing' ? (
          <motion.div 
            key="processing"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-[48px] p-10 text-center shadow-2xl border border-zinc-100 dark:border-zinc-800 space-y-8"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto relative">
               <div className="absolute inset-0 border-4 border-primary rounded-[32px] animate-ping opacity-20" />
               <RefreshCw className="w-10 h-10 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black italic tracking-tighter dark:text-white text-zinc-900">Validating Payment</h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest leading-relaxed px-4 animate-pulse">
                {processingMessages[processingMessageIdx]}
              </p>
              <div className="pt-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-80">
                 DO NOT CLOSE THIS PAGE OR REFRESH
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-2">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Network Lock Reference</span>
                 <code className="text-[10px] font-black text-primary select-all break-all">{transactionRef}</code>
              </div>

              <button
                 onClick={() => {
                   showStatusToast('Status sync requested...', 'info');
                   checkStatusManual();
                 }}
                 className="w-full py-4 bg-zinc-100 dark:bg-zinc-800/50 text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-2 rounded-3xl hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                 <RefreshCw className="w-3 h-3" />
                 I have completed the PIN prompt
              </button>

              <button
                 onClick={() => setStep('idle')}
                 className="w-full py-4 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-400 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                 Cancel Authorization
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-zinc-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-black/10">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <CreditCard className="w-24 h-24 rotate-12" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Plan Selection</span>
                  <h4 className="text-2xl font-black capitalize italic tracking-tight">{pkgName}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                  <span className="font-black text-3xl tracking-tighter">{parseInt(amount).toLocaleString()} UGX</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">One-Time License</span>
                </div>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              <div className="space-y-4 pt-4">
                <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-2">
                  Select Provider
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

                <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-2 block pt-2">
                  Recipient Identity (Phone)
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
                type="submit"
                className="w-full py-5 bg-primary text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:brightness-110"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Initiating...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize Payment</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-10 leading-relaxed opacity-70">
              By initiating authorization, you confirm a network request for Mobile Money confirmation. All transactions are secured via MarzPay encryption protocols.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
