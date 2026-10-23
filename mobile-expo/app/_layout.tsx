import React,{useEffect} from 'react';
import {Stack,router} from 'expo-router';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useFonts,Cairo_400Regular,Cairo_700Bold} from '@expo-google-fonts/cairo';
import {StatusBar} from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import * as Linking from 'expo-linking';
import {AppProviders,useSettings} from '../src/providers/Theme';
import {AuthProvider,completeAuthURL,useAuth} from '../src/providers/Auth';
import {Loading} from '../src/components/UI';
if(process.env.EXPO_PUBLIC_SENTRY_DSN)Sentry.init({dsn:process.env.EXPO_PUBLIC_SENTRY_DSN,sendDefaultPii:false,enableAutoSessionTracking:true,tracesSampleRate:0.1});
function Routes(){const {ready}=useSettings();const {setRecovery}=useAuth();useEffect(()=>{const handle=(url:string)=>{if(!url.includes('auth/callback'))return;void completeAuthURL(url).then(()=>{const recovery=url.includes('type=recovery');if(recovery)setRecovery(true);router.replace(recovery?'/reset-password':'/');}).catch(()=>router.replace('/auth/callback'));};const sub=Linking.addEventListener('url',e=>handle(e.url));void Linking.getInitialURL().then(url=>{if(url)handle(url);});return ()=>sub.remove();},[setRecovery]);if(!ready)return <Loading/>;return <><StatusBar style="auto"/><Stack screenOptions={{headerShown:false}}><Stack.Screen name="(tabs)"/><Stack.Screen name="auth"/><Stack.Screen name="onboarding"/><Stack.Screen name="product/[id]"/><Stack.Screen name="merchant"/><Stack.Screen name="admin"/></Stack></>;}
function Root(){const [fonts,error]=useFonts({Cairo_400Regular,Cairo_700Bold});if(!fonts&&!error)return null;return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><AppProviders><AuthProvider><Routes/></AuthProvider></AppProviders></SafeAreaProvider></GestureHandlerRootView>;}
export default Sentry.wrap(Root);