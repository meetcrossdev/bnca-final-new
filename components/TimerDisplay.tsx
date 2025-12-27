import React from 'react';
import { TimeLeft } from '../types';

interface TimerBlockProps {
  value: number;
  label: string;
  highlight?: boolean;
  isFullScreen: boolean;
}

const TimerBlock = ({ value, label, highlight, isFullScreen }: TimerBlockProps) => (
  <div className="flex flex-col items-center flex-1 min-w-0 transition-all duration-500">
    <div className={`relative flex items-center justify-center font-mono font-bold leading-none transition-all duration-500
      ${highlight ? 'text-gold-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'text-slate-100'}
      ${isFullScreen 
        ? 'text-[12vw] sm:text-[14vw] md:text-[15vw] lg:text-[16vh]' 
        : 'text-[10vw] sm:text-7xl md:text-8xl lg:text-9xl'
      }`}>
      {String(value).padStart(2, '0')}
    </div>
    <span className={`uppercase tracking-[0.2em] text-slate-500 font-sans font-semibold transition-all duration-500 
      ${isFullScreen ? 'mt-2 text-[1.5vw] md:text-xl lg:text-2xl' : 'mt-2 text-[2vw] sm:text-xs md:text-sm'}`}>
      {label}
    </span>
  </div>
);

const Separator = ({ isFullScreen }: { isFullScreen: boolean }) => (
  <div className={`text-slate-800 font-thin flex items-center justify-center transition-all duration-500
    ${isFullScreen 
      ? 'text-[8vw] mb-8' 
      : 'text-4xl sm:text-6xl md:text-7xl mb-6'
    }`}>
    :
  </div>
);

interface TimerDisplayProps {
  timeLeft: TimeLeft;
  isFullScreen: boolean;
}

export const TimerDisplay = ({ timeLeft, isFullScreen }: TimerDisplayProps) => {
  if (timeLeft.isNewYear) {
    return (
      <div className="flex flex-col items-center justify-center animate-bounce z-50 relative w-full px-4">
        <h1 className="text-[8vw] sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-600 drop-shadow-2xl text-center leading-tight">
          HAPPY NEW YEAR{' '}
          <span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
            {timeLeft.nextYear}
          </span>
        </h1>
      </div>
    );
  }

  return (
    <div className={`flex flex-nowrap items-center justify-center w-full max-w-full px-2 sm:px-4 gap-1 sm:gap-2 md:gap-4 lg:gap-8 transition-all duration-700`}>
      <TimerBlock value={timeLeft.days} label="Days" isFullScreen={isFullScreen} />
      <Separator isFullScreen={isFullScreen} />
      <TimerBlock value={timeLeft.hours} label="Hours" isFullScreen={isFullScreen} />
      <Separator isFullScreen={isFullScreen} />
      <TimerBlock value={timeLeft.minutes} label="Mins" isFullScreen={isFullScreen} />
      <Separator isFullScreen={isFullScreen} />
      <TimerBlock value={timeLeft.seconds} label="Secs" highlight={true} isFullScreen={isFullScreen} />
    </div>
  );
};