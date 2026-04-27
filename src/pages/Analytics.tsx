import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Target, TrendingUp, Zap, PieChart } from 'lucide-react';
import { cn } from '../lib/utils';

const DATA = [
  { day: 'Mon', accuracy: 85 },
  { day: 'Tue', accuracy: 78 },
  { day: 'Wed', accuracy: 92 },
  { day: 'Thu', accuracy: 88 },
  { day: 'Fri', accuracy: 95 },
  { day: 'Sat', accuracy: 80 },
  { day: 'Sun', accuracy: 89 },
];

export default function Analytics() {
  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl font-black tracking-tight tracking-widest bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase">Performance</h2>
        <p className="text-[var(--muted-foreground)] text-sm font-medium">Real-time accuracy and win rate</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-3xl space-y-4"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[var(--muted-foreground)] text-[10px] font-bold uppercase tracking-widest">Accuracy</p>
            <div className="text-3xl font-black text-[var(--foreground)]">89.4%</div>
          </div>
          <div className="w-full bg-[var(--muted)] h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '89.4%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-premium-gradient rounded-full"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-3xl space-y-4"
        >
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-[var(--muted-foreground)] text-[10px] font-bold uppercase tracking-widest">Win Rate</p>
            <div className="text-3xl font-black text-[var(--foreground)]">92/100</div>
          </div>
          <div className="w-full bg-[var(--muted)] h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '92%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--card)] border border-[var(--border)] rounded-[32px] p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-bold tracking-tight text-[var(--foreground)] uppercase text-sm">Growth Analytics</h3>
          </div>
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase bg-[var(--muted)] px-2 py-1 rounded-md">Last 7 Days</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DATA}>
              <defs>
                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '16px', border: '1px solid var(--border)', fontSize: '12px' }}
                itemStyle={{ color: '#8b5cf6', fontWeight: 800 }}
                cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#8b5cf6" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorAcc)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* Stats Breakdown */}
      <section className="space-y-4 px-2">
        <div className="flex items-center gap-3">
          <PieChart className="w-5 h-5 text-primary" />
          <h3 className="font-bold tracking-tight uppercase text-sm">Detailed Statistics</h3>
        </div>
        
        <div className="space-y-3">
          {[
            { label: 'Won Predictions', value: '482', sub: '+12 this week', color: 'bg-green-500' },
            { label: 'Lost Predictions', value: '34', sub: '-2 this week', color: 'bg-red-500' },
            { label: 'Pending Reviews', value: '18', sub: 'In progress', color: 'bg-primary' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-[var(--card)]/40 border border-[var(--border)] rounded-2xl group transition-all hover:border-primary/20">
              <div className="flex items-center gap-4">
                <div className={cn("w-2 h-2 rounded-full", stat.color)} />
                <div>
                  <p className="font-bold text-sm tracking-tight">{stat.label}</p>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">{stat.sub}</p>
                </div>
              </div>
              <div className="text-2xl font-black tabular-nums tracking-tighter">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
