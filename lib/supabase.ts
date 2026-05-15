import { createClient } from "@supabase/supabase-js";

// Fallback to hardcoded values in case the Next.js server hasn't been restarted since .env.local was created
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uecxiaimsdlhsqasmphk.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY3hpYWltc2RsaHNxYXNtcGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MzcwOTksImV4cCI6MjA5NDMxMzA5OX0.Z-lmt8c4_1acMA6x75FaT09bypjKH4WfOhPd_OQzhFU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
  global: {
    fetch: (url, options) => {
      return fetch(url, { ...options, cache: "no-store" });
    },
  },
});
