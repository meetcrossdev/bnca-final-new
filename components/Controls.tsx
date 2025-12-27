import React from 'react';
import { Maximize, Globe, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface ControlsProps {
  timezone: string;
  setTimezone: (tz: string) => void;
  onFullScreen: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
}

// Get all supported timezones with fallback
const supportedTimezones = (Intl as any).supportedValuesOf 
  ? (Intl as any).supportedValuesOf('timeZone') 
  : ['UTC'];

export const Controls = ({ 
  timezone, 
  setTimezone, 
  onFullScreen, 
  onTogglePreview, 
  isPreviewMode,
  isSoundEnabled,
  onToggleSound,
  volume,
  onVolumeChange
}: ControlsProps) => {
  return (
    <div className="flex flex-row items-center gap-2 p-2 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl ring-1 ring-white/10">
      
      {/* Timezone Selector */}
      <div className="relative group shrink-0">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400">
          <Globe className="w-4 h-4" />
        </div>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="appearance-none bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl focus:ring-1 focus:ring-gold-500 focus:border-gold-500 block w-32 sm:w-48 pl-8 pr-6 py-2 transition-colors cursor-pointer outline-none truncate"
        >
          {supportedTimezones.map((tz: string) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
           <span className="text-[8px]">▼</span>
        </div>
      </div>

      <div className="w-px h-6 bg-slate-700/50 mx-1"></div>

      {/* Sound Controls Group */}
      <div className="flex items-center gap-1 sm:gap-2 px-1">
        <button
          onClick={onToggleSound}
          className={`flex items-center justify-center p-2 rounded-xl transition-all ${
              isSoundEnabled 
              ? 'text-gold-400 hover:bg-slate-800' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
          title={isSoundEnabled ? "Mute Sounds" : "Enable Sounds"}
        >
          {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        
        {/* Volume Slider */}
        <div className="hidden sm:flex items-center w-16 md:w-24 px-1 group">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-gold-500 hover:accent-gold-400 transition-all"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>
      </div>

      <div className="w-px h-6 bg-slate-700/50 mx-1"></div>

      {/* Preview Button */}
      <button
        onClick={onTogglePreview}
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all text-xs sm:text-sm font-medium ${
            isPreviewMode 
            ? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/50' 
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
        }`}
        title="Preview Celebration"
      >
        <span className="relative flex h-3 w-3 sm:hidden">
          {isPreviewMode && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>}
          <Sparkles className={`w-3 h-3 ${isPreviewMode ? 'text-gold-400' : 'text-slate-400'}`} />
        </span>
        <Sparkles className={`hidden sm:block w-4 h-4 ${isPreviewMode ? 'animate-pulse' : ''}`} />
        <span className="hidden sm:inline">{isPreviewMode ? 'Stop' : 'Test'}</span>
      </button>

      {/* Full Screen Button */}
      <button
        onClick={onFullScreen}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all text-xs sm:text-sm font-medium"
        title="Enter Full Screen Mode"
      >
        <Maximize className="w-4 h-4" />
        <span className="hidden sm:inline">Full Screen</span>
      </button>

    </div>
  );
};