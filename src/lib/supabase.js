import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/** 店舗ログインIDからメール形式に変換（Supabase Auth用） */
export const loginIdToEmail = (loginId) => `${loginId}@store.halalfoodmaps.app`;

/** メールから店舗ログインIDを取得 */
export const emailToLoginId = (email) => {
  if (!email?.endsWith('@store.halalfoodmaps.app')) return null;
  return email.replace('@store.halalfoodmaps.app', '');
};
