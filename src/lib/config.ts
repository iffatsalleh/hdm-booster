export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  gasUrl: string;
}

declare global {
  interface Window {
    HDM_CONFIG?: { supabaseUrl?: string; anonKey?: string; gasUrl?: string };
  }
}

const w = typeof window !== 'undefined' ? window.HDM_CONFIG : undefined;
const env = import.meta.env;

export const config: AppConfig = {
  supabaseUrl: w?.supabaseUrl ?? env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: w?.anonKey ?? env.VITE_SUPABASE_ANON_KEY ?? '',
  gasUrl: w?.gasUrl ?? env.VITE_GAS_URL ?? '',
};
