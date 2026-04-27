import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    localStorage.setItem('lucky_tips_onboarding', 'true');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between p-6 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center space-y-8 max-w-md mx-auto">
        
        {/* Slanted Image Grid */}
        <div className="relative w-full h-[45vh] flex flex-col gap-4 -rotate-6 scale-110">
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full h-1/3 rounded-2xl overflow-hidden border border-white/10"
          >
            <img 
              src="https://picsum.photos/seed/messi_win/800/400" 
              alt="Winner" 
              className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full h-1/3 rounded-2xl overflow-hidden border border-white/10"
          >
            <img 
              src="https://picsum.photos/seed/soccer_passion/800/400" 
              alt="Passion" 
              className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="w-full h-1/3 rounded-2xl overflow-hidden border border-white/10"
          >
            <img 
              src="https://picsum.photos/seed/victory_goal/800/400" 
              alt="Victory" 
              className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        {/* Text Section */}
        <div className="w-full text-left space-y-4 pt-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-4xl font-black leading-[1.1] tracking-tighter"
          >
            YOUR WINNING JOURNEY <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">STARTS HERE!</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex gap-1.5"
          >
            <div className="w-8 h-1 rounded-full bg-primary" />
            <div className="w-2 h-1 rounded-full bg-zinc-800" />
            <div className="w-2 h-1 rounded-full bg-zinc-800" />
          </motion.div>
        </div>
      </div>

      {/* Button Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="w-full max-w-md mx-auto"
      >
        <button 
          onClick={handleGetStarted}
          className="w-full bg-white text-black py-5 rounded-[20px] font-bold text-lg flex items-center justify-center gap-3 group hover:bg-primary hover:text-white transition-all duration-300"
        >
          <span>Get started</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
