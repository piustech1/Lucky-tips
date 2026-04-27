import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: 'Data Collection',
      content: 'We collect minimal data required for your account access and personalized experience. This includes your email (if provided) and application performance metrics.',
      icon: Eye
    },
    {
      title: 'Passkey Security',
      content: 'Our passkey system is designed to protect exclusive content. Sharing of passkeys is strictly prohibited and monitored.',
      icon: Lock
    },
    {
      title: 'Information Usage',
      content: 'Your data is never sold to third parties. We use it solely to improve our prediction algorithms and user interface.',
      icon: FileText
    }
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-orange-500/10 rounded-[28px] flex items-center justify-center border border-orange-500/20">
          <Shield className="w-8 h-8 text-orange-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight uppercase">Privacy Policy</h2>
          <p className="text-zinc-500 text-sm font-medium italic">Last updated: April 19, 2026</p>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-[32px] space-y-4">
            <div className="flex items-center gap-3 text-orange-500">
              <section.icon className="w-5 h-5" />
              <h3 className="font-bold tracking-tight">{section.title}</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-[32px] space-y-4">
        <h4 className="font-bold text-orange-500">Terms of Service</h4>
        <p className="text-zinc-500 text-xs leading-relaxed">
          By using Lucky Tips, you agree to our terms of service regarding sports prediction usage. Predictions are for informational purposes only. We are not responsible for financial decisions based on our tips.
        </p>
        <button className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-[0.2em] pt-2 underline underline-offset-4">
          Read Full Terms
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
