import { GoogleGenAI } from "@google/genai";

const FALLBACK_VERSES = [
  "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future. - Jeremiah 29:11",
  "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint. - Isaiah 40:31",
  "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight. - Proverbs 3:5-6",
  "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. - Psalm 23:1-2",
  "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go. - Joshua 1:9",
  "I can do all this through him who gives me strength. - Philippians 4:13",
  "And we know that in all things God works for the good of those who love him, who have been called according to his purpose. - Romans 8:28",
  "Come to me, all you who are weary and burdened, and I will give you rest. - Matthew 11:28"
];

/**
 * Generates a short, inspiring Bible verse.
 */
export const generateBibleVerse = async (): Promise<string> => {
  try {
    // Initializing Gemini API with named apiKey parameter as required.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Request a random inspiring verse using the recommended gemini-3-flash-preview for text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a short, inspiring, and encouraging Bible verse suitable for reflection and new beginnings. Return ONLY the verse text followed by " - " and the reference (e.g. "Verse text. - John 3:16"). Do not include any other text or markdown.`,
      config: {
        maxOutputTokens: 100, // Increased to ensure long verses are not truncated.
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster responses on simple tasks.
        temperature: 1.0, 
      }
    });

    // Access the .text property directly (not as a method) as per Gemini API guidelines.
    return response.text || FALLBACK_VERSES[Math.floor(Math.random() * FALLBACK_VERSES.length)];
  } catch (error: any) {
    // Gracefully handle errors without spamming the console with stack traces
    const isQuotaError = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
    
    if (isQuotaError) {
      console.warn("Gemini API Quota Exceeded. Using offline verses collection.");
    } else {
      // Log a simplified error for network/server issues
      console.warn("Gemini API unavailable (using offline mode):", error instanceof Error ? error.message : "Unknown error");
    }

    // Return a random fallback verse
    return FALLBACK_VERSES[Math.floor(Math.random() * FALLBACK_VERSES.length)];
  }
};
