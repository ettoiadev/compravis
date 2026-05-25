import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yukptmxshbqqpalcrqde.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1a3B0bXhzaGJxcXBhbGNycWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NDU3OTAsImV4cCI6MjA5NTIyMTc5MH0.Ta8zUp0R7Sx0I_R0fUzy66UcDHsFnYjNgVqlogm16PY"
  );
}
