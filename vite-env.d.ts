// Removed reference to vite/client to fix resolution error.

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Fix: Removed the redeclaration of global 'process'. 
// As per the Google GenAI SDK guidelines, process.env.API_KEY should be used directly and assumed to be available in the execution environment.

export {};
