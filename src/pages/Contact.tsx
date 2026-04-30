import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageCircle, Mail, MapPin, User, ChevronDown, CheckCircle2, Clock, ShieldCheck, Phone } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Payment Issue',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 2000));
    setIsLoading(false);
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
  };

  const contactOptions = [
    {
      id: 'whatsapp',
      title: 'WhatsApp VIP',
      status: 'Replies instantly',
      icon: MessageCircle,
      color: 'text-[#25D366]',
      bg: 'bg-[#25D366]/10',
      link: 'https://wa.me/something',
    },
    {
      id: 'telegram',
      title: 'Telegram Intel',
      status: 'High priority',
      icon: Send,
      color: 'text-[#0088cc]',
      bg: 'bg-[#0088cc]/10',
      link: 'https://t.me/lucky_tips_official',
    },
    {
      id: 'email',
      title: 'Email Relay',
      status: '2-4 hours',
      icon: Mail,
      color: 'text-primary',
      bg: 'bg-primary/10',
      link: 'mailto:support@luckytips.com',
    },
    {
      id: 'phone',
      title: 'Hotline',
      status: '24/7 Support',
      icon: Phone,
      color: 'text-zinc-500',
      bg: 'bg-zinc-100',
      link: 'tel:+1234567890',
    }
  ];

  return (
    <div className="space-y-12 pb-24 px-4 pt-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-primary"
        >
          Contact Support Anytime
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black italic lowercase tracking-tight text-zinc-900"
        >
          Comms Center
        </motion.h2>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border border-[#E9ECEF] rounded-[48px] p-8 shadow-2xl shadow-black/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Identify Marker</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    type="text" 
                    placeholder="Full Name"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs lowercase"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Communication Channel</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    type="email" 
                    placeholder="Your Email"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs lowercase"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Intelligence Subject</label>
              <div className="relative">
                <select 
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-6 pr-12 text-zinc-900 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs appearance-none lowercase"
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                >
                  <option>Payment Issue</option>
                  <option>Tip Inquiry</option>
                  <option>Account Help</option>
                  <option>Bug Report</option>
                  <option>Other Intelligence</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Detailed Matrix (Message)</label>
              <textarea 
                required
                rows={4}
                placeholder="Infect the terminal with your findings..."
                className="w-full bg-zinc-50 border border-zinc-100 rounded-[32px] p-6 text-zinc-900 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs lowercase resize-none min-h-[140px]"
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>

            <button 
              disabled={isLoading}
              className="w-full h-16 bg-zinc-900 text-white rounded-[24px] font-black flex items-center justify-center gap-4 shadow-2xl shadow-black/20 disabled:opacity-50 transition-all active:scale-[0.97] hover:bg-black group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : isSent ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-win" />
                  <span className="text-xs tracking-[0.2em] uppercase">Sent Successfully</span>
                </>
              ) : (
                <>
                  <span className="text-xs tracking-[0.2em] uppercase">Transmit Intel</span>
                  <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Quick Help & Extra Info */}
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {contactOptions.map((opt, i) => (
              <motion.a
                key={opt.id}
                href={opt.link}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#E9ECEF] p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group overflow-hidden relative"
              >
                <div className={cn("absolute -top-4 -right-4 w-12 h-12 rounded-full blur-2xl opacity-20", opt.color.replace('text', 'bg'))} />
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", opt.bg)}>
                  <opt.icon className={cn("w-6 h-6", opt.color)} />
                </div>
                <h4 className="text-sm font-black text-zinc-900 lowercase italic leading-none truncate">{opt.title}</h4>
                <p className="text-[10px] text-zinc-400 font-bold mt-2 lowercase">{opt.status}</p>
              </motion.a>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900 rounded-[40px] p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl" />
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                   <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                   <h5 className="text-sm font-black lowercase italic">Operational Hours</h5>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">24/7 Global Signal Active</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                   <ShieldCheck className="w-5 h-5 text-win" />
                </div>
                <div>
                   <h5 className="text-sm font-black lowercase italic">Fast Response Node</h5>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Ensuring you never miss winning signal$</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
