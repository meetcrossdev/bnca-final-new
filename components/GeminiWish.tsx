import React, { useState, useEffect } from 'react';
import { generateBibleVerse } from '../services/geminiService';
import { BookOpen } from 'lucide-react';

interface GeminiWishProps {
  timezone: string; // Kept for compatibility with parent usage
}

export const GeminiWish: React.FC<GeminiWishProps> = () => {
  const [verseData, setVerseData] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchVerse = async () => {
    try {
      // We don't set loading to true here to prevent flickering between updates
      const text = await generateBibleVerse();
      if (text) {
        setVerseData(text);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch verse", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerse(); // Initial fetch

    // Update every 60 seconds to respect API rate limits (Free tier is often ~15 RPM, but let's be safe)
    const interval = setInterval(fetchVerse, 60000);

    return () => clearInterval(interval);
  }, []);

  // Parse the verse to separate text and reference if possible
  const separatorIndex = verseData.lastIndexOf(" - ");
  const verseText = separatorIndex > -1 ? verseData.substring(0, separatorIndex).replace(/^"|"$/g, '') : verseData;
  const verseRef = separatorIndex > -1 ? verseData.substring(separatorIndex + 3) : "";

  return (
    <div className="max-w-2xl w-full mx-auto mt-12 p-8 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-700/50 text-center transition-all duration-700 hover:bg-slate-800/50 hover:border-slate-600 group min-h-[180px] flex flex-col justify-center relative overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
           <div className="w-8 h-8 rounded-full bg-slate-700/50"></div>
           <div className="h-4 w-3/4 bg-slate-700/50 rounded"></div>
           <div className="h-4 w-1/2 bg-slate-700/50 rounded"></div>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-1000">
           <BookOpen className="w-6 h-6 text-gold-500/80 mb-4" />
           
           <blockquote className="text-xl md:text-2xl font-serif text-slate-200 italic leading-relaxed drop-shadow-md px-4">
            "{verseText}"
           </blockquote>
           
           {verseRef && (
             <cite className="mt-4 text-sm font-bold text-gold-500 uppercase tracking-widest not-italic">
               {verseRef}
             </cite>
           )}
           
           <div className="absolute bottom-0 left-0 h-0.5 bg-slate-700/30 w-full">
             <div className="h-full bg-gold-500/30 animate-[width_60s_linear_infinite]" style={{ width: '0%' }}></div>
           </div>
        </div>
      )}
    </div>
  );
};