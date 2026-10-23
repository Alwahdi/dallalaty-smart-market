import React,{createContext,useContext,useEffect,useState} from 'react';
import {I18nManager,Platform,useColorScheme,DevSettings} from 'react-native';
import {MD3DarkTheme,MD3LightTheme,PaperProvider,configureFonts} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
export const palette={light:{background:'hsl(0,0%,99%)',surface:'hsl(0,0%,100%)',surfaceVariant:'hsl(45,15%,94%)',onSurface:'hsl(25,15%,15%)',onSurfaceVariant:'hsl(25,8%,40%)',primary:'hsl(38,80%,30%)',onPrimary:'hsl(0,0%,100%)',secondary:'hsl(145,35%,32%)',error:'hsl(0,72%,40%)',outline:'hsl(40,10%,65%)',outlineVariant:'hsl(40,10%,88%)'},dark:{background:'hsl(25,8%,7%)',surface:'hsl(25,8%,11%)',surfaceVariant:'hsl(25,8%,17%)',onSurface:'hsl(45,20%,95%)',onSurfaceVariant:'hsl(45,10%,72%)',primary:'hsl(45,85%,65%)',onPrimary:'hsl(25,15%,8%)',secondary:'hsl(142,45%,65%)',error:'hsl(0,80%,75%)',outline:'hsl(40,8%,52%)',outlineVariant:'hsl(40,8%,24%)'}};
export const queryClient=new QueryClient({defaultOptions:{queries:{retry:1,staleTime:30_000},mutations:{retry:false}}});
type Mode='system'|'light'|'dark';type Lang='ar'|'en';
const ctx=createContext<{lang:Lang;mode:Mode;setLang:(v:Lang)=>Promise<void>;setMode:(v:Mode)=>void;t:(ar:string,en:string)=>string;ready:boolean;restartRequired:boolean}>({lang:'ar',mode:'system',setLang:async()=>{},setMode:()=>{},t:ar=>ar,ready:false,restartRequired:false});
export function useSettings(){return useContext(ctx);}
export function AppProviders({children}:{children:React.ReactNode}){const system=useColorScheme();const [mode,setModeState]=useState<Mode>('system'),[lang,setLangState]=useState<Lang>('ar'),[ready,setReady]=useState(false),[restartRequired,setRestartRequired]=useState(false);
 function direction(next:Lang){if(Platform.OS==='web'&&typeof document!=='undefined'){document.documentElement.dir=next==='ar'?'rtl':'ltr';document.documentElement.lang=next;}else{I18nManager.allowRTL(true);if(I18nManager.isRTL!==(next==='ar')){I18nManager.forceRTL(next==='ar');setRestartRequired(true);}}}
 useEffect(()=>{void AsyncStorage.multiGet(['theme','language']).then(values=>{const theme=values[0]?.[1],language=values[1]?.[1];if(theme==='light'||theme==='dark'||theme==='system')setModeState(theme);const next=language==='en'?'en':'ar';setLangState(next);direction(next);}).finally(()=>setReady(true));},[]);
 async function setLang(value:Lang){await AsyncStorage.setItem('language',value);setLangState(value);direction(value);if(Platform.OS!=='web'&&__DEV__)DevSettings.reload();}
 function setMode(value:Mode){setModeState(value);void AsyncStorage.setItem('theme',value);}
 const dark=mode==='dark'||(mode==='system'&&system==='dark');const base=dark?MD3DarkTheme:MD3LightTheme;const theme={...base,roundness:2,colors:{...base.colors,...palette[dark?'dark':'light']},fonts:configureFonts({config:{fontFamily:'Cairo_400Regular',letterSpacing:0}})};
 return <QueryClientProvider client={queryClient}><ctx.Provider value={{lang,mode,setLang,setMode,t:(ar,en)=>lang==='ar'?ar:en,ready,restartRequired}}><PaperProvider theme={theme}>{children}</PaperProvider></ctx.Provider></QueryClientProvider>;
}
