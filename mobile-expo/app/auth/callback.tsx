import React,{useEffect,useState} from 'react';
import {router,useLocalSearchParams} from 'expo-router';
import * as Linking from 'expo-linking';
import {Platform} from 'react-native';
import {completeAuthURL,authRedirect,useAuth} from '../../src/providers/Auth';
import {Page,Loading,Empty,Button} from '../../src/components/UI';
import {useSettings} from '../../src/providers/Theme';
export default function Callback(){const params=useLocalSearchParams<Record<string,string>>();const {setRecovery}=useAuth();const [error,setError]=useState(false);const {t}=useSettings();useEffect(()=>{void (async()=>{try{const url=Platform.OS==='web'?window.location.href:await Linking.getInitialURL()??`${authRedirect}?${new URLSearchParams(params).toString()}`;await completeAuthURL(url);const recovery=url.includes('type=recovery');if(recovery)setRecovery(true);router.replace(recovery?'/reset-password':'/');}catch{setError(true);}})();},[]);return <Page>{error?<Empty title={t('تعذر إكمال الدخول، حاول مجددًا','Unable to finish sign-in. Please retry.')} action={<Button onPress={()=>router.replace('/auth')}>{t('تسجيل الدخول','Sign in')}</Button>}/>:<Loading/>}</Page>;}