import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: 'Global Analytics Hub',
      content: 'We collect minimal data required for your account access and personalized experience. This includes your phone number, country, and application performance metrics to tailor predictions specifically for your market.',
      icon: Eye
    },
    {
      title: 'Secure Terminal Protocol',
      content: 'Our authentication system is designed to protect exclusive terminal content. Account sharing is strictly monitored by our security algorithms to protect the integrity of our predictions.',
      icon: Lock
    },
    {
      title: 'Algorithmic Usage',
      content: 'Your data is never sold to third parties. We use it solely to improve our prediction models and optimize the user interface for high-performance mobile devices.',
      icon: FileText
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-4 px-2 pt-4">
        <div className="w-16 h-16 bg-primary/10 rounded-[28px] flex items-center justify-center border border-primary/20">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight lowercase italic">Privacy Protocol</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest lowercase opacity-60">Terminal Archive Version: 2.0.4</p>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <div key={i} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-[40px] space-y-4 shadow-sm">
            <div className="flex items-center gap-3 text-primary">
              <section.icon className="w-5 h-5" />
              <h3 className="font-black text-lg lowercase tracking-tight italic">{section.title}</h3>
            </div>
            <p className="text-[var(--muted-foreground)] text-[11px] font-medium leading-relaxed lowercase">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/10 p-8 rounded-[40px] space-y-5">
        <h4 className="font-black text-sm text-primary lowercase italic tracking-tight underline underline-offset-4 decoration-2 decoration-primary/30">Responsible Participation</h4>
        <p className="text-[var(--muted-foreground)] text-[10px] font-bold leading-relaxed lowercase tracking-tight mb-4">
          By accessing lucky tip$, you agree to our algorithmic terms regarding sports prediction usage. All insights are generated for informational and statistical analysis. We advocate for responsible decision-making and are not liable for individual outcomes based on terminal predictions.
        </p>
        <button className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] transition-all hover:gap-4 lowercase">
          Full Operational Terms
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
