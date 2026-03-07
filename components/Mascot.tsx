import React from 'react';

const Mascot: React.FC<{ size?: string; className?: string }> = ({ size = "w-48 h-48", className = "" }) => {
  return (
    <div className={`relative ${size} ${className} animate-float`}>
      {/* Robot Body */}
      <div className="absolute inset-0 bg-joy-400 rounded-full shadow-lg border-4 border-joy-300 overflow-hidden">
        {/* Subtle Glow */}
        <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-white/20 rounded-full blur-2xl"></div>
        
        {/* Face Area */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-sky-100 rounded-3xl border-2 border-sky-200 flex flex-col items-center justify-center gap-2">
          {/* Eyes */}
          <div className="flex gap-6">
            <div className="w-4 h-6 bg-sky-900 rounded-full animate-pulse"></div>
            <div className="w-4 h-6 bg-sky-900 rounded-full animate-pulse"></div>
          </div>
          {/* Smile */}
          <div className="w-8 h-2 border-b-2 border-sky-900 rounded-full"></div>
        </div>
      </div>
      
      {/* Antenna */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-6 bg-joy-600 rounded-full">
        <div className="absolute -top-2 -left-1.5 w-4 h-4 bg-warm-100 rounded-full shadow-sm border border-warm-200"></div>
      </div>
      
      {/* Arms */}
      <div className="absolute top-1/2 -left-4 w-6 h-12 bg-joy-500 rounded-full border-2 border-joy-600 -rotate-12"></div>
      <div className="absolute top-1/2 -right-4 w-6 h-12 bg-joy-500 rounded-full border-2 border-joy-600 rotate-12"></div>
    </div>
  );
};

export default Mascot;
