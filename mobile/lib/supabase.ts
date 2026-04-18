import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxgabofnectdejnxgbmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4Z2Fib2ZuZWN0ZGVqbnhnYm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0Njc0NjcsImV4cCI6MjA2NTA0MzQ2N30.I4lvh6Z12HAzy4Fp3vhA-fCTc1Ykfbp1o2FtyOwVfwQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
