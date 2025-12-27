import { TimeLeft } from '../types';

interface TimerDisplayProps {
  timeLeft: TimeLeft;
  isFullScreen: boolean;
}

interface TimerBlockProps {
  value: number;
  label: string;
  highlight?: boolean;
  isFullScreen: boolean;
}

const TimerBlock = ({
  value,
  label,
  highlight = false,
  isFullScreen,
}: TimerBlockProps) => (
  <div
    className={`flex flex-col items-center transition-all duration-500 ${
      isFullScreen ? 'mx-3 sm:mx-6 md:mx-12' : 'mx-2 sm:mx-6 md:mx-10'
    }`}
  >
    <div
      className={`relative flex items-center justify-center font-mono font-bold
        ${
          highlight
            ? 'text-gold-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]'
            : 'text-slate-100'
        }
        ${
          isFullScreen
            ? 'text-[5rem] sm:text-[8rem] md:text-[12rem] lg:text-[18rem]'
            : 'text-6xl sm:text-8xl md:text-9xl lg:text-[10rem]'
        }
        leading-none transition-all duration-500`}
    >
      {String(value).padStart(2, '0')}
    </div>

    <span
      className={`uppercase tracking-[0.3em] text-slate-500 font-sans font-semibold transition-all duration-500 ${
        isFullScreen
          ? 'mt-4 text-sm sm:text-xl md:text-3xl'
          : 'mt-4 text-xs sm:text-sm md:text-xl'
      }`}
    >
      {label}
    </span>
  </div>
);

export const TimerDisplay = ({
  timeLeft,
  isFullScreen,
}: TimerDisplayProps) => {
  if (timeLeft.isNewYear) {
    return (
      <div className="flex flex-col items-center justify-center animate-bounce z-50 relative w-full px-2">
        <h1 className="text-[7vw] sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-600 drop-shadow-2xl text-center leading-tight whitespace-nowrap">
          HAPPY NEW YEAR{' '}
          <span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
            {timeLeft.nextYear}
          </span>
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center items-center w-full transition-all duration-700">
      <TimerBlock
        value={timeLeft.days}
        label="Days"
        isFullScreen={isFullScreen}
      />

      <span
        className={`text-slate-700 font-light -mt-8 hidden sm:block transition-all duration-500 ${
          isFullScreen ? 'text-[4rem] md:text-[10rem]' : 'text-4xl md:text-8xl'
        }`}
      >
        :
      </span>

      <TimerBlock
        value={timeLeft.hours}
        label="Hours"
        isFullScreen={isFullScreen}
      />

      <span
        className={`text-slate-700 font-light -mt-8 hidden sm:block transition-all duration-500 ${
          isFullScreen ? 'text-[4rem] md:text-[10rem]' : 'text-4xl md:text-8xl'
        }`}
      >
        :
      </span>

      <TimerBlock
        value={timeLeft.minutes}
        label="Minutes"
        isFullScreen={isFullScreen}
      />

      <span
        className={`text-slate-700 font-light -mt-8 hidden sm:block transition-all duration-500 ${
          isFullScreen ? 'text-[4rem] md:text-[10rem]' : 'text-4xl md:text-8xl'
        }`}
      >
        :
      </span>

      <TimerBlock
        value={timeLeft.seconds}
        label="Seconds"
        highlight
        isFullScreen={isFullScreen}
      />
    </div>
  );
};
