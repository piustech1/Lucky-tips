import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Bell, User, Menu, X, Share2, Shield, Phone, MessageSquare, Moon, Sun, Search, Calendar, LayoutGrid, Newspaper } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useTheme } from '../components/ThemeProvider';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function MainLayout({ onLogout }: { onLogout: () => void }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const badgeRef = ref(rtdb, 'notifications_badge');
    const unsubscribe = onValue(badgeRef, (snapshot) => {
      setBadgeCount(snapshot.val() || 0);
    });
    return () => unsubscribe();
  }, []);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Shield, label: 'VIP', path: '/vip' },
    { icon: LayoutGrid, label: 'Sections', path: '/sections' },
    { icon: Newspaper, label: 'Alerts', path: '/notifications', showBadge: true },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const drawerItems = [
    { icon: Shield, label: 'Privacy Policy', path: '/privacy' },
    { icon: Phone, label: 'Contact', path: '/contact' },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
    { icon: Share2, label: 'Share App', onClick: async () => {
      if (navigator.share) {
        try {
          await navigator.share({ 
            title: 'Lucky Tips', 
            text: 'Get the best expert betting tips and analysis with Lucky Tip$!',
            url: window.location.origin 
          });
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            console.error('Error sharing:', error);
          }
        }
      } else {
        // Fallback or alert if share is not supported
        try {
          await navigator.clipboard.writeText(window.location.origin);
          alert('Link copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      }
    }},
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-primary/30 antialiased">
      <ScrollToTop />
      <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--background)] border-b border-[var(--border)] px-4 h-16 flex items-center justify-between max-w-md mx-auto">
        <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5 lowercase">
          <span 
            className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent italic inline-block" 
            style={{ 
              WebkitBackgroundClip: 'text', 
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            lucky
          </span>
          <span className="text-[var(--foreground)]">tip$</span>
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,191,166,0.5)]" />
        </h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/performance')}
            className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] transition-all hover:scale-105 active:scale-95"
          >
            <Calendar className="w-4 h-4 text-[var(--foreground)]" />
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] transition-all hover:scale-105 active:scale-95"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500/10" />
            )}
          </button>
          <button 
            onClick={toggleDrawer}
            className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] transition-all hover:scale-105 active:scale-95"
          >
            <Menu className="w-4 h-4 text-primary" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-4 max-w-md mx-auto min-h-screen">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--border)] px-4 h-20 max-w-md mx-auto flex items-center justify-between shadow-[0_-15px_30px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-1 min-w-[64px] transition-all duration-300 relative py-2",
                isActive ? "text-primary" : "text-[var(--muted-foreground)] opacity-60 hover:opacity-100"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300 relative",
                isActive && "bg-primary/20 shadow-[0_0_20px_rgba(0,191,166,0.1)]"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px] text-primary")} />
                {item.showBadge && badgeCount > 0 && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-[var(--background)] px-1"
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </motion.div>
                )}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-nav-glow"
                  className="absolute -bottom-1 w-6 h-0.5 bg-primary rounded-full shadow-[0_0_12px_rgba(0,191,166,0.8)]"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Side Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleDrawer}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[280px] bg-[var(--background)] border-l border-[var(--border)] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Hero Area */}
              <div className="relative h-48 w-full group">
                <img 
                  src="https://i.pinimg.com/originals/a6/cf/ca/a6cfca6dc3cfa1dd852fb17f8d3676b4.jpg" 
                  alt="Drawer Hero"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-black/40" />
                
                <button 
                  onClick={toggleDrawer}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6 z-10">
                  <h2 className="text-white text-xl font-black italic lowercase tracking-tight leading-none mb-1">
                    lucky tip$ menu
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="h-[2px] w-8 bg-primary rounded-full" />
                    <p className="text-white/60 text-[9px] font-black uppercase tracking-widest lowercase">
                      exclusive betting lounge
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pt-8 space-y-6">
                <div className="space-y-1">
                  <p className="px-4 text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2 lowercase">main navigation</p>
                  {drawerItems.map((item) => (
                    item.onClick ? (
                      <button
                        key={item.label}
                        onClick={() => { item.onClick!(); toggleDrawer(); }}
                        className="flex items-center gap-4 w-full p-4 rounded-2xl hover:bg-[var(--muted)] transition-all text-[var(--foreground)] active:scale-95 group"
                      >
                        <div className="p-2 rounded-xl bg-[var(--muted)] group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black lowercase tracking-tight">{item.label}</span>
                      </button>
                    ) : (
                      <NavLink
                        key={item.label}
                        to={item.path!}
                        onClick={toggleDrawer}
                        className="group"
                      >
                        {({ isActive }) => (
                          <div className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 active:scale-95",
                            isActive ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(0,191,166,0.05)]" : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                          )}>
                            <div className={cn(
                              "p-2 rounded-xl transition-colors",
                              isActive ? "bg-primary text-white" : "bg-[var(--muted)] group-hover:bg-primary/10 transition-colors"
                            )}>
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-black lowercase tracking-tight">{item.label}</span>
                          </div>
                        )}
                      </NavLink>
                    )
                  ))}
                </div>

                {/* Additional Info Block */}
                <div className="px-5 py-6 rounded-[32px] bg-primary/5 border border-primary/10 dark:bg-primary/5 mx-2">
                  <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest mb-3 lowercase text-center">daily summary</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center space-y-1">
                      <p className="text-xl font-black text-primary">85%</p>
                      <p className="text-[8px] font-black text-[var(--muted-foreground)] uppercase tracking-tight lowercase">win rate</p>
                    </div>
                    <div className="text-center space-y-1 border-l border-primary/10">
                      <p className="text-lg font-black text-secondary font-mono">12</p>
                      <p className="text-[8px] font-black text-[var(--muted-foreground)] uppercase tracking-tight lowercase">tips today</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[var(--border)]">
                <button 
                  onClick={() => { onLogout(); toggleDrawer(); }}
                  className="w-full py-4 rounded-2xl bg-premium-gradient text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                  Terminate Session
                </button>
                <div className="flex items-center justify-center gap-2 mt-6">
                   <div className="w-4 h-4 rounded-full bg-premium-gradient animate-pulse shadow-[0_0_10px_rgba(0,191,166,0.5)]" />
                   <p className="text-[9px] text-[var(--muted-foreground)] font-black uppercase tracking-[0.2em] lowercase opacity-50">
                      Lucky Tip$ v1.3
                   </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

