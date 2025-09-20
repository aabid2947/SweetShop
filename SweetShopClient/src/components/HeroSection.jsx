import React, { useEffect, useState } from 'react';
import { Sparkles, ShoppingCart, ShieldCheck, Search, Package } from "lucide-react";

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  return (
    <section
      aria-label="Sweet Shop hero"
      className="relative h-screen  w-full  overflow-hidden  border border-slate-800/50 bg-gradient-to-br from-slate-900/95 via-slate-800/80 to-slate-900/95 px-8 shadow-2xl backdrop-blur-xl md:px-12  lg:px-16"
    >
      {/* Enhanced background effects */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Primary glow */}
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-blue-500/8 via-purple-500/4 to-transparent blur-3xl" />
        {/* Secondary accent glow */}
        <div className="absolute right-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-gradient-radial from-amber-400/6 to-transparent blur-2xl" />
        
        {/* Refined dot pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="grid grid-cols-1 items-center  lg:grid-cols-2">
        {/* Left: Content */}
        <div className={`flex flex-col gap-8 transition-all duration-1000 ease-out ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {/* Badge */}
          <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-slate-700/60 bg-slate-800/40 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/80 hover:bg-slate-800/60">
            <Sparkles className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span>TDD Kata • Sweet Management System</span>
          </div>

          {/* Main heading */}
          <h1 className="font-['Inter'] text-xl font-bold tracking-tight text-white md:text-4xl lg:text-6xl ">
            Manage your sweet shop{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              with ease
            </span>
            {' '}and precision
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl font-['Inter'] text-lg font-medium leading-relaxed text-slate-300 md:text-xl lg:text-2xl">
            Complete inventory management, user authentication, and sales tracking system. 
            Built with modern tech stack, comprehensive testing, and clean architecture.
          </p>

          {/* CTA Buttons with slide-up animation */}
          <div className={`flex flex-wrap items-center gap-4 pt-4 transition-all duration-1200 ease-out ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`} style={{ transitionDelay: '300ms' }}>
            <button className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative">Start Managing</span>
            </button>
            
            <button className="group inline-flex items-center justify-center rounded-full border border-slate-600/60 bg-slate-800/40 px-8 py-4 text-base font-semibold text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/80 hover:bg-slate-700/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900">
              View Demo
            </button>
            
            <span className="ml-2 font-['Inter'] text-sm font-medium text-slate-400">
              Full-stack solution
            </span>
          </div>
        </div>

        {/* Right: Enhanced blockchain visual */}
        <div className={`relative mx-auto aspect-square w-full max-w-lg transition-all duration-1000 ease-out ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`} style={{ transitionDelay: '200ms' }}>
          
          {/* Enhanced aura effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-blue-400/15 via-purple-400/8 to-transparent blur-2xl animate-pulse-slow" aria-hidden="true" />

          {/* Grid overlay with better spacing */}
          <div
            className="absolute inset-0 rounded-3xl opacity-20"
            aria-hidden="true"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
            }}
          />

          {/* Rotating orbit ring with improved animation */}
          <div
            className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-600/30 shadow-inner"
            style={{ 
              animation: "spin 40s linear infinite",
              boxShadow: "inset 0 0 40px rgba(59, 130, 246, 0.1)"
            }}
            aria-hidden="true"
          >
            {/* Enhanced orbit tokens */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <Token icon={<ShoppingCart className="h-5 w-5" />} label="Shop" color="amber" />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
              <Token icon={<ShieldCheck className="h-5 w-5" />} label="Secure" color="green" />
            </div>
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2">
              <Token icon={<Search className="h-5 w-5" />} label="Search" color="blue" />
            </div>
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Token icon={<Package className="h-5 w-5" />} label="Inventory" color="purple" />
            </div>
          </div>

          {/* Enhanced center tile */}
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-600/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-2xl backdrop-blur-xl">
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-['Inter'] text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SS
              </span>
            </div>
            {/* Inner glow */}
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
          </div>

          {/* Enhanced sparkles with stagger animation */}
          <Sparkle 
            className="absolute -left-3 top-8 h-7 w-7 text-amber-400 animate-sparkle" 
            style={{ animationDelay: '0s' }}
          />
          <Sparkle 
            className="absolute -right-2 bottom-10 h-6 w-6 text-blue-400 animate-sparkle" 
            style={{ animationDelay: '1s' }}
          />
          <Sparkle 
            className="absolute right-8 top-4 h-5 w-5 text-purple-400 animate-sparkle" 
            style={{ animationDelay: '2s' }}
          />
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        .animate-sparkle {
          animation: sparkle 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          50% { transform: translateY(-10px) translateX(5px); opacity: 1; }
        }
        
        .bg-gradient-radial {
          background: radial-gradient(ellipse at center, var(--tw-gradient-stops));
        }
      `}</style>
    </section>
  );
}

function Token({ icon, label, color }) {
  const colorClasses = {
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-300 shadow-amber-500/20",
    green: "border-green-400/30 bg-green-500/10 text-green-300 shadow-green-500/20",
    blue: "border-blue-400/30 bg-blue-500/10 text-blue-300 shadow-blue-500/20",
    purple: "border-purple-400/30 bg-purple-500/10 text-purple-300 shadow-purple-500/20"
  };

  return (
    <div
      className={`group relative inline-flex h-14 w-14 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 hover:scale-110 ${colorClasses[color]} shadow-lg`}
      title={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
           style={{ boxShadow: `0 0 20px ${color === 'amber' ? '#f59e0b' : color === 'green' ? '#10b981' : color === 'blue' ? '#3b82f6' : '#8b5cf6'}40` }} />
    </div>
  );
}

function Sparkle({ className = "", style = {} }) {
  return (
    <span className={className} style={style} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-full w-full drop-shadow-lg">
        <path 
          d="M12 2l2.2 5.2L19.5 9 14.7 11.9 13 18l-1-6.1L4.5 9l6.3-1.8L12 2z" 
          fill="currentColor" 
          opacity="0.9" 
        />
      </svg>
    </span>
  );
}