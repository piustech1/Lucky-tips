import { motion } from 'motion/react';
import { Send, MessageCircle, Mail, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Contact() {
  const contactOptions = [
    {
      id: 'telegram',
      title: 'Telegram Community',
      desc: 'Join our private channel for real-time updates and community discussion.',
      icon: Send,
      color: 'bg-[#0088cc]',
      link: 'https://t.me/lucky_tips_official',
      label: '@lucky_tips',
      btnLabel: 'Join Channel'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp VIP',
      desc: 'Direct support and exclusive VIP predictions sent to your phone.',
      icon: MessageCircle,
      color: 'bg-[#25D366]',
      link: 'https://wa.me/something',
      label: 'Chat on WhatsApp',
      btnLabel: 'Send Message'
    },
    {
      id: 'email',
      title: 'Business Email',
      desc: 'For advertising, partnerships, and account support inquiries.',
      icon: Mail,
      color: 'bg-zinc-900',
      link: 'mailto:support@luckytips.com',
      label: 'support@luckytips.com',
      btnLabel: 'Compose'
    }
  ];

  return (
    <div className="space-y-8 pb-10 px-2">
      <div className="flex items-center justify-between px-4">
        <div className="space-y-0.5">
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 leading-none lowercase">Support Center</h2>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] lowercase">We're here to help you win</p>
        </div>
        <div className="p-3 bg-zinc-100 rounded-2xl">
          <MessageCircle className="w-5 h-5 text-zinc-400" />
        </div>
      </div>

      <div className="space-y-4">
        {contactOptions.map((option, index) => (
          <motion.a
            key={option.id}
            href={option.link}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative block bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex gap-5">
              <div className={cn(
                "shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105", 
                option.color
              )}>
                {option.id === 'telegram' ? (
                  <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.35-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.25-3.55 3.92-1.64 4.73-1.92 5.27-1.93.12 0 .38.03.55.17.14.12.18.28.2.46.01.07.02.24 0 .32z"/></svg>
                ) : option.id === 'whatsapp' ? (
                  <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.03 14.69 2 12.04 2zm5.82 14.02c-.25.72-1.48 1.35-2.04 1.43-.51.08-1.18.15-3.41-.77-2.81-1.16-4.63-4.03-4.77-4.22-.14-.19-1.14-1.51-1.14-2.89 0-1.38.72-2.05 1-2.35.25-.26.54-.33.72-.33.15 0 .3 0 .42.01.14 0 .32-.05.5.38.19.46.64 1.57.7 1.69.06.12.1.28.02.46-.08.18-.12.3-.24.45l-.36.42c-.12.14-.26.29-.11.54.15.25.66 1.09 1.42 1.76.97.87 1.78 1.13 2.04 1.26.25.13.4.11.54-.05.15-.16.64-.74.82-1 .18-.25.35-.21.58-.12.23.09 1.47.69 1.73.81.25.13.42.19.48.3.06.11.06.64-.17 1.34z"/></svg>
                ) : (
                  <option.icon className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-black text-zinc-900 lowercase">{option.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed lowercase">{option.desc}</p>
                
                <div className="flex items-center justify-between pt-3">
                  <span className="text-[10px] font-black text-zinc-300 tabular-nums lowercase">{option.label}</span>
                  <div className="px-4 py-2 bg-zinc-50 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                    <span className="text-[9px] font-black uppercase tracking-widest lowercase">{option.btnLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mx-4 bg-zinc-900 border border-zinc-800 rounded-[40px] p-8 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl" />
        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10 shadow-inner">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-1 relative z-10">
          <h4 className="font-black text-white text-xl lowercase leading-none">Headquarters</h4>
          <p className="text-zinc-400 text-sm font-medium lowercase">London, United Kingdom</p>
        </div>
        <button className="relative z-10 w-full py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all lowercase">
          Browse Global Offices
        </button>
      </div>
    </div>
  );
}
