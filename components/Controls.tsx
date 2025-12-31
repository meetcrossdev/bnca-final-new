import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Maximize, Globe, Sparkles, Volume2, VolumeX, Search, X, MapPin } from 'lucide-react';

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

const supportedTimezones = (Intl as any).supportedValuesOf 
  ? (Intl as any).supportedValuesOf('timeZone') 
  : ['UTC'];

// Mapping for countries to primary timezones
const COUNTRY_ALIASES: Record<string, string> = {
  "oman": "Asia/Muscat",
  "iran": "Asia/Tehran",
  "united arab emirates": "Asia/Dubai",
  "uae": "Asia/Dubai",
  "saudi arabia": "Asia/Riyadh",
  "qatar": "Asia/Qatar",
  "kuwait": "Asia/Kuwait",
  "bahrain": "Asia/Bahrain",
  "egypt": "Africa/Cairo",
  "india": "Asia/Kolkata",
  "pakistan": "Asia/Karachi",
  "bangladesh": "Asia/Dhaka",
  "turkey": "Europe/Istanbul",
  "germany": "Europe/Berlin",
  "italy": "Europe/Rome",
  "spain": "Europe/Madrid",
  "france": "Europe/Paris",
  "japan": "Asia/Tokyo",
  "south korea": "Asia/Seoul",
  "china": "Asia/Shanghai",
  "australia": "Australia/Sydney",
  "canada": "America/Toronto",
  "uk": "Europe/London",
  "united kingdom": "Europe/London",
  "russia": "Europe/Moscow",
  "brazil": "America/Sao_Paulo",
  "mexico": "America/Mexico_City",
  "indonesia": "Asia/Jakarta",
  "thailand": "Asia/Bangkok",
  "vietnam": "Asia/Ho_Chi_Minh",
  "philippines": "Asia/Manila",
  "malaysia": "Asia/Kuala_Lumpur",
  "singapore": "Asia/Singapore",
  "nigeria": "Africa/Lagos",
  "south africa": "Africa/Johannesburg",
  "kenya": "Africa/Nairobi",
  "israel": "Asia/Jerusalem",
  "jordan": "Asia/Amman",
  "lebanon": "Asia/Beirut"
};

// Comprehensive US State to IANA Mapping
const US_STATE_MAPPINGS: Record<string, string[]> = {
  "alabama": ["America/Chicago"],
  "alaska": ["America/Anchorage", "America/Adak", "America/Juneau", "America/Metlakatla", "America/Nome", "America/Sitka", "America/Yakutat"],
  "arizona": ["America/Phoenix"],
  "arkansas": ["America/Chicago"],
  "california": ["America/Los_Angeles"],
  "colorado": ["America/Denver"],
  "connecticut": ["America/New_York"],
  "delaware": ["America/New_York"],
  "florida": ["America/New_York", "America/Chicago"],
  "georgia": ["America/New_York"],
  "hawaii": ["Pacific/Honolulu"],
  "idaho": ["America/Boise", "America/Denver"],
  "illinois": ["America/Chicago"],
  "indiana": ["America/Indiana/Indianapolis", "America/Indiana/Knox", "America/Indiana/Marengo", "America/Indiana/Petersburg", "America/Indiana/Tell_City", "America/Indiana/Vevay", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Chicago"],
  "iowa": ["America/Chicago"],
  "kansas": ["America/Chicago", "America/Denver"],
  "kentucky": ["America/Kentucky/Louisville", "America/Kentucky/Monticello", "America/New_York", "America/Chicago"],
  "louisiana": ["America/Chicago"],
  "maine": ["America/New_York"],
  "maryland": ["America/New_York"],
  "massachusetts": ["America/New_York"],
  "michigan": ["America/Detroit", "America/Menominee", "America/New_York", "America/Chicago"],
  "minnesota": ["America/Chicago"],
  "mississippi": ["America/Chicago"],
  "missouri": ["America/Chicago"],
  "montana": ["America/Denver"],
  "nebraska": ["America/Chicago", "America/Denver"],
  "nevada": ["America/Los_Angeles"],
  "new hampshire": ["America/New_York"],
  "new jersey": ["America/New_York"],
  "new mexico": ["America/Denver"],
  "new york": ["America/New_York"],
  "north carolina": ["America/New_York"],
  "north dakota": ["America/North_Dakota/Beulah", "America/North_Dakota/Center", "America/North_Dakota/New_Salem", "America/Chicago"],
  "ohio": ["America/New_York"],
  "oklahoma": ["America/Chicago"],
  "oregon": ["America/Los_Angeles", "America/Boise"],
  "pennsylvania": ["America/New_York"],
  "rhode island": ["America/New_York"],
  "south carolina": ["America/New_York"],
  "south dakota": ["America/Chicago", "America/Denver"],
  "tennessee": ["America/Chicago", "America/New_York"],
  "texas": ["America/Chicago", "America/Denver"],
  "utah": ["America/Denver"],
  "vermont": ["America/New_York"],
  "virginia": ["America/New_York"],
  "washington": ["America/Los_Angeles"],
  "west virginia": ["America/New_York"],
  "wisconsin": ["America/Chicago"],
  "wyoming": ["America/Denver"],
  "dc": ["America/New_York"],
  "district of columbia": ["America/New_York"]
};

const POPULAR_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Muscat',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Australia/Sydney'
];

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
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectorRef = useRef<HTMLDivElement>(null);

  // Reverse mapping to find state/country name for display
  const getLocationDetails = (tz: string) => {
    // Check Countries
    const countryEntry = Object.entries(COUNTRY_ALIASES).find(([_, value]) => value === tz);
    if (countryEntry) return { type: 'Country', name: countryEntry[0].charAt(0).toUpperCase() + countryEntry[0].slice(1) };
    
    // Check US States
    const stateEntry = Object.entries(US_STATE_MAPPINGS).find(([_, zones]) => zones.includes(tz));
    if (stateEntry) return { type: 'State', name: stateEntry[0].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') };

    return null;
  };

  const filteredTimezones = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return supportedTimezones;

    // 1. Match US States
    const stateMatches: string[] = [];
    Object.entries(US_STATE_MAPPINGS).forEach(([state, zones]) => {
      if (state.includes(query)) {
        stateMatches.push(...zones);
      }
    });

    // 2. Match Country Aliases
    const countryMatches = Object.entries(COUNTRY_ALIASES).filter(([country]) => 
      country.includes(query)
    ).map(([_, tz]) => tz);

    // 3. Standard IANA matches (City/Region)
    const standardMatches = supportedTimezones.filter((tz: string) => 
      tz.toLowerCase().includes(query) || 
      tz.replace(/_/g, ' ').toLowerCase().includes(query)
    );

    // Combine all and remove duplicates
    return Array.from(new Set([...stateMatches, ...countryMatches, ...standardMatches]));
  }, [searchQuery]);

  const formatTzDisplay = (tz: string) => {
    const parts = tz.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    const region = parts[0];
    const location = getLocationDetails(tz);
    
    if (location) return `${city} (${location.name})`;
    return `${city} (${region})`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDetectLocation = () => {
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(localTz);
    setIsSelectorOpen(false);
  };

  return (
    <div className="flex flex-row items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl ring-1 ring-white/10">
      
      {/* Searchable Timezone Selector */}
      <div className="relative" ref={selectorRef}>
        <button
          onClick={() => setIsSelectorOpen(!isSelectorOpen)}
          className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2 transition-all w-32 sm:w-56 text-left"
        >
          <Globe className="w-4 h-4 text-gold-400 shrink-0" />
          <span className="truncate flex-1">
            {getLocationDetails(timezone)?.name || timezone.split('/').pop()?.replace(/_/g, ' ') || timezone}
          </span>
          <span className="text-[8px] text-slate-500">▼</span>
        </button>

        {isSelectorOpen && (
          <div className="absolute bottom-full left-0 mb-3 w-64 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-[100]">
            <div className="p-3 border-b border-slate-800 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search state (e.g. California) or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-gold-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button
                onClick={handleDetectLocation}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gold-400 hover:bg-gold-500/10 rounded-lg transition-colors"
              >
                <MapPin className="w-3 h-3" />
                Detect My Timezone
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
              {!searchQuery && (
                <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Popular
                </div>
              )}
              {!searchQuery && POPULAR_TIMEZONES.map(tz => (
                <button
                  key={`pop-${tz}`}
                  onClick={() => { setTimezone(tz); setIsSelectorOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${timezone === tz ? 'bg-gold-500/20 text-gold-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  {formatTzDisplay(tz)}
                </button>
              ))}
              
              <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {searchQuery ? 'Search Results' : 'All Locations'}
              </div>
              {filteredTimezones.map((tz: string) => (
                <button
                  key={tz}
                  onClick={() => { setTimezone(tz); setIsSelectorOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${timezone === tz ? 'bg-gold-500/20 text-gold-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  {formatTzDisplay(tz)}
                </button>
              ))}
              {filteredTimezones.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  No matching states, countries, or cities found
                </div>
              )}
            </div>
          </div>
        )}
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