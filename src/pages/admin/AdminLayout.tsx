import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Trophy, Wallet, 
  Bell, BarChart3, Settings, LogOut, 
  Menu, X, History, FileText, Activity, Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Trophy, label: 'Tips System', path: '/admin/tips' },
  { icon: Globe, label: 'Logo Manager', path: '/admin/logo-manager' },
  { icon: History, label: 'Tips History', path: '/admin/history' },
  { icon: Users, label: 'User Hub', path: '/admin/users' },
  { icon: Wallet, label: 'Subscriptions', path: '/admin/subscriptions' },
  { icon: Bell, label: 'Push Alerts', path: '/admin/notifications' },
  { icon: BarChart3, label: 'Market Intel', path: '/admin/market-intel' },
  { icon: FileText, label: 'Revenue', path: '/admin/revenue' },
  { icon: Activity, label: 'System Logs', path: '/admin/logs' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex antialiased selection:bg-primary/20">
      {/* Sidebar Overlay for Mobile/Drawer effect */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-white border-r border-[#E9ECEF] z-50 flex flex-col shadow-2xl shadow-black/10"
          >
            <div className="p-8 border-b border-[#E9ECEF]">
              <div className="flex items-center justify-between mb-6">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => navigate('/')}
                >
                  <div className="w-10 h-10 bg-premium-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tighter flex items-center gap-1 lowercase">
                      <span 
                        className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent italic inline-block"
                        style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                      >
                        lucky
                      </span>
                      <span className="text-[#1A1A1A]">panel</span>
                    </h1>
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-400 -mt-1 lowercase">management engine v2</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-xl bg-zinc-50 text-zinc-400 hover:text-zinc-600 transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
              {sidebarItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3.5 p-4 rounded-2xl transition-all group relative",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-inner" 
                      : "text-zinc-500 hover:bg-[#F1F3F5] hover:text-[#1A1A1A]"
                  )}
                >
                   {({ isActive }) => (
                     <>
                        <item.icon className={cn(
                          "w-5 h-5 transition-transform group-hover:scale-110",
                          isActive ? "text-primary stroke-[2.5px]" : "opacity-60"
                        )} />
                        <span className={cn(
                          "text-sm font-black lowercase tracking-tight",
                          isActive ? "translate-x-1" : ""
                        )}>{item.label}</span>
                        {isActive && (
                           <motion.div 
                             layoutId="sidebar-indicator"
                             className="absolute left-0 w-1.5 h-8 bg-primary rounded-r-full"
                           />
                        )}
                     </>
                   )}
                </NavLink>
              ))}
            </nav>

            <div className="p-6 border-t border-[#E9ECEF] bg-[#F8F9FA]/50">
              <button 
                onClick={() => navigate('/')}
                className="w-full h-14 bg-white border border-[#E9ECEF] rounded-2xl flex items-center justify-center gap-3 text-zinc-900 font-black text-xs uppercase tracking-widest hover:bg-[#F1F3F5] hover:border-zinc-300 transition-all active:scale-95 shadow-sm"
              >
                <LogOut className="w-4 h-4 text-zinc-400" />
                Exit Panel
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E9ECEF] px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={cn(
                "p-2.5 rounded-xl bg-[#F1F3F5] text-zinc-600 hover:bg-[#E9ECEF] transition-all active:scale-90",
                isSidebarOpen && "opacity-0 pointer-events-none"
              )}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
               <h2 className="text-xl font-black lowercase tracking-tight text-[#1A1A1A]">lucky dashboard</h2>
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest -mt-1 lowercase">live system overview</p>
            </div>
          </div>


          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-right text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1 lowercase">system admin</p>
               <p className="text-sm font-black text-[#1A1A1A] lowercase tracking-tight">pius tech</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-premium-gradient p-[1px]">
               <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pius" alt="Admin" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-8 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
