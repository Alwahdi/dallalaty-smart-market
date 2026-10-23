import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import {Platform} from 'react-native';
import type {Database} from './database';
const memory=new Map<string,string>();
const storage={
 async getItem(key:string){if(Platform.OS==='web')return typeof localStorage==='undefined'?memory.get(key)??null:localStorage.getItem(key);const count=Number(await SecureStore.getItemAsync(`${key}.count`));if(!count||count>100)return null;const chunks=await Promise.all(Array.from({length:count},(_,i)=>SecureStore.getItemAsync(`${key}.${i}`)));return chunks.some(c=>c===null)?null:chunks.join('');},
 async setItem(key:string,value:string){if(Platform.OS==='web'){if(typeof localStorage!=='undefined')localStorage.setItem(key,value);else memory.set(key,value);return;}const old=Number(await SecureStore.getItemAsync(`${key}.count`))||0;const chunks=value.match(/.{1,1500}/gs)??[];await SecureStore.deleteItemAsync(`${key}.count`);for(let i=0;i<chunks.length;i++){const part=chunks[i];if(part!==undefined)await SecureStore.setItemAsync(`${key}.${i}`,part);}await SecureStore.setItemAsync(`${key}.count`,String(chunks.length));for(let i=chunks.length;i<old;i++)await SecureStore.deleteItemAsync(`${key}.${i}`);},
 async removeItem(key:string){if(Platform.OS==='web'){if(typeof localStorage!=='undefined')localStorage.removeItem(key);memory.delete(key);return;}const count=Number(await SecureStore.getItemAsync(`${key}.count`))||0;await SecureStore.deleteItemAsync(`${key}.count`);for(let i=0;i<count;i++)await SecureStore.deleteItemAsync(`${key}.${i}`);}
};
export const configured=Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL&&process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY&&!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.startsWith('replace_'));
export const supabase=createClient<Database>(process.env.EXPO_PUBLIC_SUPABASE_URL||'https://iuedkuihqogkcxappwzs.supabase.co',process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY||'configuration-required',{auth:{storage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false,flowType:'pkce'}});
export type Product=Database['public']['Tables']['properties']['Row'];export type Profile=Database['public']['Tables']['profiles']['Row'];export type Category=Database['public']['Tables']['categories']['Row'];export type Role=Database['public']['Enums']['app_role'];
export function check(error:{message:string}|null){if(error)throw new Error(error.message);}
