import React, { useState, useEffect, useRef } from 'react';
import { useTimezoneTimer } from './hooks/useTimezoneTimer';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { GeminiWish } from './components/GeminiWish';
import { Fireworks } from './components/Fireworks';
import { Minimize2 } from 'lucide-react';
import { playNewYearChime, setMasterVolume } from './services/audioService';

const App: React.FC = () => {
  // Default to local timezone if possible, otherwise UTC
  const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  
  const [timezone, setTimezone] = useState<string>(defaultTimezone);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true); // Sound default ON
  const [volume, setVolume] = useState(0.7); // Volume default 70%
  
  const realTimeLeft = useTimezoneTimer(timezone);
  const appRef = useRef<HTMLDivElement>(null);

  // Sync volume state with the audio service
  useEffect(() => {
    setMasterVolume(isSoundEnabled ? volume : 0);
  }, [volume, isSoundEnabled]);

  // Determine display time based on preview mode
  const timeLeft = isPreviewMode ? {
      ...realTimeLeft,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isNewYear: true,
  } : realTimeLeft;

  // Sound trigger for New Year moment
  useEffect(() => {
    if (timeLeft.isNewYear && isSoundEnabled) {
      playNewYearChime();
    }
  }, [timeLeft.isNewYear, isSoundEnabled]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      if (appRef.current) {
        try {
          await appRef.current.requestFullscreen();
        } catch (err) {
          console.error("Error attempting to enable full-screen mode:", err);
        }
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  return (
    <div 
      ref={appRef}
      className={`min-h-screen w-full flex flex-col items-center justify-center relative bg-slate-950 overflow-hidden transition-all duration-500`}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Fireworks Overlay */}
      {timeLeft.isNewYear && <Fireworks isSoundEnabled={isSoundEnabled} />}

      {/* Header - Hidden in Full Screen */}
      <header className={`absolute top-0 w-full p-8 flex justify-between items-center transition-opacity duration-500 ${isFullScreen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/50">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-2xl font-sans font-bold text-slate-200 tracking-tight">Meetcross Ministry</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className={`z-10 relative flex flex-col items-center w-full px-4 transition-all duration-500 ${isFullScreen ? 'max-w-full' : 'max-w-7xl'}`}>
        
        {/* Full Screen Exit Button */}
        {isFullScreen && (
            <button 
                onClick={toggleFullScreen}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors opacity-50 hover:opacity-100 z-50"
            >
                <Minimize2 className="w-8 h-8" />
            </button>
        )}

        {/* Timer */}
        <div className="mb-12">
           <TimerDisplay timeLeft={timeLeft} isFullScreen={isFullScreen} />
           
           {/* Timezone Label in Full Screen only */}
           {isFullScreen && (
               <div className="text-center mt-8 animate-fade-in text-slate-500 font-mono tracking-widest uppercase opacity-70">
                   {timezone.replace(/_/g, ' ')}
               </div>
           )}
        </div>

        {/* Bible Verse / Gemini Wish - Always Visible */}
        <div className={`w-full transition-all duration-700 ${isFullScreen ? 'opacity-90 max-w-4xl mx-auto' : 'opacity-100 max-w-2xl'}`}>
           <GeminiWish timezone={timezone} />
        </div>
      </main>

      {/* Controls - Bottom Center Floating Dock */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${isFullScreen ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <Controls 
          timezone={timezone} 
          setTimezone={setTimezone} 
          onFullScreen={toggleFullScreen}
          onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
          isPreviewMode={isPreviewMode}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
          volume={volume}
          onVolumeChange={setVolume}
        />
      </div>

      {/* Footer - Bottom Left. Now visible in Full Screen with reduced opacity */}
      <footer className={`absolute bottom-8 left-8 text-slate-600 text-xs transition-opacity duration-500 block ${isFullScreen ? 'opacity-30' : 'opacity-100'}`}>
        <p>&copy; {new Date().getFullYear()} Meetcross Ministry</p>
      </footer>
    </div>
  );
};

export default App;